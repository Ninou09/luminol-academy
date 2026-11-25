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
import { StoryRail } from './story-rail';

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

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="journal-title">
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="journal-title">{copy.heroTitle}</h1>
          <p className={styles.lede}>{copy.heroBody}</p>
        </section>

        <StoryRail locale={locale}>
          {journalArticles.map((article) => (
            <li key={article.slug}>
              <Link
                href={localizeHref(locale, `/journal/${article.slug}`)}
                className={styles.card}
              >
                <span className={styles.cardImage}>
                  <Image
                    src={article.cover}
                    alt={article.coverAlt[locale]}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                </span>
                <div className={styles.storyBody}>
                  <span className={styles.meta}>
                    {article.draft ? (
                      <span className={styles.draft}>{copy.draft}</span>
                    ) : null}
                    <span>
                      {article.minutes} {copy.minutes}
                    </span>
                  </span>
                  <h3>{article.title[locale]}</h3>
                  <span className={styles.summary}>
                    {article.summary[locale]}
                  </span>
                  <b className={styles.read}>
                    {copy.read}{' '}
                    <span aria-hidden="true">
                      {locale === 'ar' ? '←' : '→'}
                    </span>
                  </b>
                </div>
              </Link>
            </li>
          ))}
        </StoryRail>
      </main>
      <SiteFooter />
    </>
  );
}
