import { resolvePublicSiteOrigin } from './site-url';

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

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
