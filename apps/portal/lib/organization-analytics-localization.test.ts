import { describe, expect, it } from 'vitest';

import { getOrganizationAnalyticsCopy } from './organization-analytics-localization';

describe('organization analytics localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s copy',
    (locale) => {
      const copy = getOrganizationAnalyticsCopy(locale);

      expect(copy.title).toBeTruthy();
      expect(copy.intro).toBeTruthy();
      expect(copy.protectedBody).toBeTruthy();
      expect(copy.courseAnalytics).toBeTruthy();
      expect(copy.teamAnalytics).toBeTruthy();
      expect(copy.privacyBody).toBeTruthy();
    },
  );

  it('keeps Arabic analytics labels localized', () => {
    const copy = getOrganizationAnalyticsCopy('ar');

    expect(copy.title).toBe('تحليلات المؤسسة');
    expect(copy.seatUtilization).toBe('استخدام المقاعد');
    expect(copy.teamAnalytics).toBe('تجميعات الفرق');
  });

  it('states tenant, sensitive-data and non-ranking boundaries', () => {
    const copy = getOrganizationAnalyticsCopy('en');

    expect(copy.privacyBody).toContain('tenant-scoped');
    expect(copy.privacyBody).toContain('does not expose learner identities');
    expect(copy.privacyBody).toContain('does not rank learners');
  });
});
