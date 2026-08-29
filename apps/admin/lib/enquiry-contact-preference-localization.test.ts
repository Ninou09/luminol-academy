import { describe, expect, it } from 'vitest';

import { getEnquiryContactPreferenceCopy } from './enquiry-contact-preference-localization';

describe('getEnquiryContactPreferenceCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s preferred-contact reporting copy',
    (locale) => {
      const copy = getEnquiryContactPreferenceCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.email.length).toBeGreaterThan(0);
      expect(copy.phone.length).toBeGreaterThan(0);
      expect(copy.whatsapp.length).toBeGreaterThan(0);
      expect(copy.count('12')).toContain('12');
    },
  );

  it('frames the English panel as preference rather than contact performance', () => {
    const copy = getEnquiryContactPreferenceCopy('en');

    expect(copy.intro).toContain('preference');
    expect(copy.intro).toContain('not whether contact was attempted');
    expect(copy.intro).not.toContain('conversion');
  });
});
