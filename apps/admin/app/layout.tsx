import { ClerkProvider } from '@clerk/nextjs';
import {
  getLocaleDirection,
  LOCALE_REQUEST_HEADER,
  parseLocale,
} from '@luminol/localization';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Administration | Luminol',
  description: 'Secure academic and operational administration for Luminol.',
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const locale = parseLocale(requestHeaders.get(LOCALE_REQUEST_HEADER));

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
