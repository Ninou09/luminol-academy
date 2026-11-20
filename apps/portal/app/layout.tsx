import { ClerkProvider } from '@clerk/nextjs';
import { arSA, frFR } from '@clerk/localizations';
import { getLocaleDirection, type Locale } from '@luminol/localization';
import type { Metadata } from 'next';

import { getPortalCopy } from '../lib/portal-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import './globals.css';
import './portal-localization.css';

/** Clerk's own sign-in texts follow the portal language (English is Clerk's default). */
function clerkLocalization(locale: Locale) {
  if (locale === 'ar') return { localization: arSA };
  if (locale === 'fr') return { localization: frFR };
  return {};
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).metadata;

  return {
    title: copy.title,
    description: copy.description,
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getPortalRequestLocale();

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>
        <ClerkProvider {...clerkLocalization(locale)}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
