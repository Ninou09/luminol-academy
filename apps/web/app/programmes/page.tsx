import { recordSearchTelemetry, SearchSurface } from '@luminol/database';
import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import {
  filterPublicProgrammes,
  parseProgrammeDiscoveryParams,
} from '../../lib/programme-discovery';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import {
  buildSanityProgrammeImageUrl,
  getPublicProgrammes,
} from '../../lib/sanity';
import { getSchools } from '../../lib/schools';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).programmes;
  const route = localizePathname(locale, '/programmes');
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/programmes'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [socialPreview],
    },
  };
}

type ProgrammesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProgrammesPage({
  searchParams,
}: ProgrammesPageProps) {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).programmes;
  const schools = getSchools(locale);
  const filters = parseProgrammeDiscoveryParams(await searchParams);
  const sourceProgrammes = await getPublicProgrammes();
  const programmes = sourceProgrammes
    ? filterPublicProgrammes(sourceProgrammes, filters)
    : null;

  if (programmes !== null && filters.query.length >= 2) {
    await recordSearchTelemetry({
      surface: SearchSurface.PUBLIC_PROGRAMMES,
      resultCount: programmes.length,
    });
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className={`section-shell ${styles.hero}`}>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
        </section>

        <section className={`section-shell ${styles.discovery}`}>
          <form
            className={styles.filters}
            action={localizeHref(locale, '/programmes')}
            method="get"
            role="search"
          >
            <label className={styles.queryField} htmlFor="programme-query">
              <span>{copy.searchLabel}</span>
              <input
                id="programme-query"
                name="q"
                type="search"
                dir="auto"
                defaultValue={filters.query}
                maxLength={100}
                placeholder={copy.searchPlaceholder}
              />
            </label>

            <label htmlFor="programme-school">
              <span>{copy.schoolLabel}</span>
              <select
                id="programme-school"
                name="school"
                defaultValue={filters.school ?? ''}
              >
                <option value="">{copy.allSchools}</option>
                {Object.values(schools).map((school) => (
                  <option key={school.slug} value={school.slug}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="programme-language">
              <span>{copy.languageLabel}</span>
              <select
                id="programme-language"
                name="language"
                defaultValue={filters.language ?? ''}
              >
                <option value="">{copy.allLanguages}</option>
                {Object.entries(copy.languageNames).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.filterActions}>
              <button type="submit">{copy.apply}</button>
              <Link href={localizeHref(locale, '/programmes')}>
                {copy.clear}
              </Link>
            </div>
          </form>

          {programmes === null ? (
            <div className={styles.emptyState} role="status">
              <h2>{copy.unavailableTitle}</h2>
              <p>{copy.unavailableBody}</p>
              <Link href={localizeHref(locale, '/#schools')}>
                {copy.exploreSchools}
              </Link>
            </div>
          ) : programmes.length === 0 ? (
            <div className={styles.emptyState} aria-live="polite">
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyBody}</p>
              <Link href={localizeHref(locale, '/programmes')}>
                {copy.reset}
              </Link>
            </div>
          ) : (
            <div>
              <div className={styles.resultHeading} aria-live="polite">
                <p className="eyebrow">{copy.published}</p>
                <h2>
                  {programmes.length}{' '}
                  {programmes.length === 1
                    ? copy.programmeSingular
                    : copy.programmePlural}
                </h2>
              </div>

              <div className={styles.grid}>
                {programmes.map((programme) => (
                  <article className={styles.card} key={programme._id}>
                    {programme.image ? (
                      <Image
                        className={styles.image}
                        src={buildSanityProgrammeImageUrl(programme.image)}
                        alt={programme.image.alt}
                        width={1200}
                        height={675}
                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      />
                    ) : null}

                    <div className={styles.cardBody}>
                      <div className={styles.meta}>
                        <span>{schools[programme.school].name}</span>
                        {programme.featured ? (
                          <span>{copy.featured}</span>
                        ) : null}
                      </div>
                      <h3 dir="auto">{programme.title}</h3>
                      <p dir="auto">{programme.summary}</p>
                      <ul className={styles.tags} aria-label={copy.detailsAria}>
                        {programme.languages.map((language) => (
                          <li key={language}>{copy.languageNames[language]}</li>
                        ))}
                        {programme.delivery ? (
                          <li>{programme.delivery}</li>
                        ) : null}
                      </ul>
                      <div className={styles.cardActions}>
                        <Link
                          href={localizeHref(
                            locale,
                            `/schools/${programme.school}#programs`,
                          )}
                        >
                          {copy.viewSchool}
                        </Link>
                        <Link href={localizeHref(locale, '/contact')}>
                          {copy.askLuminol}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
