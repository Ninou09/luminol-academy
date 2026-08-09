import {
  getLocaleDirection,
  LOCALE_REQUEST_HEADER,
  parseLocale,
} from '@luminol/localization';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import './globals.css';

const fallbackSiteUrl = 'https://luminol-academy-web.vercel.app';

function resolveMetadataBase() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: 'Luminol Academy | Psychology, Languages & Professional Training',
    template: '%s | Luminol Academy',
  },
  description:
    'Grow mentally, linguistically and professionally with Luminol Academy—one human-centered ecosystem for psychology, languages and professional training.',
  keywords: [
    'Luminol Academy',
    'psychology',
    'mental wellness',
    'language learning',
    'professional training',
    'coaching',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Luminol Academy',
    description:
      'Psychology, language learning and professional development in one thoughtful human ecosystem.',
    type: 'website',
    url: '/',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = parseLocale(requestHeaders.get(LOCALE_REQUEST_HEADER));

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>{children}</body>
    </html>
  );
}
