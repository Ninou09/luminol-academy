import { describe, expect, it } from 'vitest';

import { ENQUIRY_ATTRIBUTION_GAPS } from './enquiry-attribution-gap-filter';
import { getEnquiryAttributionGapFilterCopy } from './enquiry-attribution-gap-filter-localization';

describe('getEnquiryAttributionGapFilterCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s attribution-gap copy',
    (locale) => {
      const copy = getEnquiryAttributionGapFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(40);
      expect(copy.clear.length).toBeGreaterThan(0);
      for (const gap of ENQUIRY_ATTRIBUTION_GAPS) {
        expect(copy.label(gap).length).toBeGreaterThan(0);
      }
    },
  );

  it('frames missing attribution as capture completeness only', () => {
    const copy = getEnquiryAttributionGapFilterCopy('en');

    expect(copy.intro).toContain('data-capture completeness');
    expect(copy.intro).toContain('does not imply attribution failure');
    expect(copy.intro).toContain('lead quality');
    expect(copy.intro).toContain('clinical need');
  });
});
