import { describe, expect, it } from 'vitest';

import { getAcademyAnalyticsCopy } from './academy-analytics-localization';

describe('academy analytics localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s copy',
    (locale) => {
      const copy = getAcademyAnalyticsCopy(locale);

      expect(copy.title).toBeTruthy();
      expect(copy.intro).toBeTruthy();
      expect(copy.summaryAria).toBeTruthy();
      expect(copy.tableTitle).toBeTruthy();
      expect(copy.suppressedReason).toBeTruthy();
      expect(copy.professionalTitle).toBeTruthy();
      expect(copy.professionalIntro).toBeTruthy();
      expect(copy.professionalSuppressedReason).toBeTruthy();
      expect(copy.privacyBody).toBeTruthy();
    },
  );

  it('keeps Arabic analytics labels localized', () => {
    const copy = getAcademyAnalyticsCopy('ar');

    expect(copy.title).toBe('تحليلات الأكاديمية');
    expect(copy.participants).toBe('المشاركون');
    expect(copy.professionalTitle).toBe('سير عمل المشاريع المهنية');
    expect(copy.privacyTitle).toBe('حدود الخصوصية');
  });

  it('states the privacy, project-content and non-ranking boundaries', () => {
    const copy = getAcademyAnalyticsCopy('en');

    expect(copy.privacyBody).toContain('never exposes learner identities');
    expect(copy.privacyBody).toContain('learner reflections');
    expect(copy.privacyBody).toContain('reviewer feedback');
    expect(copy.privacyBody).toContain('does not rank learners');
    expect(copy.suppressedReason).toContain('minimum privacy group');
    expect(copy.professionalSuppressedReason).toContain(
      'distinct learners have submitted work',
    );
  });
});
