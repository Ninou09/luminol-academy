import { describe, expect, it } from 'vitest';

import {
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  resolveLocaleRequest,
} from './index';

const routingOptions = {
  bypassPrefixes: ['/api', '/trpc', '/__clerk', '/.well-known'],
  bypassExact: ['/robots.txt', '/sitemap.xml'],
} as const;

describe('locale request routing', () => {
  it('redirects unprefixed pages to the persisted locale', () => {
    expect(resolveLocaleRequest('/programmes', 'fr', routingOptions)).toEqual({
      kind: 'redirect',
      locale: 'fr',
      pathname: '/fr/programmes',
    });
  });

  it('falls back deterministically to English', () => {
    expect(resolveLocaleRequest('/about', 'de', routingOptions)).toEqual({
      kind: 'redirect',
      locale: 'en',
      pathname: '/en/about',
    });
  });

  it('rewrites canonical localized pages to their internal route', () => {
    expect(
      resolveLocaleRequest('/ar/programmes', 'en', routingOptions),
    ).toEqual({
      kind: 'rewrite',
      locale: 'ar',
      pathname: '/programmes',
    });
  });

  it('canonicalizes locale prefix casing', () => {
    expect(resolveLocaleRequest('/FR/about', 'en', routingOptions)).toEqual({
      kind: 'redirect',
      locale: 'fr',
      pathname: '/fr/about',
    });
  });

  it('does not localize machine routes or create localized API aliases', () => {
    expect(resolveLocaleRequest('/api/health', 'ar', routingOptions)).toEqual({
      kind: 'bypass',
    });
    expect(
      resolveLocaleRequest('/fr/api/health', 'ar', routingOptions),
    ).toEqual({
      kind: 'bypass',
    });
    expect(resolveLocaleRequest('/robots.txt', 'fr', routingOptions)).toEqual({
      kind: 'bypass',
    });
  });

  it('uses path-segment boundaries for bypass prefixes', () => {
    expect(resolveLocaleRequest('/apiary', 'fr', routingOptions)).toEqual({
      kind: 'redirect',
      locale: 'fr',
      pathname: '/fr/apiary',
    });
  });

  it('defines a durable same-origin locale cookie contract', () => {
    expect(LOCALE_COOKIE_NAME).toBe('luminol_locale');
    expect(LOCALE_COOKIE_MAX_AGE_SECONDS).toBe(31_536_000);
  });
});
