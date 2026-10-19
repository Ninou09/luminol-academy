import { describe, expect, it } from 'vitest';

import { createSkillProgress, type SkillProgress } from './adaptive';
import {
  childGoalsSchema,
  goalStatus,
  summarizeActivity,
  summarizeSkills,
  type Goal,
} from './progress';
import type { SessionRecord, TrialRecord } from './records';

const CHILD = '7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b';
const SESSION = '00000000-0000-4000-8000-000000000001';

function trial(
  minute: number,
  firstTryCorrect: boolean,
  skillId: TrialRecord['skillId'] = 'match-shapes',
): TrialRecord {
  return {
    childId: CHILD,
    sessionId: SESSION,
    skillId,
    level: 1,
    promptLevel: 'independent',
    firstTryCorrect,
    wrongAttempts: firstTryCorrect ? 0 : 1,
    escalatedToGuide: false,
    responseMs: 900,
    at: new Date(Date.UTC(2026, 9, 1, 8, minute)).toISOString(),
  };
}

const results = (pattern: string, start = 0) =>
  [...pattern].map((mark, index) => trial(start + index, mark === '1'));

describe('summarizeSkills', () => {
  it('reports level, help and first-try success per skill', () => {
    const progress: SkillProgress = {
      ...createSkillProgress('match-shapes'),
      level: 3,
      promptLevel: 'partial',
    };
    const [summary] = summarizeSkills(results('1101101111'), [progress]);
    expect(summary).toMatchObject({
      skillId: 'match-shapes',
      level: 3,
      maxLevel: 5,
      promptLevel: 'partial',
      trials: 10,
      recentRate: 0.8,
      trend: null,
    });
  });

  it('compares the latest ten trials with the ten before', () => {
    const up = summarizeSkills(results('0000011111' + '1111111110'), []);
    expect(up[0]?.trend).toBe('up');
    const steady = summarizeSkills(results('1111100000' + '1111000001'), []);
    expect(steady[0]?.trend).toBe('steady');
    const down = summarizeSkills(results('1111111111' + '1110000000'), []);
    expect(down[0]?.trend).toBe('down');
  });

  it('gives no rate with too few trials and lists recent skills first', () => {
    const summaries = summarizeSkills(
      [trial(1, true, 'sort-color'), trial(2, false, 'count-objects')],
      [{ ...createSkillProgress('retired-skill'), level: 2 }],
    );
    expect(summaries.map((summary) => summary.skillId)).toEqual([
      'count-objects',
      'sort-color',
    ]);
    expect(summaries[0]?.recentRate).toBeNull();
  });
});

describe('summarizeActivity', () => {
  it('counts sessions, activities, calm visits and practice days', () => {
    const session = (calmVisits: number): SessionRecord => ({
      id: SESSION,
      childId: CHILD,
      startedAt: '2026-10-01T08:00:00.000Z',
      endedAt: null,
      activitiesCompleted: 3,
      calmVisits,
    });
    const summary = summarizeActivity(
      [session(1), session(0)],
      [
        trial(1, true),
        { ...trial(2, true), at: '2026-10-12T08:00:00.000Z' },
        { ...trial(3, true), at: '2026-08-01T08:00:00.000Z' },
      ],
      new Date('2026-10-15T08:00:00.000Z'),
    );
    expect(summary).toEqual({
      sessions: 2,
      activitiesCompleted: 6,
      calmVisits: 1,
      trialsLast7Days: 1,
      daysPracticedLast30: 2,
    });
  });
});

describe('goals', () => {
  const goal: Goal = {
    id: '00000000-0000-4000-8000-000000000009',
    skillId: 'match-shapes',
    targetLevel: 3,
    createdAt: '2026-10-01T08:00:00.000Z',
  };
  const at = (level: number, promptLevel: SkillProgress['promptLevel']) => ({
    ...createSkillProgress('match-shapes'),
    level,
    promptLevel,
  });

  it('is met at the level without help, or above it', () => {
    expect(goalStatus(goal, null).achieved).toBe(false);
    expect(goalStatus(goal, at(3, 'partial')).achieved).toBe(false);
    expect(goalStatus(goal, at(3, 'independent')).achieved).toBe(true);
    expect(goalStatus(goal, at(4, 'full')).achieved).toBe(true);
  });

  it('limits the target to the levels the skill has', () => {
    expect(goalStatus({ ...goal, targetLevel: 9 }, null).targetLevel).toBe(5);
  });

  it('rejects unknown skills and too many goals', () => {
    expect(
      childGoalsSchema.safeParse({ items: [{ ...goal, skillId: 'flying' }] })
        .success,
    ).toBe(false);
    expect(
      childGoalsSchema.safeParse({
        items: Array.from({ length: 13 }, () => goal),
      }).success,
    ).toBe(false);
  });
});
