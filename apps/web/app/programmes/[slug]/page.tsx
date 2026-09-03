import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { buildProgrammeContactHref } from '../../../lib/programme-contact';
import {
  getPublicProgrammeBySlug,
  type PublicProgrammeDetail,
} from '../../../lib/programme-detail';
import {
  isProgrammeWaitlist,
  localizeProgrammeDelivery,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from '../../../lib/programme-presentation';
import { getRequestLocale } from '../../../lib/request-locale';
import {
  buildSanityProgrammeImageUrl,
  type CmsProgrammeLanguage,
} from '../../../lib/sanity';
import { getSchools } from '../../../lib/schools';
import { getSocialPreviewImage } from '../../../lib/social-preview-metadata';
import {
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  serializeJsonLd,
} from '../../../lib/structured-data';
import styles from './page.module.css';

const DETAIL_COPY = {
  en: {
    catalogue: 'Programmes',
    eyebrow: 'Published programme',
    featured: 'Featured',
    overview: 'Programme overview',
    outcomes: 'Learning outcomes',
    audience: 'Who this programme is for',
    facts: 'Programme information',
    school: 'School',
    status: 'Status',
    delivery: 'Delivery',
    languages: 'Languages',
    unspecified: 'Ask Luminol',
    back: 'Back to programmes',
    exploreSchool: 'Explore this school',
    ask: 'Ask Luminol',
    waitlistNextEyebrow: 'Next cohort',
    waitlistNextTitle: 'Interested in the next ACT cohort?',
    waitlistNextBody:
      'The next cohort has not been scheduled publicly yet. Contact Luminol to register your interest without relying on an expired date or unconfirmed delivery details.',
    nextEyebrow: 'Your next step',
    nextTitle: 'Want to know whether this programme fits your goal?',
    nextBody:
      'Share what you want to achieve and the Luminol team can guide you toward the right next step.',
    unavailableTitle: 'Programme unavailable',
  },
  fr: {
    catalogue: 'Programmes',
    eyebrow: 'Programme publié',
    featured: 'À la une',
    overview: 'Présentation du programme',
    outcomes: 'Objectifs d’apprentissage',
    audience: 'À qui s’adresse ce programme',
    facts: 'Informations sur le programme',
    school: 'École',
    status: 'Statut',
    delivery: 'Format',
    languages: 'Langues',
    unspecified: 'Contacter Luminol',
    back: 'Retour aux programmes',
    exploreSchool: 'Découvrir cette école',
    ask: 'Contacter Luminol',
    waitlistNextEyebrow: 'Prochaine cohorte',
    waitlistNextTitle: 'Intéressé par la prochaine cohorte ACT ?',
    waitlistNextBody:
      'La prochaine cohorte n’est pas encore programmée publiquement. Contactez Luminol pour signaler votre intérêt sans vous fier à une ancienne date ni à des modalités non confirmées.',
    nextEyebrow: 'Votre prochaine étape',
    nextTitle:
      'Vous souhaitez savoir si ce programme correspond à votre objectif ?',
    nextBody:
      'Partagez votre objectif et l’équipe Luminol pourra vous orienter vers la prochaine étape la plus adaptée.',
    unavailableTitle: 'Programme indisponible',
  },
  ar: {
    catalogue: 'البرامج',
    eyebrow: 'برنامج منشور',
    featured: 'برنامج مميز',
    overview: 'نظرة عامة على البرنامج',
    outcomes: 'مخرجات التعلم',
    audience: 'لمن صُمم هذا البرنامج',
    facts: 'معلومات البرنامج',
    school: 'المدرسة',
    status: 'الحالة',
    delivery: 'نمط التقديم',
    languages: 'لغات التقديم',
    unspecified: 'اسأل لومينول',
    back: 'العودة إلى البرامج',
    exploreSchool: 'استكشف هذه المدرسة',
    ask: 'اسأل لومينول',
    waitlistNextEyebrow: 'الفوج القادم',
    waitlistNextTitle: 'هل أنت مهتم بالفوج القادم لدورة ACT؟',
    waitlistNextBody:
      'لم يُعلن عن موعد الفوج القادم بعد. تواصل مع لومينول لتسجيل اهتمامك دون الاعتماد على تاريخ منتهٍ أو تفاصيل تقديم لم يتم تأكيدها.',
    nextEyebrow: 'خطوتك التالية',
    nextTitle: 'هل تريد معرفة ما إذا كان هذا البرنامج يناسب هدفك؟',
    nextBody:
      'شاركنا ما تريد تحقيقه، وسيساعدك فريق لومينول على تحديد الخطوة التالية الأنسب.',
    unavailableTitle: 'البرنامج غير متاح',
  },
} as const satisfies Record<Locale, Record<string, string>>;

const LANGUAGE_NAMES = {
  en: { ar: 'Arabic', fr: 'French', en: 'English' },
  fr: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
  ar: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
} as const satisfies Record<Locale, Record<CmsProgrammeLanguage, string>>;

type ProgrammeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function getBodyParagraphs(programme: PublicProgrammeDetail) {
  return programme.bodyText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: ProgrammeDetailPageProps): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const programme = await getPublicProgrammeBySlug(slug);
  const copy = DETAIL_COPY[locale];

  if (!programme) {
    return {
      title: copy.unavailableTitle,
      robots: { index: false, follow: false },
    };
  }

  const pathname = `/programmes/${programme.slug.current}`;
  const route = localizePathname(locale, pathname);
  const isWaitlist = isProgrammeWaitlist(programme.slug.current);
  const socialImage =
    !isWaitlist && programme.image
      ? {
          url: buildSanityProgrammeImageUrl(programme.image),
          width: 1200,
          height: 675,
          alt: programme.image.alt,
        }
      : getSocialPreviewImage(locale);

  return {
    title: programme.title,
    description: programme.summary,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(pathname),
    },
    openGraph: {
      title: programme.title,
      description: programme.summary,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: programme.title,
      description: programme.summary,
      images: [socialImage],
    },
  };
}

