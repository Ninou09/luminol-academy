import type { Metadata } from 'next';
import './globals.css';
import './motion.css';
import './site-shell.css';

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
  twitter: {
    card: 'summary',
    title: 'Luminol Academy',
    description:
      'Psychology, language learning and professional development in one thoughtful human ecosystem.',
  },
};

const organisationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Luminol Academy',
  url: metadataBase.toString(),
  description:
    'A connected academy for psychology, language learning and professional training.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Blida',
    addressCountry: 'DZ',
  },
  areaServed: 'Algeria',
  knowsAbout: [
    'Psychology education and mental wellness',
    'Language learning and communication',
    'Professional development and training',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
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
