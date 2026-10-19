import { z } from 'zod';

import type { PromptLevel, SkillProgress } from './adaptive';
import { skillIdSchema, type SessionRecord, type TrialRecord } from './records';
import { isSkillId, maxLevel, SKILLS, type SkillId } from './skills';

/** Trials compared in each window of the trend. */
export const TREND_WINDOW = 10;
/** Fewer trials than this in a window give no trend at all. */
export const TREND_MIN_TRIALS = 5;
/** A change in first-try success at least this large counts as a trend. */
export const TREND_THRESHOLD = 0.15;

export type Trend = 'up' | 'steady' | 'down';

export type SkillSummary = {
  skillId: SkillId;
  level: number;
  maxLevel: number;
  promptLevel: PromptLevel;
  trials: number;
  /** Share of first-try successes across the latest window, or null. */
  recentRate: number | null;
  trend: Trend | null;
  lastPracticed: string | null;
};

function firstTryRate(trials: readonly TrialRecord[]): number | null {
  if (trials.length < TREND_MIN_TRIALS) return null;
  return trials.filter((trial) => trial.firstTryCorrect).length / trials.length;
}

/**
 * One summary per skill the child has practised, most recent first. Rates
 * count first-try successes, so help given after a wrong answer never hides
 * a struggle.
 */
export function summarizeSkills(
  trials: readonly TrialRecord[],
  progress: readonly SkillProgress[],
): SkillSummary[] {
  const bySkill = new Map<SkillId, TrialRecord[]>();
  for (const trial of [...trials].sort((a, b) => a.at.localeCompare(b.at))) {
    const list = bySkill.get(trial.skillId) ?? [];
    list.push(trial);
    bySkill.set(trial.skillId, list);
  }
  const progressBySkill = new Map(
    progress
      .filter((entry) => isSkillId(entry.skillId))
      .map((entry) => [entry.skillId as SkillId, entry]),
  );
  const skillIds = new Set<SkillId>([
    ...bySkill.keys(),
    ...progressBySkill.keys(),
  ]);
  return [...skillIds]
    .map((skillId): SkillSummary => {
      const list = bySkill.get(skillId) ?? [];
      const stored = progressBySkill.get(skillId);
      const recent = list.slice(-TREND_WINDOW);
      const previous = list.slice(-2 * TREND_WINDOW, -TREND_WINDOW);
      const recentRate = firstTryRate(recent);
      const previousRate = firstTryRate(previous);
      let trend: Trend | null = null;
      if (recentRate !== null && previousRate !== null) {
        const change = recentRate - previousRate;
        trend =
          change >= TREND_THRESHOLD
            ? 'up'
            : change <= -TREND_THRESHOLD
              ? 'down'
              : 'steady';
      }
      return {
        skillId,
        level: stored?.level ?? 1,
        maxLevel: maxLevel(SKILLS[skillId]),
        promptLevel: stored?.promptLevel ?? 'full',
        trials: list.length,
        recentRate,
        trend,
        lastPracticed: list.at(-1)?.at ?? null,
      };
    })
    .sort((a, b) =>
      (b.lastPracticed ?? '').localeCompare(a.lastPracticed ?? ''),
    );
}

