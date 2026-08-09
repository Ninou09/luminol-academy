import { describe, expect, it } from 'vitest';
import { getPublicCopy } from './public-localization';

describe('public localization dictionaries', () => {
  it('ships complete public copy for Arabic, French and English', () => {
    for (const locale of ['ar', 'fr', 'en'] as const) {
      const copy = getPublicCopy(locale);
      expect(copy.site.description.length).toBeGreaterThan(40);
      expect(copy.home.heroTitle.length).toBeGreaterThan(5);
      expect(copy.about.values).toHaveLength(4);
      expect(copy.contact.steps).toHaveLength(3);
      expect(copy.programmes.languageNames[locale].length).toBeGreaterThan(2);
      expect(copy.form.consent.length).toBeGreaterThan(20);
      expect(copy.certificate.privacyBody.length).toBeGreaterThan(40);
    }
  });

  it('does not silently fall back to English for core Arabic and French surfaces', () => {
    expect(getPublicCopy('ar').home.heroTitle).not.toBe(getPublicCopy('en').home.heroTitle);
    expect(getPublicCopy('fr').contact.heroTitle).not.toBe(getPublicCopy('en').contact.heroTitle);
    expect(getPublicCopy('ar').programmes.searchLabel).toContain('البرامج');
  });
});
