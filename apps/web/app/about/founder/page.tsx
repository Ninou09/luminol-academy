import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Image from 'next/image';

import { FounderTraining } from '../../../components/founder-training';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  founderContact,
  founderCopy,
  founderPath,
  founderPortrait,
  founderWebsite,
} from '../../../lib/founder';
import { getRequestLocale } from '../../../lib/request-locale';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = founderCopy[locale];
  const route = localizePathname(locale, founderPath);
  return {
    title: copy.name,
    description: copy.intro,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(founderPath),
    },
    openGraph: {
      title: copy.name,
      description: copy.intro,
      locale: getOpenGraphLocale(locale),
      type: 'profile',
      url: route,
      images: [founderPortrait.src],
    },
  };
}

export default async function FounderPage() {
  const locale = await getRequestLocale();
  const copy = founderCopy[locale];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="founder-title">
          <div className={styles.intro}>
            <p className={styles.role}>{copy.role}</p>
            <h1 id="founder-title">{copy.name}</h1>
            <p>{copy.intro}</p>
            <a className={styles.cta} href={founderWebsite}>
              {copy.website} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <figure
            className={styles.portrait}
            data-media-source={founderPortrait.source}
            data-media-crop="center-top"
          >
            <Image
              src={founderPortrait.src}
              alt={copy.name}
              fill
              priority
              sizes="(max-width: 760px) 90vw, (max-width: 1200px) 42vw, 480px"
            />
            <figcaption>
              <strong>31</strong>
              <span>{copy.years}</span>
            </figcaption>
          </figure>
        </section>
        <div className={styles.details}>
          <section aria-labelledby="founder-career">
            <h2 id="founder-career">{copy.career}</h2>
            <p>{copy.careerBody}</p>
          </section>
          <section aria-labelledby="founder-education">
            <h2 id="founder-education">{copy.education}</h2>
            <ul>
              {copy.qualifications.map((qualification) => (
                <li key={qualification}>{qualification}</li>
              ))}
            </ul>
          </section>
        </div>
        <FounderTraining locale={locale} />
        <section className={styles.contact} aria-labelledby="founder-contact">
          <h2 id="founder-contact">{copy.contact}</h2>
          <address>
            <a href={`mailto:${founderContact.email}`} dir="ltr">
              {founderContact.email}
            </a>
            <a href={`tel:${founderContact.phone}`} dir="ltr">
              {founderContact.phoneDisplay}
            </a>
          </address>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
