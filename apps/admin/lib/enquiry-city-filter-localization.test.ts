import { describe, expect, it } from 'vitest';

import { getEnquiryCityFilterCopy } from './enquiry-city-filter-localization';

describe('enquiry city filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryCityFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.city.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy tied to exact recorded context and non-inference', () => {
    const copy = getEnquiryCityFilterCopy('en');

    expect(copy.intro).toContain('exact city text');
    expect(copy.intro).toContain('does not geocode');
    expect(copy.intro).toContain('lead-quality');
    expect(copy.intro).toContain('clinical signal');
  });
});
