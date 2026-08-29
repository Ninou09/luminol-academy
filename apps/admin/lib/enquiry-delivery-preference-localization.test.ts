import { describe, expect, it } from 'vitest';

import { getEnquiryDeliveryPreferenceCopy } from './enquiry-delivery-preference-localization';

describe('getEnquiryDeliveryPreferenceCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s delivery-preference copy',
    (locale) => {
      const copy = getEnquiryDeliveryPreferenceCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.inPerson.length).toBeGreaterThan(0);
      expect(copy.online.length).toBeGreaterThan(0);
      expect(copy.flexible.length).toBeGreaterThan(0);
      expect(copy.notSure.length).toBeGreaterThan(0);
      expect(copy.count('9')).toContain('9');
    },
  );

  it('keeps explicit not-sure separate from missing qualification', () => {
    const copy = getEnquiryDeliveryPreferenceCopy('en');

    expect(copy.notSure).not.toBe(copy.missing);
    expect(copy.intro).toContain('recorded answer');
    expect(copy.intro).toContain('not missing data');
  });
});
