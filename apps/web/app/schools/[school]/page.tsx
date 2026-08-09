import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@luminol/ui';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { getPublicCopy } from '../../../lib/public-localization';
import { getRequestLocale } from '../../../lib/request-locale';
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
      type: 'website',
      url: route,
    },
    twitter: {
      card: 'summary',
      title: `Luminol ${school.name}`,
      description: school.introduction,
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
  const cmsProgrammes = await getProgrammesForSchool(slug);
  const programmes: Array<{
    id: string;
    title: string;
    description: string;
    delivery?: string | null;
    image?: { url: string; alt: string } | null;
  }> = cmsProgrammes?.length
    ? cmsProgrammes.map((programme) => ({
        id: programme._id,
        title: programme.title,
        description: programme.summary,
        delivery: programme.delivery ?? null,
        image: programme.image
          ? {
              url: buildSanityProgrammeImageUrl(programme.image),
              alt: programme.image.alt,
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

  return (
    <main className={`school-page school-page-${school.slug}`}>
      <SiteHeader />

      <section className="school-detail-hero">
        <div className="school-detail-copy">
          <Link className="breadcrumb" href={localizeHref(locale, '/#schools')}>
            {copy.schoolsLabel} <span aria-hidden="true">/</span> {school.name}
          </Link>
          <p className="eyebrow">{school.eyebrow}</p>
          <h1>{school.headline}</h1>
          <p className="school-detail-lede">{school.introduction}</p>
          <div className="hero-actions">
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

        <div className="school-detail-visual" aria-hidden="true">
          <span className="detail-number">{school.number}</span>
          <div className="detail-orbit detail-orbit-outer" />
          <div className="detail-orbit detail-orbit-inner" />
          <div className="detail-core">{school.name.charAt(0)}</div>
          <div className="detail-words">
            {school.visualWords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="school-promise-band">
        <p>{copy.promiseLabel}</p>
        <blockquote>{school.promise}</blockquote>
      </section>

      <section id="programs" className="programs section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.programsEyebrow}</p>
            <h2>{copy.programsTitle}</h2>
          </div>
          <p>{copy.programsBody}</p>
        </div>
        <div className="program-grid">
          {programmes.map((program, index) => (
            <article key={program.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {program.image ? (
                <Image
                  className={styles.programImage}
                  src={program.image.url}
                  alt={program.image.alt}
                  width={1200}
                  height={675}
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
              ) : null}
              <h3
                className={
                  program.image ? styles.programTitleWithImage : undefined
                }
                dir="auto"
              >
                {program.title}
              </h3>
              {program.delivery ? (
                <small className="program-delivery">{program.delivery}</small>
              ) : null}
              <p dir="auto">{program.description}</p>
              <Link href={localizeHref(locale, '/contact')}>
                {copy.askProgram} <b aria-hidden="true">→</b>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="school-method">
        <div className="method-heading">
          <p className="eyebrow eyebrow-light">{copy.journeyEyebrow}</p>
          <h2>{copy.journeyTitle}</h2>
        </div>
        <ol>
          {school.approach.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="audience section-shell">
        <div>
          <p className="eyebrow">{copy.audienceEyebrow}</p>
          <h2>{copy.audienceTitle}</h2>
        </div>
        <ul>
          {school.audiences.map((audience) => (
            <li key={audience}>{audience}</li>
          ))}
        </ul>
      </section>

      <aside className="school-note section-shell" aria-label={copy.noteAria}>
        <span>{copy.important}</span>
        <p>{school.note}</p>
      </aside>

      <section className="related-schools section-shell">
        <p className="eyebrow">{copy.relatedEyebrow}</p>
        <div className="related-heading">
          <h2>{copy.relatedTitle}</h2>
          <p>{copy.relatedBody}</p>
        </div>
        <div className="related-grid">
          {relatedSchools.map((related) => (
            <Link
              href={localizeHref(locale, `/schools/${related.slug}`)}
              key={related.slug}
            >
              <span>{related.number}</span>
              <h3>{related.name}</h3>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">{copy.ctaEyebrow}</p>
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaBody}</p>
        </div>
        <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
          {copy.startJourney} <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
