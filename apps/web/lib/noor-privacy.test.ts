import { SUPPORTED_LOCALES } from '@luminol/localization';
import { describe, expect, it } from 'vitest';

import { formatPolicyDate, NOOR_PRIVACY } from './noor-privacy';

describe('Luminol Noor privacy policy', () => {
  it('covers the same sections in every language', () => {
    const count = NOOR_PRIVACY.en.sections.length;
    for (const locale of SUPPORTED_LOCALES) {
      expect(NOOR_PRIVACY[locale].sections).toHaveLength(count);
      for (const section of NOOR_PRIVACY[locale].sections) {
        expect(section.heading.trim()).not.toBe('');
        expect(section.body.trim()).not.toBe('');
      }
    }
  });

  it('states the app is free and promises no ads in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const text = NOOR_PRIVACY[locale].sections
        .map((section) => section.body)
        .join(' ');
      // The app connects to no server, so RevenueCat must not be mentioned.
      expect(text).not.toContain('RevenueCat');
    }
    expect(NOOR_PRIVACY.en.sections.map((s) => s.body).join(' ')).toContain(
      'no data ever leaves your device',
    );
    expect(NOOR_PRIVACY.ar.sections[0]?.body).toContain('لا يعرض إعلانات');
  });

  it('formats the update date the same way everywhere', () => {
    expect(formatPolicyDate('2026-10-19')).toBe('19/10/2026');
  });
});
