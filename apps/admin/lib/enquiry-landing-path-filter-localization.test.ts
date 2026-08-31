import { describe, expect, it } from 'vitest';

import { getEnquiryLandingPathFilterCopy } from './enquiry-landing-path-filter-localization';

describe('enquiry landing path filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete landing-path filter context for %s',
    (locale) => {
      const copy = getEnquiryLandingPathFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.path.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy operational rather than evaluative', () => {
    const copy = getEnquiryLandingPathFilterCopy('en');

    expect(copy.intro).toContain('exact stored public pathname');
    expect(copy.intro).toContain('does not measure page traffic');
    expect(copy.intro).toContain('conversion');
    expect(copy.intro).toContain('lead quality');
  });
});
