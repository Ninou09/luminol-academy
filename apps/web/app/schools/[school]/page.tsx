import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  EditorialMedia,
  type EditorialMediaAsset,
} from '../../../components/editorial-media';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { localizeProgrammeDelivery } from '../../../lib/programme-presentation';
import { getPublicCopy } from '../../../lib/public-localization';
import { getRequestLocale } from '../../../lib/request-locale';
import { getSocialPreviewImage } from '../../../lib/social-preview-metadata';
import {
  buildSanityProgrammeImageUrl,
  getProgrammesForSchool,
} from '../../../lib/sanity';
import {
  getSchool,
  getSchools,
  isSchoolSlug,
  schools,
} from '../../../lib/schools';
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from '../../../lib/structured-data';
import styles from './page.module.css';

const founderMediaByLocale = {
  en: {
    name: 'Kheddaoui Fettouma',
    alt: 'Kheddaoui Fettouma, founder of Luminol Academy',
  },
  fr: {
    name: 'Kheddaoui Fettouma',
    alt: 'Kheddaoui Fettouma, fondatrice de Luminol Academy',
  },
  ar: {
    name: 'خداوي فطومة',
    alt: 'خداوي فطومة، مؤسسة أكاديمية لومينول',
  },
} as const;

type SchoolPageProps = {
  params: Promise<{ school: string }>;
};

