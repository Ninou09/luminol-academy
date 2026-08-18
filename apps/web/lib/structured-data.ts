import { resolvePublicSiteOrigin } from './site-url';

type BreadcrumbItem = {
  name: string;
  href: string;
};

type CourseJsonLdInput = {
  name: string;
  description: string;
  href: string;
  languages: readonly string[];
  image?: string;
};

type ProgrammeListItem = {
  name: string;
  href: string;
};

export function buildOrganizationJsonLd(description: string) {
  const origin = resolvePublicSiteOrigin();

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${origin}/#organization`,
    name: 'Luminol Academy',
    url: origin,
    description,
  } as const;
}

export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  const origin = resolvePublicSiteOrigin();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.href, `${origin}/`).toString(),
    })),
  } as const;
}

export function buildCourseJsonLd({
  name,
  description,
  href,
  languages,
  image,
}: CourseJsonLdInput) {
  const origin = resolvePublicSiteOrigin();

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: new URL(href, `${origin}/`).toString(),
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${origin}/#organization`,
      name: 'Luminol Academy',
      url: origin,
    },
    ...(languages.length > 0 ? { inLanguage: languages } : {}),
    ...(image ? { image } : {}),
  } as const;
}

export function buildProgrammeListJsonLd(items: readonly ProgrammeListItem[]) {
  const origin = resolvePublicSiteOrigin();

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: item.name,
        url: new URL(item.href, `${origin}/`).toString(),
      },
    })),
  } as const;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
