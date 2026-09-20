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

import { AcademyImage } from '../../../components/academy-image';
import {
  EditorialMedia,
  type EditorialMediaAsset,
} from '../../../components/editorial-media';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  isProgrammeWaitlist,
  localizeProgrammeDelivery,
  localizeProgrammePublicCopy,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from '../../../lib/programme-presentation';
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
    actionLabel?: string;
    image?: EditorialMediaAsset | null;
  }> = cmsProgrammes?.length
    ? cmsProgrammes.map((programme) => {
        const programmeSlug = programme.slug?.current;
        const isWaitlist = programmeSlug
          ? isProgrammeWaitlist(programmeSlug)
          : false;
        const publicCopy = programmeSlug
          ? localizeProgrammePublicCopy(locale, {
              ...programme,
              slug: { current: programmeSlug },
            })
          : { title: programme.title, summary: programme.summary };

        return {
          id: programme._id,
          title: publicCopy.title,
          description: publicCopy.summary,
          slug: programmeSlug,
          delivery: isWaitlist
            ? localizeProgrammeWaitlistLabel(locale)
            : localizeProgrammeDelivery(locale, programme.delivery),
          actionLabel: isWaitlist
            ? localizeProgrammeWaitlistAction(locale)
            : copy.askProgram,
          image:
            !isWaitlist && programme.image
              ? {
                  src: buildSanityProgrammeImageUrl(programme.image),
                  alt: programme.image.alt,
                  source: 'sanity' as const,
                }
              : null,
        };
      })
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
            <nav className={styles.breadcrumb} aria-label={copy.schoolsLabel}>
              <Link
                href={localizeHref(locale, '/#schools')}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {copy.schoolsLabel}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" dir="auto">
                {school.name}
              </span>
            </nav>
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

          <AcademyImage
            className={styles.heroVisual}
            school={school.slug}
            locale={locale}
            priority
            sizes="(max-width: 1000px) 100vw, 48vw"
          />
        </section>

        <section
          className={styles.promiseBand}
          role="region"
          aria-labelledby="school-promise-title"
          data-reveal
        >
          <p id="school-promise-title">{copy.promiseLabel}</p>
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
                aria-labelledby={`school-programme-${index + 1}-title`}
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
                <h3 id={`school-programme-${index + 1}-title`} dir="auto">
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
                <Link
                  href={localizeHref(locale, '/contact')}
                  aria-label={`${program.actionLabel ?? copy.askProgram}: ${program.title}`}
                >
                  {program.actionLabel ?? copy.askProgram}{' '}
                  <b aria-hidden="true">→</b>
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
            {relatedSchools.map((related) => {
              const relatedTitleId = `related-school-${related.slug}-title`;

              return (
                <Link
                  href={localizeHref(locale, `/schools/${related.slug}`)}
                  key={related.slug}
                  aria-labelledby={relatedTitleId}
                  data-related-school={related.slug}
                  data-reveal
                >
                  <span aria-hidden="true">{related.number}</span>
                  <h3 id={relatedTitleId}>{related.name}</h3>
                  <b aria-hidden="true">↗</b>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          className={styles.finalCta}
          role="region"
          aria-labelledby="school-cta-title"
          data-reveal
        >
          <div className={styles.finalCtaText}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.ctaEyebrow}
            </p>
            <h2 id="school-cta-title">{copy.ctaTitle}</h2>
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
