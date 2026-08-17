import { describe, expect, it } from 'vitest';

import { getInstructorCohortCopy } from './instructor-cohort-localization';

describe('instructor cohort localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('provides complete %s copy', (locale) => {
    const copy = getInstructorCohortCopy(locale);

    expect(copy.title).toBeTruthy();
    expect(copy.roster).toBeTruthy();
    expect(copy.completedLessons).toBeTruthy();
    expect(copy.inProgressLessons).toBeTruthy();
    expect(copy.privacyBody).toBeTruthy();
  });

  it('keeps Arabic teaching labels localized', () => {
    const copy = getInstructorCohortCopy('ar');

    expect(copy.title).toBe('عرض التدريس للمجموعة');
    expect(copy.roster).toBe('قائمة التدريس');
    expect(copy.completedLessons).toBe('الدروس المكتملة');
  });

  it('states non-ranking and sensitive-data boundaries', () => {
    const copy = getInstructorCohortCopy('en');

    expect(copy.privacyBody).toContain('never ranked by performance');
    expect(copy.privacyBody).toContain('does not expose email addresses');
    expect(copy.privacyBody).toContain('assessment answers or scores');
    expect(copy.privacyBody).toContain('psychology content or notes');
  });
});
