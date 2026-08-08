import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocalizedContact } from '../../../components/localized-contact';
import { isPublicLocale } from '../../../lib/i18n';

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale === 'fr') {
    return {
      title: 'Nous contacter',
      description:
        'Contactez Luminol Academy pour la psychologie, les langues ou la formation professionnelle et clarifiez votre prochaine étape.',
      alternates: {
        canonical: '/fr/contact',
        languages: { ar: '/contact', fr: '/fr/contact', en: '/en/contact' },
      },
      openGraph: {
        title: 'Nous contacter | Luminol Academy',
        description:
          'Commencez par votre objectif et laissez l’équipe vous aider à identifier le bon parcours.',
        url: '/fr/contact',
        locale: 'fr_DZ',
        type: 'website',
      },
    };
  }

  if (locale === 'en') {
    return {
      title: 'Contact',
      description:
        'Contact Luminol Academy about psychology, languages or professional training and clarify your next step.',
      alternates: {
        canonical: '/en/contact',
        languages: { ar: '/contact', fr: '/fr/contact', en: '/en/contact' },
      },
      openGraph: {
        title: 'Contact | Luminol Academy',
        description:
          'Start with your goal and let the team help identify the right path.',
        url: '/en/contact',
        locale: 'en_DZ',
        type: 'website',
      },
    };
  }

  return {};
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isPublicLocale(locale) || locale === 'ar') notFound();
  return <LocalizedContact locale={locale} />;
}