export function generateStaticParams() {
  return Object.keys(schools).map((school) => ({ school }));
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) return {};

  const locale = await getRequestLocale();
  const school = getSchool(locale, slug);
  const pathname = `/schools/${school.slug}`;
  const route = localizePathname(locale, pathname);
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: school.name,
    description: school.introduction,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(pathname),
    },
    openGraph: {
      title: `Luminol ${school.name}`,
      description: school.introduction,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Luminol ${school.name}`,
      description: school.introduction,
      images: [socialPreview],
    },
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) notFound();

  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).schoolPage;
  const founderMedia = founderMediaByLocale[locale];
  const localizedSchools = getSchools(locale);
  const school = localizedSchools[slug];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    {
      name: copy.schoolsLabel,
      href: localizeHref(locale, '/#schools'),
    },
    {
      name: school.name,
      href: localizeHref(locale, `/schools/${school.slug}`),
    },
  ]);
  const cmsProgrammes = await getProgrammesForSchool(slug);
  const programmes: Array<{
    id: string;
    title: string;
    description: string;
    slug?: string;
    delivery?: string | null;
    image?: EditorialMediaAsset | null;
  }> = cmsProgrammes?.length
    ? cmsProgrammes.map((programme) => ({
        id: programme._id,
        title: programme.title,
        description: programme.summary,
        slug: programme.slug.current,
        delivery: localizeProgrammeDelivery(locale, programme.delivery),
        image: programme.image
          ? {
              src: buildSanityProgrammeImageUrl(programme.image),
              alt: programme.image.alt,
              source: 'sanity' as const,
            }
          : null,
      }))
    : school.programs.map((programme) => ({
        id: programme.title,
        title: programme.title,
        description: programme.description,
      }));
  const relatedSchools = Object.values(localizedSchools).filter(
    (item) => item.slug !== school.slug,
  );
  const schoolTone = {
    psychology: styles.psychology ?? '',
    languages: styles.languages ?? '',
    training: styles.training ?? '',
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        data-breadcrumb-jsonld
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className={`${styles.page} ${schoolTone[school.slug]}`}
      >
        <section
          className={styles.hero}
          aria-labelledby="school-hero-title"
          data-school-hero={school.slug}
        >
          <div className={styles.heroCopy} data-reveal>
            <Link
              className={styles.breadcrumb}
              href={localizeHref(locale, '/#schools')}
            >
              {copy.schoolsLabel} <span aria-hidden="true">/</span>{' '}
              {school.name}
            </Link>
            <p className={styles.eyebrow}>{school.eyebrow}</p>
            <h1 id="school-hero-title">{school.headline}</h1>
            <p className={styles.heroLede}>{school.introduction}</p>
            <div className={styles.heroActions}>
              <ButtonLink href="#programs" size="lg">
                {copy.explorePrograms} <span aria-hidden="true">↘</span>
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/contact')}
                size="lg"
                variant="secondary"
              >
                {copy.startJourney}
              </ButtonLink>
            </div>
          </div>

          {school.slug === 'psychology' ? (
            <div
              className={styles.heroVisual}
              data-founder-media
              data-media-source="user-approved-upload"
              data-media-approval="2026-08-13"
              data-media-crop="portrait-center-face"
              data-reveal
            >
              <span
                role="img"
                aria-label={founderMedia.alt}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    "url('/media/founder-kheddaoui-fettouma.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: '50% 35%',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 0,
                }}
              />
              <span
                className={styles.detailNumber}
                aria-hidden="true"
                style={{ zIndex: 2 }}
              >
                {school.number}
              </span>
              <p
                style={{
                  position: 'absolute',
                  insetInlineStart: '1.75rem',
                  insetInlineEnd: '1.75rem',
                  insetBlockEnd: '1.6rem',
                  zIndex: 2,
                  margin: 0,
                  display: 'grid',
                  gap: '0.15rem',
                  color: 'var(--color-brand-surface)',
                  textShadow: '0 1px 18px rgba(16, 42, 67, 0.72)',
                }}
              >
                <strong
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                  }}
                >
                  {founderMedia.name}
                </strong>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {school.name}
                </span>
              </p>
            </div>
          ) : (
            <div className={styles.heroVisual} aria-hidden="true" data-reveal>
              <span className={styles.detailNumber}>{school.number}</span>
              <div
                className={`${styles.orbit} ${styles.orbitOuter}`}
                data-motion-orbit
              />
              <div
                className={`${styles.orbit} ${styles.orbitInner}`}
                data-motion-orbit="reverse"
              />
              <div className={styles.detailCore} data-motion-float>
                {school.name.charAt(0)}
              </div>
              <div className={styles.detailWords}>
                {school.visualWords.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={styles.promiseBand} data-reveal>
          <p>{copy.promiseLabel}</p>
          <blockquote>{school.promise}</blockquote>
        </section>

        <section
          id="programs"
          className={styles.section}
          aria-labelledby="school-programmes-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.programsEyebrow}</p>
              <h2 id="school-programmes-title">{copy.programsTitle}</h2>
            </div>
            <p>{copy.programsBody}</p>
          </div>
          <div className={styles.programGrid}>
            {programmes.map((program, index) => (
              <article
                className={styles.programCard}
                key={program.id}
                data-programme-card
                data-reveal
              >
                <span className={styles.programIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <EditorialMedia
                  className={styles.programMedia}
                  school={school.slug}
                  asset={program.image}
                />
                <h3 dir="auto">
                  {program.slug ? (
                    <Link
                      href={localizeHref(locale, `/programmes/${program.slug}`)}
                    >
                      {program.title}
                    </Link>
                  ) : (
                    program.title
                  )}
                </h3>
                {program.delivery ? (
                  <small className={styles.programDelivery}>
                    {program.delivery}
                  </small>
                ) : null}
                <p dir="auto">{program.description}</p>
                <Link href={localizeHref(locale, '/contact')}>
                  {copy.askProgram} <b aria-hidden="true">→</b>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.method}
          aria-labelledby="school-journey-title"
        >
          <div className={styles.methodHeading} data-reveal>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.journeyEyebrow}
            </p>
            <h2 id="school-journey-title">{copy.journeyTitle}</h2>
          </div>
          <ol>
            {school.approach.map((step, index) => (
              <li key={step.title} data-reveal>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`${styles.section} ${styles.audience}`}
          aria-labelledby="school-audience-title"
        >
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.audienceEyebrow}</p>
            <h2 id="school-audience-title">{copy.audienceTitle}</h2>
          </div>
          <ul>
            {school.audiences.map((audience) => (
              <li key={audience} data-reveal>
                {audience}
              </li>
            ))}
          </ul>
        </section>

        <aside
          className={`${styles.section} ${styles.note}`}
          aria-label={copy.noteAria}
          data-reveal
        >
          <span>{copy.important}</span>
          <p>{school.note}</p>
        </aside>

        <section
          className={`${styles.section} ${styles.related}`}
          aria-labelledby="related-schools-title"
        >
          <p className={styles.eyebrow} data-reveal>
            {copy.relatedEyebrow}
          </p>
          <div className={styles.relatedHeading} data-reveal>
            <h2 id="related-schools-title">{copy.relatedTitle}</h2>
            <p>{copy.relatedBody}</p>
          </div>
          <div className={styles.relatedGrid}>
            {relatedSchools.map((related) => (
              <Link
                href={localizeHref(locale, `/schools/${related.slug}`)}
                key={related.slug}
                data-reveal
              >
                <span>{related.number}</span>
                <h3>{related.name}</h3>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} data-reveal>
          <div className={styles.finalCtaText}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.ctaEyebrow}
            </p>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaBody}</p>
          </div>
          <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
            {copy.startJourney} <span aria-hidden="true">→</span>
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
