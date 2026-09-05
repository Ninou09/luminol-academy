import { buildFounderJsonLd, serializeJsonLd } from '../lib/structured-data';

type FounderJsonLdProps = {
  name: string;
  description: string;
  href: string;
};

export function FounderJsonLd({ name, description, href }: FounderJsonLdProps) {
  const jsonLd = buildFounderJsonLd({ name, description, href });

  return (
    <script
      type="application/ld+json"
      data-founder-jsonld
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
