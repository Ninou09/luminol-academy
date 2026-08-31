import { describe, expect, it } from 'vitest';

import { getEnquirySchoolFilterCopy } from './enquiry-school-filter-localization';

describe('enquiry school filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete school filter context for %s',
    (locale) => {
      const copy = getEnquirySchoolFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.school.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy structured and non-evaluative', () => {
    const copy = getEnquirySchoolFilterCopy('en');

    expect(copy.intro).toContain('structured school recorded');
    expect(copy.intro).toContain('does not indicate lead quality');
    expect(copy.intro).toContain('programme recommendation');
    expect(copy.intro).toContain('clinical need');
  });
});
