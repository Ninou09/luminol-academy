import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import {
  filterPublicProgrammes,
  parseProgrammeDiscoveryParams,
  programmeLanguageLabels,
} from '../../lib/programme-discovery';
import {
  buildSanityProgrammeImageUrl,
  getPublicProgrammes,
} from '../../lib/sanity';
import { schools } from '../../lib/schools';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programmes',
  description:
    'Explore published Luminol Academy programmes by school, language and learning goal.',
  alternates: { canonical: '/programmes' },
  openGraph: {
    title: 'Programmes | Luminol Academy',
    description:
      'Explore published Luminol Academy programmes by school, language and learning goal.',
    type: 'website',
    url: '/programmes',
  },
};

type ProgrammesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProgrammesPage({
  searchParams,
}: ProgrammesPageProps) {
  const filters = parseProgrammeDiscoveryParams(await searchParams);
  const sourceProgrammes = await getPublicProgrammes();
  const programmes = sourceProgrammes
    ? filterPublicProgrammes(sourceProgrammes, filters)
    : null;

  return (
    <main>
      <SiteHeader />

      <section className={`section-shell ${styles.hero}`}>
        <p className="eyebrow">Search & discovery</p>
        <h1>Find the Luminol programme that fits your next step.</h1>
        <p>
          Search the currently published programme catalogue, then narrow it by
          school or delivery language. Every filter stays in the URL so the
          result can be bookmarked or shared.
        </p>
      </section>

      <section className={`section-shell ${styles.discovery}`}>
        <form
          className={styles.filters}
          action="/programmes"
          method="get"
          role="search"
        >
          <label className={styles.queryField} htmlFor="programme-query">
            <span>Search programmes</span>
            <input
              id="programme-query"
              name="q"
              type="search"
              dir="auto"
              defaultValue={filters.query}
              maxLength={100}
              placeholder="Try leadership, English or stress"
            />
          </label>

          <label htmlFor="programme-school">
            <span>School</span>
            <select
              id="programme-school"
              name="school"
              defaultValue={filters.school ?? ''}
            >
              <option value="">All schools</option>
              {Object.values(schools).map((school) => (
                <option key={school.slug} value={school.slug}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="programme-language">
            <span>Delivery language</span>
            <select
              id="programme-language"
              name="language"
              defaultValue={filters.language ?? ''}
            >
              <option value="">All languages</option>
              {Object.entries(programmeLanguageLabels).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button type="submit">Apply filters</button>
            <Link href="/programmes">Clear</Link>
          </div>
        </form>

        {programmes === null ? (
          <div className={styles.emptyState} role="status">
            <h2>Programme discovery is temporarily unavailable.</h2>
            <p>
              The public catalogue could not be verified from the governed CMS
              source. You can still explore each Luminol school or contact the
              academy for current programme information.
            </p>
            <Link href="/#schools">Explore the three schools</Link>
          </div>
        ) : programmes.length === 0 ? (
          <div className={styles.emptyState} aria-live="polite">
            <h2>No published programmes match these filters.</h2>
            <p>Try a broader topic, another school or a different language.</p>
            <Link href="/programmes">Reset discovery</Link>
          </div>
        ) : (
          <div>
            <div className={styles.resultHeading} aria-live="polite">
              <p className="eyebrow">Published programmes</p>
              <h2>
                {programmes.length} programme
                {programmes.length === 1 ? '' : 's'}
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
                      {programme.featured ? <span>Featured</span> : null}
                    </div>
                    <h3 dir="auto">{programme.title}</h3>
                    <p dir="auto">{programme.summary}</p>
                    <ul
                      className={styles.tags}
                      aria-label="Programme details"
                    >
                      {programme.languages.map((language) => (
                        <li key={language}>
                          {programmeLanguageLabels[language]}
                        </li>
                      ))}
                      {programme.delivery ? <li>{programme.delivery}</li> : null}
                    </ul>
                    <div className={styles.cardActions}>
                      <Link href={`/schools/${programme.school}#programs`}>
                        View school
                      </Link>
                      <Link href="/contact">Ask Luminol</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
