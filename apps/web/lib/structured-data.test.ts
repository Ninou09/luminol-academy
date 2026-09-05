import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildFounderJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
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

describe('Website structured data', () => {
  it('links the public website to the existing governed organization identity', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(buildWebsiteJsonLd('Public description')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://academy.example.com/#website',
      name: 'Luminol Academy',
      url: 'https://academy.example.com',
      description: 'Public description',
      inLanguage: ['ar-DZ', 'fr-DZ', 'en-DZ'],
      publisher: {
        '@id': 'https://academy.example.com/#organization',
      },
    });
  });
});

describe('Founder structured data', () => {
  it('publishes only existing founder facts and the localized About URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(
      buildFounderJsonLd({
        name: 'Kheddaoui Fettouma',
        description: 'Verified founder description.',
        href: '/en/about',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://academy.example.com/#founder-kheddaoui-fettouma',
      name: 'Kheddaoui Fettouma',
      description: 'Verified founder description.',
      url: 'https://academy.example.com/en/about',
      worksFor: {
        '@type': 'EducationalOrganization',
        '@id': 'https://academy.example.com/#organization',
        name: 'Luminol Academy',
        url: 'https://academy.example.com',
      },
    });
  });

  it('does not invent legal, address, rating or accreditation fields', () => {
    const jsonLd = buildFounderJsonLd({
      name: 'خداوي فطومة',
      description: 'وصف مؤكد.',
      href: '/ar/about',
    });

    expect(jsonLd).not.toHaveProperty('address');
    expect(jsonLd).not.toHaveProperty('award');
    expect(jsonLd).not.toHaveProperty('aggregateRating');
    expect(jsonLd).not.toHaveProperty('hasCredential');
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

describe('Course structured data', () => {
  it('uses only governed programme fields and links the verified provider', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(
      buildCourseJsonLd({
        name: 'ACT Essentials',
        description: 'A governed public programme summary.',
        href: '/fr/programmes/act-essentials',
        languages: ['ar', 'fr'],
        image: 'https://cdn.sanity.io/images/example/course.jpg',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'ACT Essentials',
      description: 'A governed public programme summary.',
      url: 'https://academy.example.com/fr/programmes/act-essentials',
      provider: {
        '@type': 'EducationalOrganization',
        '@id': 'https://academy.example.com/#organization',
        name: 'Luminol Academy',
        url: 'https://academy.example.com',
      },
      inLanguage: ['ar', 'fr'],
      image: 'https://cdn.sanity.io/images/example/course.jpg',
    });
  });

  it('omits optional course fields when governed data does not provide them', () => {
    const jsonLd = buildCourseJsonLd({
      name: 'Programme',
      description: 'Summary',
      href: '/programmes/programme',
      languages: [],
    });

    expect(jsonLd).not.toHaveProperty('inLanguage');
    expect(jsonLd).not.toHaveProperty('image');
  });

  it('uses the stable fallback origin for the course URL and provider identity', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    const jsonLd = buildCourseJsonLd({
      name: 'Programme',
      description: 'Summary',
      href: '/ar/programmes/programme',
      languages: ['ar'],
    });

    expect(jsonLd.url).toBe(
      'https://luminol-academy-web.vercel.app/ar/programmes/programme',
    );
    expect(jsonLd.provider['@id']).toBe(
      'https://luminol-academy-web.vercel.app/#organization',
    );
    expect(jsonLd.provider.url).toBe('https://luminol-academy-web.vercel.app');
  });
});

describe('JSON-LD serialization', () => {
  it('escapes script-breaking HTML characters during JSON-LD serialization', () => {
    const serialized = serializeJsonLd({
      description: '<script>alert(1)</script> & more',
    });

    expect(serialized).not.toContain('<');
    expect(serialized).not.toContain('>');
    expect(serialized).not.toContain('&');
    expect(serialized).toContain('\\u003cscript\\u003e');
    expect(serialized).toContain('\\u0026');
  });
});
