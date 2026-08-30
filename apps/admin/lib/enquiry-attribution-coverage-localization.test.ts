import { describe, expect, it } from 'vitest';

import { getEnquiryAttributionCoverageCopy } from './enquiry-attribution-coverage-localization';

describe('getEnquiryAttributionCoverageCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s attribution-coverage copy',
    (locale) => {
      const copy = getEnquiryAttributionCoverageCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(30);
      expect(copy.utmSource.length).toBeGreaterThan(0);
      expect(copy.utmMedium.length).toBeGreaterThan(0);
      expect(copy.utmCampaign.length).toBeGreaterThan(0);
      expect(copy.utmContent.length).toBeGreaterThan(0);
      expect(copy.landingPath.length).toBeGreaterThan(0);
      expect(copy.recordedOfTotal('4', '8')).toContain('4');
      expect(copy.recordedOfTotal('4', '8')).toContain('8');
    },
  );

  it('keeps English framing limited to data completeness', () => {
    const copy = getEnquiryAttributionCoverageCopy('en');

    expect(copy.intro).toContain('data-capture completeness only');
    expect(copy.intro).toContain('not attribution accuracy');
    expect(copy.intro).toContain('lead quality');
  });
});
