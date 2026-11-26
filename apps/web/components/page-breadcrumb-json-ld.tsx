import { localizePathname, type Locale } from '@luminol/localization';

import { buildBreadcrumbJsonLd, serializeJsonLd } from '../lib/structured-data';

export function PageBreadcrumbJsonLd({
  locale,
  pathname,
  label,
}: {
  locale: Locale;
  pathname: string;
  label: string;
}) {
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Luminol Academy', href: localizePathname(locale, '/') },
    { name: label, href: localizePathname(locale, pathname) },
  ]);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumb) }}
    />
  );
}
