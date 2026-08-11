import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  serializeJsonLd,
} from './structured-data';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Organization structured data', () => {
  it('uses only verified public organization fields and the configured origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(buildOrganizationJsonLd('Public description')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': 'https://academy.example.com/#organization',
      name: 'Luminol Academy',
      url: 'https://academy.example.com',
      description: 'Public description',
    });
  });

  it('uses the stable fallback origin when site configuration is malformed', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    expect(buildOrganizationJsonLd('Public description').url).toBe(
      'https://luminol-academy-web.vercel.app',
    );
  });
});

describe('Breadcrumb structured data', () => {
  it('builds ordered localized breadcrumb URLs on the configured public origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(
      buildBreadcrumbJsonLd([
        { name: 'Nos écoles', href: '/fr#schools' },
        { name: 'Langues', href: '/fr/schools/languages' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Nos écoles',
          item: 'https://academy.example.com/fr#schools',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Langues',
          item: 'https://academy.example.com/fr/schools/languages',
        },
      ],
    });
  });

  it('uses the stable fallback origin for localized breadcrumb paths', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    const jsonLd = buildBreadcrumbJsonLd([
      { name: 'المدارس', href: '/ar#schools' },
      { name: 'علم النفس', href: '/ar/schools/psychology' },
    ]);

    expect(jsonLd.itemListElement[1]?.item).toBe(
      'https://luminol-academy-web.vercel.app/ar/schools/psychology',
    );
  });
});

describe('JSON-LD serialization', () => {
  it('escapes raw angle-bracket openings during JSON-LD serialization', () => {
    const serialized = serializeJsonLd({
      description: '<script>alert(1)</script>',
    });

    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003cscript>');
  });
});
