import { describe, expect, it } from 'vitest';

import { getEnquiryLandingPathCopy } from './enquiry-landing-path-localization';

describe('getEnquiryLandingPathCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s landing-path copy',
    (locale) => {
      const copy = getEnquiryLandingPathCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.recorded.length).toBeGreaterThan(0);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.topPaths.length).toBeGreaterThan(0);
      expect(copy.noPaths.length).toBeGreaterThan(0);
      expect(copy.count('9')).toContain('9');
    },
  );

  it('distinguishes enquiry landing context from traffic and conversion analytics', () => {
    const copy = getEnquiryLandingPathCopy('en');

    expect(copy.intro).toContain('not page traffic');
    expect(copy.intro).toContain('conversion rates');
    expect(copy.intro).toContain('lead quality');
  });
});
