import { describe, expect, it } from 'vitest';

import { ENQUIRY_QUALIFICATION_GAPS } from './enquiry-qualification-gap-filter';
import { getEnquiryQualificationGapFilterCopy } from './enquiry-qualification-gap-filter-localization';

describe('getEnquiryQualificationGapFilterCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s qualification-gap filter copy',
    (locale) => {
      const copy = getEnquiryQualificationGapFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
      for (const gap of ENQUIRY_QUALIFICATION_GAPS) {
        expect(copy.label(gap).length).toBeGreaterThan(0);
      }
    },
  );

  it('frames the filter as missing data rather than lead or clinical scoring', () => {
    const copy = getEnquiryQualificationGapFilterCopy('en');

    expect(copy.intro).toContain('persisted qualification field is missing');
    expect(copy.intro).toContain('does not score lead quality');
    expect(copy.intro).toContain('clinical need');
    expect(copy.intro).toContain('does not infer');
  });
});
