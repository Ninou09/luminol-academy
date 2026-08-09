import { getLocaleDirection } from '@luminol/localization';
import type { Metadata } from 'next';

import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import './globals.css';
import './localization.css';

const fallbackSiteUrl = 'https://luminol-academy-web.vercel.app';

function resolveMetadataBase() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);

  return {
    metadataBase: resolveMetadataBase(),
    title: {
      default: 'Luminol Academy',
      template: '%s | Luminol Academy',
    },
    description: copy.site.description,
    keywords: [
      'Luminol Academy',
      'psychology',
      'mental wellness',
      'language learning',
      'professional training',
      'coaching',
    ],
    openGraph: {
      title: 'Luminol Academy',
      description: copy.site.description,
      type: 'website',
      locale,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>{children}</body>
    </html>
  );
}
