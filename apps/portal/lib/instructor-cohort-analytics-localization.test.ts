import { describe, expect, it } from 'vitest';

import { getInstructorCohortAnalyticsCopy } from './instructor-cohort-analytics-localization';

describe('instructor cohort analytics localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s copy',
    (locale) => {
      const copy = getInstructorCohortAnalyticsCopy(locale);

      expect(copy.title.length).toBeGreaterThan(5);
      expect(copy.privacyBody.length).toBeGreaterThan(40);
      expect(copy.suppressedBody(5)).toContain('5');
      expect(copy.sourceBody.length).toBeGreaterThan(40);
      expect(copy.attendance.length).toBeGreaterThan(5);
      expect(copy.attendanceBody.length).toBeGreaterThan(40);
    },
  );

  it('keeps Arabic and French labels localized', () => {
    expect(getInstructorCohortAnalyticsCopy('ar').title).toContain('المجموعة');
    expect(getInstructorCohortAnalyticsCopy('ar').attendance).toContain('الحضور');
    expect(getInstructorCohortAnalyticsCopy('fr').title).toContain('groupe');
    expect(getInstructorCohortAnalyticsCopy('fr').attendance).toContain(
      'présence',
    );
  });

  it('states that recorder identity remains outside the aggregate view', () => {
    expect(getInstructorCohortAnalyticsCopy('en').privacyBody).toContain(
      'attendance-recorder identity',
    );
  });
});
