import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Image from 'next/image';

import { FounderGold } from '../../../components/founder-gold';
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

const contactLabels = {
  en: { email: 'Email', phone: 'Phone' },
  fr: { email: 'E-mail', phone: 'Téléphone' },
  ar: { email: 'البريد الإلكتروني', phone: 'الهاتف' },
} as const;

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
          <FounderGold className={styles.goldScene} />
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
            <a href={`mailto:${founderContact.email}`}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <span>
                <strong>{contactLabels[locale].email}</strong>
                <span dir="ltr">{founderContact.email}</span>
              </span>
            </a>
            <a href={`tel:${founderContact.phone}`}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M7 3H4a1 1 0 0 0-1 1c0 9 8 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2c-3-1-6-4-7-7l2-2z" />
              </svg>
              <span>
                <strong>{contactLabels[locale].phone}</strong>
                <span dir="ltr">{founderContact.phoneDisplay}</span>
              </span>
            </a>
            <a href={`https://wa.me/${founderContact.phone.slice(1)}`}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L4 20l1.1-3.8A8.5 8.5 0 1 1 20.5 11.5Z" />
                <path d="M9 8.2c-.8.3-.7 1.6 0 2.7 1 1.6 2.3 2.9 3.9 3.4 1.3.4 2.3 0 2.5-.7l-1.8-1.1-.8.8c-1.3-.5-2.4-1.5-3-2.9l.6-.7-.8-1.8Z" />
              </svg>
              <span>
                <strong>WhatsApp</strong>
                <span dir="ltr">{founderContact.phoneDisplay}</span>
              </span>
            </a>
          </address>
        </section>
      </main>
      <SiteFooter founderTheme />
    </>
  );
}
