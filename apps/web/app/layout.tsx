import { colors } from '@luminol/config/tailwind';
import { getLocaleDirection, getOpenGraphLocale } from '@luminol/localization';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import { CountUp } from '../components/count-up';
import { InnerUniverse } from '../components/inner-universe';
import { LuminousCursor } from '../components/luminous-cursor';
import { PublicInteractions } from '../components/public-interactions';
import { PublicMotionController } from '../components/public-motion-controller';
import { PageNavigation } from '../components/page-navigation';
import { ScrollExperience } from '../components/scroll-experience';
import { SiteChrome } from '../components/site-chrome';
import { SiteDock } from '../components/site-dock';
import { channelCopy, getWhatsAppHref } from '../lib/contact-channels';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { resolvePublicSiteUrl } from '../lib/site-url';
import { getSocialPreviewImage } from '../lib/social-preview-metadata';
import './globals.css';
import './localization.css';
import './motion.css';

const manrope = localFont({
  src: './fonts/manrope.ttf',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope',
});
const cormorant = localFont({
  src: [
    {
      path: './fonts/cormorant-garamond.ttf',
      weight: '300 700',
      style: 'normal',
    },
    {
      path: './fonts/cormorant-garamond-italic.ttf',
      weight: '300 700',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-cormorant',
});
const notoSansArabic = localFont({
  src: './fonts/noto-sans-arabic.ttf',
  weight: '100 900',
  display: 'swap',
  variable: '--font-noto-arabic',
});

export const viewport: Viewport = {
  themeColor: colors.ink,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const socialPreview = getSocialPreviewImage(locale);

  return {
    metadataBase: resolvePublicSiteUrl(),
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
    icons: {
      icon: [
        { url: '/favicon.ico', type: 'image/x-icon' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
      ],
    },
    openGraph: {
      title: 'Luminol Academy',
      description: copy.site.description,
      siteName: 'Luminol Academy',
      type: 'website',
      // Emit Algeria's governed regional locale in Open Graph's underscore format.
      locale: getOpenGraphLocale(locale),
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Luminol Academy',
      description: copy.site.description,
      images: [socialPreview],
    },
  };
}

const backToTopLabel = {
  en: 'Back to top',
  fr: 'Retour en haut',
  ar: 'العودة إلى الأعلى',
} as const;

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
        <InnerUniverse />
        <PageNavigation />
        <PublicMotionController />
        <PublicInteractions />
        <ScrollExperience />
        <LuminousCursor />
        <SiteChrome />
        <CountUp />
        {children}
        <SiteDock
          whatsappHref={getWhatsAppHref(channelCopy[locale].whatsappMessage)}
          whatsappLabel={channelCopy[locale].whatsappAria}
          topLabel={backToTopLabel[locale]}
        />
        {process.env.VERCEL === '1' &&
        process.env.NEXT_PUBLIC_DISABLE_ANALYTICS !== '1' ? (
          <>
            {/* Vercel Web Analytics: cookie-free, aggregated page views. */}
            <script
              dangerouslySetInnerHTML={{
                __html:
                  'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};',
              }}
            />
            <script defer src="/_vercel/insights/script.js" />
          </>
        ) : null}
      </body>
    </html>
  );
}
