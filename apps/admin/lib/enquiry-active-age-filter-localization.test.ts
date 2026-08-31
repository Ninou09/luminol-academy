import { describe, expect, it } from 'vitest';

import { ENQUIRY_ACTIVE_AGE_BUCKETS } from './enquiry-active-age-filter';
import { getEnquiryActiveAgeFilterCopy } from './enquiry-active-age-filter-localization';

describe('getEnquiryActiveAgeFilterCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s active-age filter copy',
    (locale) => {
      const copy = getEnquiryActiveAgeFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
      for (const bucket of ENQUIRY_ACTIVE_AGE_BUCKETS) {
        expect(copy.label(bucket).length).toBeGreaterThan(0);
      }
    },
  );

  it('frames enquiry age as elapsed time rather than urgency or quality', () => {
    const copy = getEnquiryActiveAgeFilterCopy('en');

    expect(copy.intro).toContain('elapsed time');
    expect(copy.intro).toContain('does not indicate urgency');
    expect(copy.intro).toContain('lead quality');
    expect(copy.intro).toContain('clinical need');
  });
});
