import {
  buildOrganizationJsonLd,
  serializeJsonLd,
} from '../lib/structured-data';

export function OrganizationJsonLd({ description }: { description: string }) {
  const jsonLd = buildOrganizationJsonLd(description);

  return (
    <script
      type="application/ld+json"
      data-organization-jsonld
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
