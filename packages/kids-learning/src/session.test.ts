import { describe, expect, it } from 'vitest';

import { firstThen, planSession, skillsForAge } from './session';
import { SKILLS } from './skills';

describe('planSession', () => {
  it('maps session length to a number of activities and ends with a finish step', () => {
    const steps = planSession({
      ageBand: '5-6',
      sessionMinutes: 10,
      previousSessions: 0,
    });
    expect(steps.map((step) => step.kind)).toEqual([
      'activity',
      'activity',
      'activity',
      'finish',
    ]);
    expect(
      planSession({ ageBand: '5-6', sessionMinutes: 20, previousSessions: 0 }),
    ).toHaveLength(6);
  });

  it('rotates the starting activity between sessions', () => {
    const first = planSession({
      ageBand: '3-4',
      sessionMinutes: 5,
      previousSessions: 0,
    });
    const second = planSession({
      ageBand: '3-4',
      sessionMinutes: 5,
      previousSessions: 1,
    });
    expect(first[0]).toMatchObject({ skillId: 'cause-effect' });
    expect(second[0]).toMatchObject({ skillId: 'match-shapes' });
  });

  it('only schedules skills suited to the age band', () => {
    for (const ageBand of ['3-4', '5-6', '7-8', '9-10'] as const) {
      for (const skillId of skillsForAge(ageBand)) {
        expect(SKILLS[skillId].ageBands).toContain(ageBand);
      }
    }
  });

  it('gives activity steps unique ids', () => {
    const steps = planSession({
      ageBand: '3-4',
      sessionMinutes: 20,
      previousSessions: 2,
    });
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
  });
});

describe('firstThen', () => {
  const steps = planSession({
    ageBand: '7-8',
    sessionMinutes: 5,
    previousSessions: 0,
  });

  it('pairs the current step with the next one', () => {
    expect(firstThen(steps, 0)).toEqual({ first: steps[0], then: steps[1] });
    expect(firstThen(steps, 2)).toEqual({ first: steps[2], then: null });
    expect(firstThen(steps, 3)).toBeNull();
  });
});
