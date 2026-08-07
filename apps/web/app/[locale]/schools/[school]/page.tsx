import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocalizedSchool } from '../../../../components/localized-school';
import { isPublicLocale } from '../../../../lib/i18n';
import { localizedSchools } from '../../../../lib/localized-schools';
import { isSchoolSlug, type SchoolSlug } from '../../../../lib/schools';

type PageProps = {
  params: Promise<{ locale: string; school: string }>;
};

export function generateStaticParams() {
  const locales = ['fr', 'en'] as const;
  const schools: SchoolSlug[] = ['psychology', 'languages', 'training'];
  return locales.flatMap((locale) => schools.map((school) => ({ locale, school })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, school } = await params;
  if ((locale !== 'fr' && locale !== 'en') || !isSchoolSlug(school)) return {};

  const content = localizedSchools[locale][school];
  const canonical = `/${locale}/schools/${school}`;
  const arPath = `/schools/${school}`;

  return {
    title: content.name,
    description: content.introduction,
    alternates: {
      canonical,
      languages: {
        ar: arPath,
        fr: `/fr/schools/${school}`,
        en: `/en/schools/${school}`,
      },
    },
    openGraph: {
      title: `${content.name} | Luminol Academy`,
      description: content.introduction,
      url: canonical,
      locale: locale === 'fr' ? 'fr_DZ' : 'en_DZ',
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, school } = await params;
  if (!isPublicLocale(locale) || locale === 'ar' || !isSchoolSlug(school)) notFound();
  return <LocalizedSchool locale={locale} slug={school} />;
}