export type ActivitySummary = {
  sessions: number;
  activitiesCompleted: number;
  calmVisits: number;
  trialsLast7Days: number;
  /** Distinct calendar days (UTC) with at least one trial in the last 30. */
  daysPracticedLast30: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function summarizeActivity(
  sessions: readonly SessionRecord[],
  trials: readonly TrialRecord[],
  now: Date,
): ActivitySummary {
  const since = (days: number) => now.getTime() - days * DAY_MS;
  const recent30 = trials.filter((trial) => Date.parse(trial.at) >= since(30));
  return {
    sessions: sessions.length,
    activitiesCompleted: sessions.reduce(
      (total, session) => total + session.activitiesCompleted,
      0,
    ),
    calmVisits: sessions.reduce(
      (total, session) => total + session.calmVisits,
      0,
    ),
    trialsLast7Days: trials.filter((trial) => Date.parse(trial.at) >= since(7))
      .length,
    daysPracticedLast30: new Set(recent30.map((trial) => trial.at.slice(0, 10)))
      .size,
  };
}

export type WeekSummary = {
  /** First and last day of the week, as UTC calendar dates. */
  from: string;
  to: string;
  daysPracticed: number;
  trials: number;
  /** First-try success this week and the week before, or null when thin. */
  firstTryRate: number | null;
  previousFirstTryRate: number | null;
  activitiesCompleted: number;
  calmVisits: number;
  /** Skills practised this week, most trials first. */
  skillsPracticed: SkillId[];
  /** Best first-try success among skills with enough trials, if any. */
  strongestSkill: SkillId | null;
};

/**
 * The parent's weekly report card: the last 7 days against the 7 before.
 * Like the dashboard it counts first tries, so help never hides a struggle.
 */
export function summarizeWeek(
  sessions: readonly SessionRecord[],
  trials: readonly TrialRecord[],
  now: Date,
): WeekSummary {
  const weekStart = now.getTime() - 7 * DAY_MS;
  const inWeek = (at: string) => {
    const time = Date.parse(at);
    return time >= weekStart && time <= now.getTime();
  };
  const week = trials.filter((trial) => inWeek(trial.at));
  const previous = trials.filter((trial) => {
    const time = Date.parse(trial.at);
    return time >= weekStart - 7 * DAY_MS && time < weekStart;
  });
  const weekSessions = sessions.filter((session) => inWeek(session.startedAt));

  const bySkill = new Map<SkillId, TrialRecord[]>();
  for (const trial of week) {
    bySkill.set(trial.skillId, [...(bySkill.get(trial.skillId) ?? []), trial]);
  }
  const skillsPracticed = [...bySkill.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([skillId]) => skillId);
  let strongestSkill: SkillId | null = null;
  let strongestRate = -1;
  for (const skillId of skillsPracticed) {
    const rate = firstTryRate(bySkill.get(skillId) ?? []);
    if (rate !== null && rate > strongestRate) {
      strongestSkill = skillId;
      strongestRate = rate;
    }
  }

  return {
    from: new Date(weekStart).toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
    daysPracticed: new Set(week.map((trial) => trial.at.slice(0, 10))).size,
    trials: week.length,
    firstTryRate: firstTryRate(week),
    previousFirstTryRate: firstTryRate(previous),
    activitiesCompleted: weekSessions.reduce(
      (total, session) => total + session.activitiesCompleted,
      0,
    ),
    calmVisits: weekSessions.reduce(
      (total, session) => total + session.calmVisits,
      0,
    ),
    skillsPracticed,
    strongestSkill,
  };
}

export const MAX_GOALS = 12;

/**
 * A parent's goal: reach a level of a skill and do it without help there.
 * Goals describe what to work towards; they never change the adaptive engine.
 */
export const goalSchema = z.object({
  id: z.uuid(),
  skillId: skillIdSchema,
  targetLevel: z.int().min(1).max(10),
  createdAt: z.iso.datetime(),
});
export type Goal = z.infer<typeof goalSchema>;

export const childGoalsSchema = z.object({
  items: z.array(goalSchema).max(MAX_GOALS),
});
export type ChildGoals = z.infer<typeof childGoalsSchema>;

export type GoalStatus = {
  goal: Goal;
  /** The target, limited to the levels the skill has. */
  targetLevel: number;
  currentLevel: number;
  achieved: boolean;
};

export function goalStatus(
  goal: Goal,
  progress: SkillProgress | null,
): GoalStatus {
  const targetLevel = Math.min(
    goal.targetLevel,
    maxLevel(SKILLS[goal.skillId]),
  );
  const currentLevel = progress?.level ?? 1;
  const achieved =
    currentLevel > targetLevel ||
    (currentLevel === targetLevel && progress?.promptLevel === 'independent');
  return { goal, targetLevel, currentLevel, achieved };
}
