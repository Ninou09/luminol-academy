import { describe, expect, it } from 'vitest';

import { getEnquiryQualificationGapCopy } from './enquiry-qualification-gap-localization';

describe('getEnquiryQualificationGapCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s qualification-gap copy',
    (locale) => {
      const copy = getEnquiryQualificationGapCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(40);
      expect(copy.activeTotal.length).toBeGreaterThan(0);
      expect(copy.city.length).toBeGreaterThan(0);
      expect(copy.preferredContact.length).toBeGreaterThan(0);
      expect(copy.deliveryPreference.length).toBeGreaterThan(0);
      expect(copy.timingPreference.length).toBeGreaterThan(0);
      expect(copy.count('7')).toContain('7');
    },
  );

  it('explains overlapping gaps and explicit not-sure semantics in English', () => {
    const copy = getEnquiryQualificationGapCopy('en');

    expect(copy.intro).toContain('more than one gap count');
    expect(copy.intro).toContain('not sure');
    expect(copy.intro).toContain('not gaps');
    expect(copy.intro).toContain('data completeness only');
  });
});
