import { ClerkProvider } from '@clerk/nextjs';
import { getLocaleDirection } from '@luminol/localization';
import type { Metadata } from 'next';

import { getAdminCopy } from '../lib/admin-localization';
import { getAdminRequestLocale } from '../lib/request-locale';
import './globals.css';
import './admin-localization.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale).metadata;

  return {
    title: copy.title,
    description: copy.description,
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getAdminRequestLocale();

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
