import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocalizedHome } from '../../components/localized-home';
import { isPublicLocale } from '../../lib/i18n';

const translatedLocales = ['fr', 'en'] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale === 'fr') {
    return {
      title:
        'Luminol Academy | Psychologie, langues et formation professionnelle',
      description:
        'Luminol Academy à Blida relie psychologie, apprentissage des langues et formation professionnelle dans une expérience humaine et pratique.',
      alternates: {
        canonical: '/fr',
        languages: { ar: '/', fr: '/fr', en: '/en' },
      },
      openGraph: {
        title: 'Luminol Academy',
        description:
          'Psychologie, langues et formation professionnelle réunies dans une expérience claire, humaine et pratique.',
        url: '/fr',
        locale: 'fr_DZ',
        alternateLocale: ['ar_DZ', 'en_DZ'],
        type: 'website',
      },
    };
  }

  if (locale === 'en') {
    return {
      title: 'Luminol Academy | Psychology, Languages & Professional Training',
      description:
        'Luminol Academy in Blida connects psychology, language learning and professional training in one human, practical experience.',
      alternates: {
        canonical: '/en',
        languages: { ar: '/', fr: '/fr', en: '/en' },
      },
      openGraph: {
        title: 'Luminol Academy',
        description:
          'Psychology, languages and professional training in one clear, human and practical experience.',
        url: '/en',
        locale: 'en_DZ',
        alternateLocale: ['ar_DZ', 'fr_DZ'],
        type: 'website',
      },
    };
  }

  return {};
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isPublicLocale(locale) || locale === 'ar') notFound();

  return <LocalizedHome locale={locale} />;
}
