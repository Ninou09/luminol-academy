import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getPublicProgrammesMock } = vi.hoisted(() => ({
  getPublicProgrammesMock: vi.fn(),
}));

vi.mock('../lib/sanity', () => ({
  getPublicProgrammes: getPublicProgrammesMock,
}));

import sitemap from './sitemap';

const fallbackOrigin = 'https://luminol-academy-web.vercel.app';

beforeEach(() => {
  getPublicProgrammesMock.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('public sitemap localization', () => {
  it('cross-references every supported language with absolute URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/path');

    const entries = await sitemap();
    const frenchAbout = entries.find(
      (entry) => entry.url === 'https://academy.example.com/fr/about',
    );
    const arabicConsultations = entries.find(
      (entry) => entry.url === 'https://academy.example.com/ar/consultations',
    );

    expect(entries).toHaveLength(24);
    expect(frenchAbout?.alternates?.languages).toEqual({
      ar: 'https://academy.example.com/ar/about',
      fr: 'https://academy.example.com/fr/about',
      en: 'https://academy.example.com/en/about',
      'x-default': 'https://academy.example.com/en/about',
    });
    expect(arabicConsultations?.alternates?.languages).toEqual({
      ar: 'https://academy.example.com/ar/consultations',
      fr: 'https://academy.example.com/fr/consultations',
      en: 'https://academy.example.com/en/consultations',
      'x-default': 'https://academy.example.com/en/consultations',
    });
  });

  it('keeps the safe fallback origin when the configured site URL is invalid', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    const entries = await sitemap();
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

  it('adds governed programme detail routes with localized alternates', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com');
    getPublicProgrammesMock.mockResolvedValue([
      { slug: { current: 'acceptance-commitment-therapy-act' } },
      { slug: { current: '../draft-programme' } },
    ]);

    const entries = await sitemap();
    const arabicAct = entries.find(
      (entry) =>
        entry.url ===
        'https://academy.example.com/ar/programmes/acceptance-commitment-therapy-act',
    );

    expect(arabicAct?.alternates?.languages).toEqual({
      ar: 'https://academy.example.com/ar/programmes/acceptance-commitment-therapy-act',
      fr: 'https://academy.example.com/fr/programmes/acceptance-commitment-therapy-act',
      en: 'https://academy.example.com/en/programmes/acceptance-commitment-therapy-act',
      'x-default':
        'https://academy.example.com/en/programmes/acceptance-commitment-therapy-act',
    });
    expect(entries.some((entry) => entry.url.includes('draft-programme'))).toBe(
      false,
    );
  });
});
