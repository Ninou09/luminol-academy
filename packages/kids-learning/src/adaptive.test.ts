import { describe, expect, it } from 'vitest';

import {
  applyTrial,
  assistAtLeast,
  createSkillProgress,
  DEFAULT_ADAPTIVE_CONFIG,
  escalateAssist,
  initialAssist,
  skillProgressSchema,
  type SkillProgress,
  type TrialOutcome,
} from './adaptive';

const NOW = new Date('2026-10-18T09:00:00.000Z');
const correct: TrialOutcome = {
  firstTryCorrect: true,
  escalatedToGuide: false,
};
const missed: TrialOutcome = {
  firstTryCorrect: false,
  escalatedToGuide: false,
};
const guided: TrialOutcome = { firstTryCorrect: false, escalatedToGuide: true };

function run(
  start: SkillProgress,
  outcomes: readonly TrialOutcome[],
  maxLevel = 3,
) {
  let progress = start;
  const changes: string[] = [];
  for (const outcome of outcomes) {
    const update = applyTrial(progress, outcome, maxLevel, NOW);
    progress = update.progress;
    changes.push(update.change);
  }
  return { progress, changes };
}

function independentAt(level: number): SkillProgress {
  return {
    ...createSkillProgress('match-shapes'),
    level,
    promptLevel: 'independent',
  };
}

describe('assist ladder', () => {
  it('starts each prompt level at the matching amount of help', () => {
    expect(initialAssist('full')).toBe('guide');
    expect(initialAssist('partial')).toBe('highlight');
    expect(initialAssist('independent')).toBe('none');
  });

  it('escalates one step at a time and stops at guide', () => {
    expect(escalateAssist('none')).toBe('audio');
    expect(escalateAssist('audio')).toBe('highlight');
    expect(escalateAssist('highlight')).toBe('guide');
    expect(escalateAssist('guide')).toBe('guide');
    expect(assistAtLeast('highlight', 'audio')).toBe(true);
    expect(assistAtLeast('audio', 'highlight')).toBe(false);
  });
});

describe('applyTrial', () => {
  it('starts new skills at level 1 with full help', () => {
    const progress = createSkillProgress('sort-color');
    expect(skillProgressSchema.parse(progress)).toEqual(progress);
    expect(progress).toMatchObject({ level: 1, promptLevel: 'full' });
  });

  it('fades full help to partial and then to independent after streaks', () => {
    const { progress, changes } = run(createSkillProgress('match-shapes'), [
      correct,
      correct,
      correct,
      correct,
      correct,
      correct,
    ]);
    expect(changes).toEqual([
      'none',
      'none',
      'prompt-faded',
      'none',
      'none',
      'prompt-faded',
    ]);
    expect(progress.promptLevel).toBe('independent');
    expect(progress.trialCount).toBe(6);
  });

  it('restarts the fading streak after a missed first try', () => {
    const start = {
      ...createSkillProgress('match-shapes'),
      promptLevel: 'partial' as const,
    };
    const { progress, changes } = run(start, [
      correct,
      correct,
      missed,
      correct,
    ]);
    expect(changes).toEqual(['none', 'none', 'none', 'none']);
    expect(progress).toMatchObject({ promptLevel: 'partial', promptStreak: 1 });
  });

  it('moves up a level at 80% success over the window and restarts with full help', () => {
    const outcomes = [
      correct,
      missed,
      correct,
      correct,
      correct,
      correct,
      correct,
      missed,
      correct,
      correct,
    ];
    const { progress, changes } = run(independentAt(1), outcomes);
    expect(changes.at(-1)).toBe('level-up');
    expect(progress).toMatchObject({
      level: 2,
      promptLevel: 'full',
      recent: [],
    });
  });

  it('does not move up below the success threshold', () => {
    const outcomes = [
      correct,
      missed,
      correct,
      missed,
      correct,
      correct,
      missed,
      correct,
      correct,
      correct,
    ];
    const { progress, changes } = run(independentAt(1), outcomes);
    expect(changes).not.toContain('level-up');
    expect(progress.level).toBe(1);
  });

  it('marks the skill mastered once at the top level instead of moving past it', () => {
    const outcomes = Array.from(
      { length: DEFAULT_ADAPTIVE_CONFIG.windowSize + 1 },
      () => correct,
    );
    const { progress, changes } = run(independentAt(3), outcomes, 3);
    expect(changes.filter((change) => change === 'mastered')).toHaveLength(1);
    expect(progress.level).toBe(3);
    expect(progress.masteredAt).toBe(NOW.toISOString());
  });

  it('adds help before dropping a level when independent trials go poorly', () => {
    const { progress, changes } = run(independentAt(2), [
      missed,
      missed,
      correct,
      missed,
      missed,
    ]);
    expect(changes.at(-1)).toBe('prompt-increased');
    expect(progress).toMatchObject({
      level: 2,
      promptLevel: 'partial',
      recent: [],
    });
  });

  it('drops a level after repeated full guidance when help is already full', () => {
    const start = { ...createSkillProgress('match-shapes'), level: 2 };
    const { progress, changes } = run(start, [guided, guided, guided]);
    expect(changes).toEqual(['none', 'none', 'level-down']);
    expect(progress).toMatchObject({
      level: 1,
      promptLevel: 'partial',
      guidedStreak: 0,
    });
  });

  it('increases help after repeated full guidance at partial help', () => {
    const start = {
      ...createSkillProgress('match-shapes'),
      promptLevel: 'partial' as const,
    };
    const { progress, changes } = run(start, [guided, guided, guided]);
    expect(changes.at(-1)).toBe('prompt-increased');
    expect(progress.promptLevel).toBe('full');
  });

  it('never drops below level 1', () => {
    const { progress, changes } = run(createSkillProgress('match-shapes'), [
      guided,
      guided,
      guided,
    ]);
    expect(changes.at(-1)).toBe('none');
    expect(progress).toMatchObject({
      level: 1,
      promptLevel: 'full',
      guidedStreak: 0,
    });
  });

  it('keeps only the configured window of recent results', () => {
    const outcomes = Array.from({ length: 25 }, (_, index) =>
      index % 2 === 0 ? correct : missed,
    );
    const config = { ...DEFAULT_ADAPTIVE_CONFIG, struggleRatio: 0 };
    let progress = independentAt(1);
    for (const outcome of outcomes) {
      progress = applyTrial(progress, outcome, 3, NOW, config).progress;
    }
    expect(progress.recent).toHaveLength(config.windowSize);
  });

  it('does not mutate the progress it receives', () => {
    const start = independentAt(1);
    const snapshot = structuredClone(start);
    applyTrial(start, missed, 3, NOW);
    expect(start).toEqual(snapshot);
  });
});
