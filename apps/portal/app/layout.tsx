import { ClerkProvider } from '@clerk/nextjs';
import { getLocaleDirection } from '@luminol/localization';
import type { Metadata } from 'next';

import { getPortalCopy } from '../lib/portal-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import './globals.css';
import './portal-localization.css';

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
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
