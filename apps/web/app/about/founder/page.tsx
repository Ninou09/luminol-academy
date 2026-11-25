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
  founderJourney,
  founderPath,
  founderPortrait,
  founderWebsite,
} from '../../../lib/founder';
import { illustrativePhotoCredit } from '../../../lib/people-photos';
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
  const journey = founderJourney[locale];

  return (
    <>
      <SiteHeader founderTheme />
      <main
        id="main-content"
        tabIndex={-1}
        className={styles.page}
        data-founder-theme
      >
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
        <nav className={styles.chapters} aria-label={journey.navigation}>
          <a href="#founder-career">{journey.career}</a>
          <a href="#founder-training-title">{journey.training}</a>
          <a href="#founder-contact">{journey.contact}</a>
        </nav>
        <div className={styles.details}>
          <section aria-labelledby="founder-career" data-reveal>
            <h2 id="founder-career">{copy.career}</h2>
            <p>{copy.careerBody}</p>
            <div
              className={styles.studyPhoto}
              data-media-source={illustrativePhotoCredit.source}
              data-media-license={illustrativePhotoCredit.license}
              data-media-crop="center-center"
            >
              <Image
                src="/media/founder-study-still-life.webp"
                alt=""
                fill
                sizes="(max-width: 760px) 90vw, (max-width: 1200px) 46vw, 560px"
              />
            </div>
          </section>
          <section aria-labelledby="founder-education" data-reveal>
            <h2 id="founder-education">{journey.title}</h2>
            <ol className={styles.timeline}>
              {journey.entries.map(({ year, title, detail }, index) => (
                <li key={year}>
                  <details name="founder-milestones" open={index === 0}>
                    <summary>
                      <span className={styles.year}>{year}</span>
                      <span>{title}</span>
                    </summary>
                    <p>{detail}</p>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <FounderTraining locale={locale} />
        <section
          className={styles.contact}
          aria-labelledby="founder-contact"
          data-reveal
        >
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
      <SiteFooter founderTheme />
    </>
  );
}
