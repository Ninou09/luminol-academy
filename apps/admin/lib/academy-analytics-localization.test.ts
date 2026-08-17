import { describe, expect, it } from 'vitest';

import { getAcademyAnalyticsCopy } from './academy-analytics-localization';

describe('academy analytics localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('provides complete %s copy', (locale) => {
    const copy = getAcademyAnalyticsCopy(locale);

    expect(copy.title).toBeTruthy();
    expect(copy.intro).toBeTruthy();
    expect(copy.summaryAria).toBeTruthy();
    expect(copy.tableTitle).toBeTruthy();
    expect(copy.suppressedReason).toBeTruthy();
    expect(copy.privacyBody).toBeTruthy();
  });

  it('keeps Arabic analytics labels localized', () => {
    const copy = getAcademyAnalyticsCopy('ar');

    expect(copy.title).toBe('تحليلات الأكاديمية');
    expect(copy.participants).toBe('المشاركون');
    expect(copy.privacyTitle).toBe('حدود الخصوصية');
  });

  it('states the privacy and non-ranking boundaries', () => {
    const copy = getAcademyAnalyticsCopy('en');

    expect(copy.privacyBody).toContain('never exposes learner identities');
    expect(copy.privacyBody).toContain('does not rank learners');
    expect(copy.suppressedReason).toContain('minimum privacy group');
  });
});
