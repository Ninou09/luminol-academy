import { getLocaleDirection } from '@luminol/localization';
import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Manrope,
  Noto_Sans_Arabic,
} from 'next/font/google';

import { PublicMotionController } from '../components/public-motion-controller';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import './globals.css';
import './localization.css';
import './motion.css';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-noto-arabic',
});
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
    title: { default: 'Luminol Academy', template: '%s | Luminol Academy' },
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
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const fontVariables = `${manrope.variable} ${cormorant.variable} ${notoSansArabic.variable}`;

  return (
    <html
      className={fontVariables}
      lang={locale}
      dir={getLocaleDirection(locale)}
    >
      <body>
        <PublicMotionController />
        {children}
      </body>
    </html>
  );
}
