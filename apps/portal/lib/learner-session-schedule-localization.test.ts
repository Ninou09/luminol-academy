import { describe, expect, it } from 'vitest';

import { getLearnerSessionScheduleCopy } from './learner-session-schedule-localization';

const attendanceStates = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

describe('learner session schedule localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s schedule copy',
    (locale) => {
      const copy = getLearnerSessionScheduleCopy(locale);

      expect(copy.nav).toBeTruthy();
      expect(copy.upcoming).toBeTruthy();
      expect(copy.past).toBeTruthy();
      expect(copy.privacyBody).toBeTruthy();
      for (const state of attendanceStates) {
        expect(copy.attendanceLabels[state]).toBeTruthy();
      }
    },
  );

  it('keeps the English privacy copy scoped to the current learner', () => {
    const copy = getLearnerSessionScheduleCopy('en');

    expect(copy.privacyBody).toContain('does not expose other learners');
    expect(copy.intro).toContain('your own');
  });

  it('keeps Arabic schedule and attendance labels localized', () => {
    const copy = getLearnerSessionScheduleCopy('ar');

    expect(copy.nav).toBe('الجدول');
    expect(copy.attendanceLabels.PRESENT).toBe('حاضر');
    expect(copy.sessionStatuses.CANCELLED).toBe('ملغاة');
  });
});
