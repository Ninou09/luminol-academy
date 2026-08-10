import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from './sitemap';

const fallbackOrigin = 'https://luminol-academy-web.vercel.app';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('public sitemap localization', () => {
  it('cross-references every supported language with absolute URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/path');

    const entries = sitemap();
    const frenchAbout = entries.find(
      (entry) => entry.url === 'https://academy.example.com/fr/about',
    );

    expect(entries).toHaveLength(21);
    expect(frenchAbout?.alternates?.languages).toEqual({
      ar: 'https://academy.example.com/ar/about',
      fr: 'https://academy.example.com/fr/about',
      en: 'https://academy.example.com/en/about',
      'x-default': 'https://academy.example.com/en/about',
    });
  });

  it('keeps the safe fallback origin when the configured site URL is invalid', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    const entries = sitemap();
    const arabicHome = entries.find(
      (entry) => entry.url === `${fallbackOrigin}/ar`,
    );

    expect(arabicHome?.alternates?.languages).toEqual({
      ar: `${fallbackOrigin}/ar`,
      fr: `${fallbackOrigin}/fr`,
      en: `${fallbackOrigin}/en`,
      'x-default': `${fallbackOrigin}/en`,
    });
  });
});
