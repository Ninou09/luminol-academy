import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocalizedAbout } from '../../../components/localized-about';
import { isPublicLocale } from '../../../lib/i18n';

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale === 'fr') {
    return {
      title: 'À propos',
      description: 'Découvrez la vision de Luminol Academy et la manière dont psychologie, langues et formation professionnelle se complètent.',
      alternates: { canonical: '/fr/about', languages: { ar: '/about', fr: '/fr/about', en: '/en/about' } },
      openGraph: { title: 'À propos | Luminol Academy', description: 'Une académie qui relie développement personnel, communication et capacité professionnelle.', url: '/fr/about', locale: 'fr_DZ', type: 'website' },
    };
  }

  if (locale === 'en') {
    return {
      title: 'About',
      description: 'Discover Luminol Academy’s vision and how psychology, languages and professional development connect.',
      alternates: { canonical: '/en/about', languages: { ar: '/about', fr: '/fr/about', en: '/en/about' } },
      openGraph: { title: 'About | Luminol Academy', description: 'One academy connecting personal development, communication and professional capability.', url: '/en/about', locale: 'en_DZ', type: 'website' },
    };
  }

  return {};
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublicLocale(locale) || locale === 'ar') notFound();
  return <LocalizedAbout locale={locale} />;
}
