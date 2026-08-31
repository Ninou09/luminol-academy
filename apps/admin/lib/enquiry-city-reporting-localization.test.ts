import { describe, expect, it } from 'vitest';

import { getEnquiryCityReportingCopy } from './enquiry-city-reporting-localization';

describe('enquiry city reporting localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete reporting copy for %s',
    (locale) => {
      const copy = getEnquiryCityReportingCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.recorded.length).toBeGreaterThan(0);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.enquiryCount('3')).toContain('3');
      expect(copy.noData.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy explicit about exact text and non-inference', () => {
    const copy = getEnquiryCityReportingCopy('en');

    expect(copy.intro).toContain('exact city text');
    expect(copy.intro).toContain('stay separate');
    expect(copy.intro).toContain('no geocoding');
    expect(copy.intro).toContain('regional inference');
  });
});
