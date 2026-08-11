import { resolvePublicSiteOrigin } from './site-url';

type BreadcrumbItem = {
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

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
