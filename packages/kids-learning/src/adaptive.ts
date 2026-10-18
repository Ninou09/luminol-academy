import { z } from 'zod';

/**
 * How much help a child receives before they respond. New levels start with
 * full help and fade towards independence as the child succeeds.
 */
export const PROMPT_LEVELS = ['full', 'partial', 'independent'] as const;
export const promptLevelSchema = z.enum(PROMPT_LEVELS);
export type PromptLevel = z.infer<typeof promptLevelSchema>;

/**
 * Least-to-most help inside a single trial. A wrong response moves one step
 * up; `guide` dims and disables every other choice so the child always ends
 * the trial on the right answer (errorless learning).
 */
export const ASSIST_STEPS = ['none', 'audio', 'highlight', 'guide'] as const;
export const assistStepSchema = z.enum(ASSIST_STEPS);
export type AssistStep = z.infer<typeof assistStepSchema>;

const INITIAL_ASSIST: Record<PromptLevel, AssistStep> = {
  full: 'guide',
  partial: 'highlight',
  independent: 'none',
};

export function initialAssist(promptLevel: PromptLevel): AssistStep {
  return INITIAL_ASSIST[promptLevel];
}

export function escalateAssist(step: AssistStep): AssistStep {
  const index = ASSIST_STEPS.indexOf(step);
  return ASSIST_STEPS[Math.min(index + 1, ASSIST_STEPS.length - 1)] ?? 'guide';
}

export function assistAtLeast(step: AssistStep, minimum: AssistStep): boolean {
  return ASSIST_STEPS.indexOf(step) >= ASSIST_STEPS.indexOf(minimum);
}

export type AdaptiveConfig = {
  /** Independent trials considered when deciding to move up a level. */
  windowSize: number;
  /** Share of independent first-try successes needed to move up. */
  advanceRatio: number;
  /** Most recent independent trials checked for struggle. */
  struggleWindow: number;
  /** Below this share of successes in the struggle window, help increases. */
  struggleRatio: number;
  /** Consecutive first-try successes needed to fade a prompt one step. */
  fadeAfter: number;
  /** Consecutive trials that needed full guidance before help increases. */
  guidedStreakLimit: number;
};

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  windowSize: 10,
  advanceRatio: 0.8,
  struggleWindow: 5,
  struggleRatio: 0.5,
  fadeAfter: 3,
  guidedStreakLimit: 3,
};

export const skillProgressSchema = z.object({
  skillId: z.string().min(1),
  level: z.int().min(1),
  promptLevel: promptLevelSchema,
  /** First-try results of independent trials at the current level. */
  recent: z.array(z.boolean()),
  promptStreak: z.int().min(0),
  guidedStreak: z.int().min(0),
  trialCount: z.int().min(0),
  masteredAt: z.iso.datetime().nullable(),
});
export type SkillProgress = z.infer<typeof skillProgressSchema>;

export function createSkillProgress(skillId: string): SkillProgress {
  return {
    skillId,
    level: 1,
    promptLevel: 'full',
    recent: [],
    promptStreak: 0,
    guidedStreak: 0,
    trialCount: 0,
    masteredAt: null,
  };
}

export const trialOutcomeSchema = z.object({
  /** The first response in the trial was correct. */
  firstTryCorrect: z.boolean(),
  /** Wrong responses moved the trial all the way up to `guide`. */
  escalatedToGuide: z.boolean(),
});
export type TrialOutcome = z.infer<typeof trialOutcomeSchema>;

export type ProgressChange =
  | 'none'
  | 'prompt-faded'
  | 'prompt-increased'
  | 'level-up'
  | 'level-down'
  | 'mastered';

export type ProgressUpdate = {
  progress: SkillProgress;
  change: ProgressChange;
};

function successRatio(results: readonly boolean[]): number {
  if (results.length === 0) return 0;
  return results.filter(Boolean).length / results.length;
}

function resetCounters(progress: SkillProgress): SkillProgress {
  return { ...progress, recent: [], promptStreak: 0, guidedStreak: 0 };
}

/** More help first; only drop a level once the child already has full help. */
function increaseSupport(progress: SkillProgress): ProgressUpdate {
  if (progress.promptLevel === 'independent') {
    return {
      progress: resetCounters({ ...progress, promptLevel: 'partial' }),
      change: 'prompt-increased',
    };
  }
  if (progress.promptLevel === 'partial') {
    return {
      progress: resetCounters({ ...progress, promptLevel: 'full' }),
      change: 'prompt-increased',
    };
  }
  if (progress.level > 1) {
    return {
      progress: resetCounters({
        ...progress,
        level: progress.level - 1,
        promptLevel: 'partial',
      }),
      change: 'level-down',
    };
  }
  return { progress: resetCounters(progress), change: 'none' };
}

function fadePrompt(level: PromptLevel): PromptLevel {
  return level === 'full' ? 'partial' : 'independent';
}

/**
 * Applies one finished trial to a skill's progress. Pure: the caller persists
 * the returned progress.
 */
export function applyTrial(
  current: SkillProgress,
  outcome: TrialOutcome,
  maxLevel: number,
  now: Date,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE_CONFIG,
): ProgressUpdate {
  const counted: SkillProgress = {
    ...current,
    trialCount: current.trialCount + 1,
    guidedStreak: outcome.escalatedToGuide ? current.guidedStreak + 1 : 0,
  };

  if (counted.guidedStreak >= config.guidedStreakLimit) {
    return increaseSupport(counted);
  }

  if (counted.promptLevel !== 'independent') {
    const promptStreak = outcome.firstTryCorrect ? counted.promptStreak + 1 : 0;
    if (promptStreak >= config.fadeAfter) {
      return {
        progress: resetCounters({
          ...counted,
          promptLevel: fadePrompt(counted.promptLevel),
        }),
        change: 'prompt-faded',
      };
    }
    return { progress: { ...counted, promptStreak }, change: 'none' };
  }

  const recent = [...counted.recent, outcome.firstTryCorrect].slice(
    -config.windowSize,
  );
  const withResult: SkillProgress = { ...counted, recent };

  if (
    recent.length >= config.windowSize &&
    successRatio(recent) >= config.advanceRatio
  ) {
    if (withResult.level < maxLevel) {
      return {
        progress: resetCounters({
          ...withResult,
          level: withResult.level + 1,
          promptLevel: 'full',
        }),
        change: 'level-up',
      };
    }
    if (withResult.masteredAt === null) {
      return {
        progress: { ...withResult, masteredAt: now.toISOString() },
        change: 'mastered',
      };
    }
  }

  const struggleSlice = recent.slice(-config.struggleWindow);
  if (
    struggleSlice.length >= config.struggleWindow &&
    successRatio(struggleSlice) < config.struggleRatio
  ) {
    return increaseSupport(withResult);
  }

  return { progress: withResult, change: 'none' };
}
