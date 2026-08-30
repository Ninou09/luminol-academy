import { describe, expect, it } from 'vitest';

import { getEnquiryContactShortcutsCopy } from './enquiry-contact-shortcuts-localization';

describe('enquiry contact shortcut localization', () => {
  it('provides EN, FR and AR copy with all channel labels', () => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      const copy = getEnquiryContactShortcutsCopy(locale);

      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(0);
      expect(copy.boundary.length).toBeGreaterThan(0);
      expect(copy.unavailable.length).toBeGreaterThan(0);
      expect(copy.preferred.length).toBeGreaterThan(0);
      expect(copy.label('email').length).toBeGreaterThan(0);
      expect(copy.label('phone').length).toBeGreaterThan(0);
      expect(copy.label('whatsapp').length).toBeGreaterThan(0);
    }
  });

  it('keeps the workflow boundary explicit in every locale', () => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      expect(getEnquiryContactShortcutsCopy(locale).boundary).toContain(
        'CONTACTED',
      );
    }
  });
});