export default async function ProgrammeDetailPage({
  params,
}: ProgrammeDetailPageProps) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const programme = await getPublicProgrammeBySlug(slug);
  if (!programme) notFound();

  const copy = DETAIL_COPY[locale];
  const schools = getSchools(locale);
  const school = schools[programme.school];
  const isWaitlist = isProgrammeWaitlist(programme.slug.current);
  const waitlistLabel = isWaitlist
    ? localizeProgrammeWaitlistLabel(locale)
    : null;
  const primaryActionLabel = isWaitlist
    ? localizeProgrammeWaitlistAction(locale)
    : copy.ask;
  const bodyParagraphs = isWaitlist ? [] : getBodyParagraphs(programme);
  const languageNames = isWaitlist
    ? []
    : programme.languages.map((language) => LANGUAGE_NAMES[locale][language]);
  const deliveryLabel = isWaitlist
    ? null
    : localizeProgrammeDelivery(locale, programme.delivery);
  const programmePathname = `/programmes/${programme.slug.current}`;
  const localizedProgrammeHref = localizeHref(locale, programmePathname);
  const contactHref = buildProgrammeContactHref(locale, programme.slug.current);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: copy.catalogue,
      href: localizeHref(locale, '/programmes'),
    },
    {
      name: school.name,
      href: localizeHref(locale, `/schools/${programme.school}`),
    },
    {
      name: programme.title,
      href: localizedProgrammeHref,
    },
  ]);
  const courseJsonLd = buildCourseJsonLd({
    name: programme.title,
    description: programme.summary,
    href: localizedProgrammeHref,
    languages: isWaitlist ? [] : programme.languages,
    ...(!isWaitlist && programme.image
      ? { image: buildSanityProgrammeImageUrl(programme.image) }
      : {}),
  });

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        data-breadcrumb-jsonld
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        data-course-jsonld
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(courseJsonLd) }}
      />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="programme-detail-title"
          data-programme-detail-region="hero"
        >
          <nav className={styles.breadcrumbs} aria-label={copy.catalogue}>
            <Link href={localizeHref(locale, '/programmes')}>
              {copy.catalogue}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={localizeHref(
                locale,
                `/schools/${programme.school}#programs`,
              )}
            >
              {school.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" dir="auto">
              {programme.title}
            </span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className="eyebrow">{waitlistLabel ?? copy.eyebrow}</p>
              <h1 id="programme-detail-title" dir="auto">
                {programme.title}
              </h1>
              <p className={styles.summary} dir="auto">
                {programme.summary}
              </p>

              <ul className={styles.meta} aria-label={copy.facts}>
                <li>{school.name}</li>
                {programme.featured ? <li>{copy.featured}</li> : null}
                {waitlistLabel ? <li>{waitlistLabel}</li> : null}
                {deliveryLabel ? <li>{deliveryLabel}</li> : null}
                {languageNames.map((language) => (
                  <li key={language}>{language}</li>
                ))}
              </ul>

              <div className={styles.actions}>
                <ButtonLink href={contactHref}>{primaryActionLabel}</ButtonLink>
                <ButtonLink
                  href={localizeHref(
                    locale,
                    `/schools/${programme.school}#programs`,
                  )}
                  variant="secondary"
                >
                  {copy.exploreSchool}
                </ButtonLink>
              </div>
            </div>

            {!isWaitlist && programme.image ? (
              <figure className={styles.mediaFrame}>
                <Image
                  src={buildSanityProgrammeImageUrl(programme.image)}
                  alt={programme.image.alt}
                  width={1200}
                  height={675}
                  priority
                  sizes="(max-width: 900px) 100vw, 46vw"
                />
              </figure>
            ) : null}
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.contentInner}>
            {bodyParagraphs.length > 0 ? (
              <section
                className={styles.overview}
                aria-labelledby="programme-overview-title"
                data-programme-detail-region="overview"
              >
                <h2
                  id="programme-overview-title"
                  className={styles.sectionLabel}
                >
                  {copy.overview}
                </h2>
                <div className={styles.bodyText}>
                  {bodyParagraphs.map((paragraph, index) => (
                    <p key={`${programme._id}-body-${index}`} dir="auto">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {programme.outcomes.length > 0 || programme.audience.length > 0 ? (
              <div className={styles.detailGrid}>
                {programme.outcomes.length > 0 ? (
                  <section
                    className={styles.detailCard}
                    aria-labelledby="programme-outcomes-title"
                    data-programme-detail-region="outcomes"
                  >
                    <h2 id="programme-outcomes-title">{copy.outcomes}</h2>
                    <ul>
                      {programme.outcomes.map((outcome) => (
                        <li key={outcome} dir="auto">
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {programme.audience.length > 0 ? (
                  <section
                    className={styles.detailCard}
                    aria-labelledby="programme-audience-title"
                    data-programme-detail-region="audience"
                  >
                    <h2 id="programme-audience-title">{copy.audience}</h2>
                    <ul>
                      {programme.audience.map((audience) => (
                        <li key={audience} dir="auto">
                          {audience}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}

            <section
              className={styles.facts}
              aria-labelledby="programme-facts-title"
              data-programme-detail-region="facts"
            >
              <h2 id="programme-facts-title" className={styles.sectionLabel}>
                {copy.facts}
              </h2>
              <dl>
                <div>
                  <dt>{copy.school}</dt>
                  <dd>{school.name}</dd>
                </div>
                {isWaitlist ? (
                  <div>
                    <dt>{copy.status}</dt>
                    <dd>{waitlistLabel}</dd>
                  </div>
                ) : (
                  <>
                    <div>
                      <dt>{copy.delivery}</dt>
                      <dd dir="auto">{deliveryLabel ?? copy.unspecified}</dd>
                    </div>
                    <div>
                      <dt>{copy.languages}</dt>
                      <dd>
                        {languageNames.length > 0
                          ? languageNames.join(' · ')
                          : copy.unspecified}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </section>
          </div>
        </section>

        <section
          className={styles.footerCta}
          aria-labelledby="programme-next-title"
          data-programme-detail-region="next-step"
        >
          <p className={styles.sectionLabel}>
            {isWaitlist ? copy.waitlistNextEyebrow : copy.nextEyebrow}
          </p>
          <h2 id="programme-next-title">
            {isWaitlist ? copy.waitlistNextTitle : copy.nextTitle}
          </h2>
          <p>{isWaitlist ? copy.waitlistNextBody : copy.nextBody}</p>
          <div className={styles.footerActions}>
            <ButtonLink href={contactHref}>{primaryActionLabel}</ButtonLink>
            <ButtonLink
              href={localizeHref(locale, '/programmes')}
              variant="secondary"
            >
              {copy.back}
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
