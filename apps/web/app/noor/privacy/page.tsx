import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  formatPolicyDate,
  NOOR_PRIVACY,
  NOOR_PRIVACY_PATH,
  NOOR_PRIVACY_UPDATED,
} from '../../../lib/noor-privacy';
import { getRequestLocale } from '../../../lib/request-locale';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = NOOR_PRIVACY[locale];
  const route = localizePathname(locale, NOOR_PRIVACY_PATH);

  return {
    title: copy.title,
    description: copy.intro,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(NOOR_PRIVACY_PATH),
    },
    openGraph: {
      title: copy.title,
      description: copy.intro,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'article',
      url: route,
    },
  };
}

/** The privacy policy of the Luminol Noor app, for its store listing. */
export default async function NoorPrivacyPage() {
  const locale = await getRequestLocale();
  const copy = NOOR_PRIVACY[locale];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <article className={styles.policy} aria-labelledby="noor-privacy-title">
          <header className={styles.header}>
            <h1 id="noor-privacy-title">{copy.title}</h1>
            <p className={styles.updated}>
              {copy.updated}:{' '}
              <time dateTime={NOOR_PRIVACY_UPDATED}>
                {formatPolicyDate(NOOR_PRIVACY_UPDATED)}
              </time>
            </p>
            <p className={styles.intro}>{copy.intro}</p>
          </header>
          {copy.sections.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
