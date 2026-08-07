import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import './motion.css';
import './site-shell.css';
import './flagship-polish.css';
import './arabic.css';
import './cinematic-motion.css';
import './v4-global.css';
import './v4-interactions.css';
import './v4-header.css';
import './v4-arabic-type.css';
import './v6-refinement.css';
import './v7-balanced-motion.css';
import './v8-institutional-polish.css';
import './v8-hero-split.css';
import { isPublicLocale, localeMeta, type PublicLocale } from '../lib/i18n';

const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

const latinFont = Manrope({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
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

const metadataBase = resolveMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'أكاديمية لومينول | علم النفس واللغات والتكوين المهني',
    template: '%s | أكاديمية لومينول',
  },
  description:
    'أكاديمية لومينول في البليدة: مسارات متكاملة في علم النفس، تعلّم اللغات والتكوين المهني ضمن تجربة إنسانية وعملية.',
  keywords: [
    'أكاديمية لومينول',
    'علم النفس',
    'الدعم النفسي',
    'تعلم اللغات',
    'التكوين المهني',
    'التدريب',
    'البليدة',
  ],
  alternates: {
    canonical: '/',
    languages: {
      ar: '/',
      fr: '/fr',
      en: '/en',
    },
  },
  openGraph: {
    title: 'أكاديمية لومينول',
    description:
      'علم النفس، تعلّم اللغات والتكوين المهني ضمن منظومة واحدة تهتم بالإنسان وقدراته.',
    type: 'website',
    url: '/',
    locale: 'ar_DZ',
    alternateLocale: ['fr_DZ', 'en_DZ'],
  },
  twitter: {
    card: 'summary',
    title: 'أكاديمية لومينول',
    description:
      'علم النفس، تعلّم اللغات والتكوين المهني ضمن منظومة واحدة تهتم بالإنسان وقدراته.',
  },
};

const organisationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'أكاديمية لومينول',
  alternateName: 'Luminol Academy',
  url: metadataBase.toString(),
  description:
    'أكاديمية متكاملة لعلم النفس وتعلّم اللغات والتكوين المهني في البليدة، الجزائر.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'البليدة',
    addressCountry: 'DZ',
  },
  areaServed: 'الجزائر',
  knowsAbout: [
    'التثقيف النفسي والتنمية الشخصية',
    'تعلم اللغات والتواصل',
    'التكوين والتطوير المهني',
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get('x-luminol-locale') ?? 'ar';
  const locale: PublicLocale = isPublicLocale(requestedLocale)
    ? requestedLocale
    : 'ar';
  const meta = localeMeta[locale];

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      data-locale={locale}
      className={`${arabicFont.variable} ${latinFont.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationStructuredData),
          }}
        />
      </body>
    </html>
  );
}
