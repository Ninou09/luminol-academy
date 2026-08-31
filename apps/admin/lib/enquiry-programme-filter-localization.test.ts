import { describe, expect, it } from 'vitest';

import { getEnquiryProgrammeFilterCopy } from './enquiry-programme-filter-localization';

describe('enquiry programme filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryProgrammeFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.programme.length).toBeGreaterThan(0);
      expect(copy.storedSlug.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy tied to exact stored verified context', () => {
    const copy = getEnquiryProgrammeFilterCopy('en');

    expect(copy.intro).toContain('exact programme slug and title snapshot');
    expect(copy.intro).toContain('server verification');
    expect(copy.intro).toContain('historical enquiry context');
    expect(copy.intro).toContain('not a current-catalogue replacement');
    expect(copy.intro).toContain('clinical inference');
  });
});
