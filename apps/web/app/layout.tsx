import type { Metadata } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
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

const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
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
  },
  openGraph: {
    title: 'أكاديمية لومينول',
    description:
      'علم النفس، تعلّم اللغات والتكوين المهني ضمن منظومة واحدة تهتم بالإنسان وقدراته.',
    type: 'website',
    url: '/',
    locale: 'ar_DZ',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
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
