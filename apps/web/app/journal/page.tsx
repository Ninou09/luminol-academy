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
import { journalArticles, journalCopy } from '../../lib/journal';
import { getRequestLocale } from '../../lib/request-locale';
import styles from './journal.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = journalCopy[locale];
  const route = localizePathname(locale, '/journal');
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/journal'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
    },
  };
}

export default async function JournalPage() {
  const locale = await getRequestLocale();
  const copy = journalCopy[locale];
  const [lead, ...rest] = journalArticles;

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="journal-title">
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="journal-title">{copy.heroTitle}</h1>
          <p className={styles.lede}>{copy.heroBody}</p>
        </section>

        {lead ? (
          <Link
            href={localizeHref(locale, `/journal/${lead.slug}`)}
            className={styles.lead}
            aria-labelledby={`journal-${lead.slug}`}
          >
            <span className={styles.leadImage}>
              <Image
                src={lead.cover}
                alt={lead.coverAlt[locale]}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            </span>
            <span className={styles.leadBody}>
              <span className={styles.meta}>
                {lead.draft ? (
                  <span className={styles.draft}>{copy.draft}</span>
                ) : null}
                <span>
                  {lead.minutes} {copy.minutes}
                </span>
              </span>
              <h2 id={`journal-${lead.slug}`}>{lead.title[locale]}</h2>
              <span className={styles.summary}>{lead.summary[locale]}</span>
              <b className={styles.read}>
                {copy.read} <span aria-hidden="true">→</span>
              </b>
            </span>
          </Link>
        ) : null}

        <ul className={styles.grid}>
          {rest.map((article) => (
            <li key={article.slug}>
              <Link
                href={localizeHref(locale, `/journal/${article.slug}`)}
                className={styles.card}
                aria-labelledby={`journal-${article.slug}`}
              >
                <span className={styles.cardImage}>
                  <Image
                    src={article.cover}
                    alt={article.coverAlt[locale]}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                </span>
                <span className={styles.meta}>
                  {article.draft ? (
                    <span className={styles.draft}>{copy.draft}</span>
                  ) : null}
                  <span>
                    {article.minutes} {copy.minutes}
                  </span>
                </span>
                <h2 id={`journal-${article.slug}`}>{article.title[locale]}</h2>
                <span className={styles.summary}>
                  {article.summary[locale]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
