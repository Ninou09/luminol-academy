import { describe, expect, it } from 'vitest';

import {
  canAddProfile,
  FREE_SKILLS,
  isSkillPlayable,
  playableInterests,
} from './plans';
import { AGE_BANDS } from './profile';
import { enabledSkills, planSession, skillsForAge } from './session';
import { SKILL_IDS } from './skills';

describe('plans', () => {
  it('leaves at least two free activities for every age band', () => {
    for (const ageBand of AGE_BANDS) {
      const free = skillsForAge(ageBand).filter((id) =>
        FREE_SKILLS.includes(id),
      );
      expect(free.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('never schedules a locked activity, even when every free one is off', () => {
    const locked = SKILL_IDS.filter((id) => !isSkillPlayable('free', id));
    for (const ageBand of AGE_BANDS) {
      const rotation = enabledSkills(ageBand, FREE_SKILLS, locked);
      expect(rotation.length).toBeGreaterThan(0);
      for (const skillId of rotation) expect(FREE_SKILLS).toContain(skillId);
      for (
        let previousSessions = 0;
        previousSessions < 12;
        previousSessions += 1
      ) {
        for (const step of planSession({
          ageBand,
          sessionMinutes: 20,
          previousSessions,
          lockedSkills: locked,
        })) {
          if (step.kind === 'activity')
            expect(FREE_SKILLS).toContain(step.skillId);
        }
      }
    }
  });

  it('keeps Plus themes out of the free plan, falling back to shapes', () => {
    expect(playableInterests(['animals', 'food'], 'free')).toEqual(['food']);
    expect(playableInterests(['space'], 'free')).toEqual(['shapes']);
    expect(playableInterests(['space'], 'plus')).toEqual(['space']);
  });

  it('limits new profiles but plays everything with Plus', () => {
    expect(canAddProfile('free', 0)).toBe(true);
    expect(canAddProfile('free', 1)).toBe(false);
    expect(canAddProfile('plus', 5)).toBe(true);
    expect(canAddProfile('plus', 6)).toBe(false);
    for (const skillId of SKILL_IDS)
      expect(isSkillPlayable('plus', skillId)).toBe(true);
  });
});
