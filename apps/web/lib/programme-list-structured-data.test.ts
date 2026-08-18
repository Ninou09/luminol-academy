import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildProgrammeListJsonLd } from './structured-data';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Programme list structured data', () => {
  it('builds an ordered ItemList of governed programme names and localized URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(
      buildProgrammeListJsonLd([
        { name: 'ACT Essentials', href: '/en/programmes/act-essentials' },
        { name: 'French B2', href: '/fr/programmes/french-b2' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Course',
            name: 'ACT Essentials',
            url: 'https://academy.example.com/en/programmes/act-essentials',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Course',
            name: 'French B2',
            url: 'https://academy.example.com/fr/programmes/french-b2',
          },
        },
      ],
    });
  });

  it('uses the stable fallback origin for programme-list item URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    const jsonLd = buildProgrammeListJsonLd([
      { name: 'Programme', href: '/ar/programmes/programme' },
    ]);

    expect(jsonLd.itemListElement[0]?.item.url).toBe(
      'https://luminol-academy-web.vercel.app/ar/programmes/programme',
    );
  });
});
