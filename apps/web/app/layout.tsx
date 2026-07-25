import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
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
  openGraph: {
    title: 'Luminol Academy',
    description:
      'Psychology, language learning and professional development in one thoughtful human ecosystem.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
