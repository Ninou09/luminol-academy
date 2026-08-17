import { describe, expect, it } from 'vitest';

import { getInstructorAttendanceCopy } from './instructor-attendance-localization';

const attendanceStates = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

describe('instructor attendance localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s attendance copy',
    (locale) => {
      const copy = getInstructorAttendanceCopy(locale);

      expect(copy.title).toBeTruthy();
      expect(copy.sessions).toBeTruthy();
      expect(copy.roster).toBeTruthy();
      expect(copy.readonlyBody).toBeTruthy();
      expect(copy.futureSession).toBeTruthy();
      for (const state of attendanceStates) {
        expect(copy.statusLabels[state]).toBeTruthy();
      }
    },
  );

  it('keeps reviewer attendance explicitly read-only', () => {
    const copy = getInstructorAttendanceCopy('en');

    expect(copy.readonlyBody).toContain('cannot create or change');
  });

  it('keeps Arabic attendance labels localized', () => {
    const copy = getInstructorAttendanceCopy('ar');

    expect(copy.title).toBe('مساحة إدارة الحضور');
    expect(copy.statusLabels.PRESENT).toBe('حاضر');
    expect(copy.statusLabels.EXCUSED).toBe('غياب بعذر');
  });
});
