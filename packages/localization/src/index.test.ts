import { describe, expect, it } from 'vitest';

import {
  buildLanguageAlternates,
  COMMON_DICTIONARIES,
  formatLocalizedCurrency,
  getLocaleDirection,
  localizeHref,
  localizePathname,
  parseLocale,
  parseLocalizedPathname,
  sanitizeInternalReturnTo,
  SUPPORTED_LOCALES,
} from './index';

describe('locale contract', () => {
  it('validates supported locale input and falls back deterministically', () => {
    expect(parseLocale('AR')).toBe('ar');
    expect(parseLocale(' fr ')).toBe('fr');
    expect(parseLocale('de')).toBe('en');
    expect(parseLocale(['ar'])).toBe('en');
  });

  it('keeps Arabic RTL and French/English LTR', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('fr')).toBe('ltr');
    expect(getLocaleDirection('en')).toBe('ltr');
  });

  it('provides a complete common dictionary for every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(
        COMMON_DICTIONARIES[locale].languageSelectorLabel.length,
      ).toBeGreaterThan(0);
      expect(COMMON_DICTIONARIES[locale].localeNames.ar.length).toBeGreaterThan(
        0,
      );
      expect(COMMON_DICTIONARIES[locale].localeNames.fr.length).toBeGreaterThan(
        0,
      );
      expect(COMMON_DICTIONARIES[locale].localeNames.en.length).toBeGreaterThan(
        0,
      );
    }
  });
});

describe('localized paths', () => {
  it('parses and replaces locale path prefixes without changing the route', () => {
    expect(parseLocalizedPathname('/ar/programmes')).toEqual({
      locale: 'ar',
      pathname: '/programmes',
    });
    expect(localizePathname('fr', '/ar/programmes')).toBe('/fr/programmes');
    expect(localizePathname('en', '/')).toBe('/en');
  });

  it('preserves query and fragment state in localized hrefs', () => {
    expect(
      localizeHref('ar', '/programmes?q=english&school=languages#results'),
    ).toBe('/ar/programmes?q=english&school=languages#results');
    expect(localizeHref('fr', '/en/about')).toBe('/fr/about');
  });

  it('builds canonical language alternates with an English x-default', () => {
    expect(buildLanguageAlternates('/programmes')).toEqual({
      ar: '/ar/programmes',
      fr: '/fr/programmes',
      en: '/en/programmes',
      'x-default': '/en/programmes',
    });
  });
});

describe('safe navigation and formatting', () => {
  it('accepts only safe same-origin return targets', () => {
    expect(sanitizeInternalReturnTo('/fr/programmes?q=leadership')).toBe(
      '/fr/programmes?q=leadership',
    );
    expect(sanitizeInternalReturnTo('//evil.example')).toBe('/');
    expect(sanitizeInternalReturnTo('/\\evil')).toBe('/');
    expect(sanitizeInternalReturnTo('/%5Cevil')).toBe('/');
    expect(sanitizeInternalReturnTo('/%00evil')).toBe('/');
    expect(sanitizeInternalReturnTo('https://evil.example')).toBe('/');
  });

  it('formats integer minor units with each currency minor-unit exponent', () => {
    expect(formatLocalizedCurrency(125000, 'DZD', 'fr')).toBe(
      new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
      }).format(1250),
    );
    expect(formatLocalizedCurrency(1250, 'JPY', 'en')).toBe(
      new Intl.NumberFormat('en-DZ', {
        style: 'currency',
        currency: 'JPY',
      }).format(1250),
    );
    expect(formatLocalizedCurrency(1250, 'KWD', 'en')).toBe(
      new Intl.NumberFormat('en-DZ', {
        style: 'currency',
        currency: 'KWD',
      }).format(1.25),
    );
    expect(() => formatLocalizedCurrency(1.5, 'DZD', 'en')).toThrow(
      'Currency minor units must be an integer',
    );
  });
});
