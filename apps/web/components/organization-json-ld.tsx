import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from '../lib/structured-data';

export function OrganizationJsonLd({ description }: { description: string }) {
  const organizationJsonLd = buildOrganizationJsonLd(description);
  const websiteJsonLd = buildWebsiteJsonLd(description);

  return (
    <>
      <script
        type="application/ld+json"
        data-organization-jsonld
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        data-website-jsonld
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
    </>
  );
}
