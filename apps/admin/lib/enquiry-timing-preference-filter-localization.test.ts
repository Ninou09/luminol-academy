import { describe, expect, it } from 'vitest';

import { getEnquiryTimingPreferenceFilterCopy } from './enquiry-timing-preference-filter-localization';

describe('enquiry timing-preference filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryTimingPreferenceFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.preference.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy contextual and non-evaluative', () => {
    const copy = getEnquiryTimingPreferenceFilterCopy('en');

    expect(copy.intro).toContain('structured requested timing recorded');
    expect(copy.intro).toContain('not an emergency or urgency signal');
    expect(copy.intro).toContain('recorded answer rather than low intent');
    expect(copy.intro).toContain('clinical need');
  });
});
