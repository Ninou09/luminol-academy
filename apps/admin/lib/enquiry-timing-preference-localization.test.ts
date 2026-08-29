import { describe, expect, it } from 'vitest';

import { getEnquiryTimingPreferenceCopy } from './enquiry-timing-preference-localization';

describe('getEnquiryTimingPreferenceCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s timing-preference copy',
    (locale) => {
      const copy = getEnquiryTimingPreferenceCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.soon.length).toBeGreaterThan(0);
      expect(copy.withinMonth.length).toBeGreaterThan(0);
      expect(copy.later.length).toBeGreaterThan(0);
      expect(copy.notSure.length).toBeGreaterThan(0);
      expect(copy.count('9')).toContain('9');
    },
  );

  it('keeps explicit not-sure separate from missing and avoids urgency inference', () => {
    const copy = getEnquiryTimingPreferenceCopy('en');

    expect(copy.notSure).not.toBe(copy.missing);
    expect(copy.intro).toContain('recorded answer');
    expect(copy.intro).toContain('not missing data');
    expect(copy.intro).toContain('do not imply urgency');
  });
});
