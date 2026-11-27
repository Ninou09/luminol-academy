import type { Metadata } from 'next';

import { buildPublicMetadata } from '../../../lib/public-metadata';
import { publicSearch } from '../../../lib/public-seo';
import Image, { getImageProps } from 'next/image';

import { localizePathname } from '@luminol/localization';

import { AcademyLogo } from '../../../components/academy-logo';
import { FounderGold } from '../../../components/founder-gold';
import { FounderTraining } from '../../../components/founder-training';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  founderContact,
  founderExperience,
  founderCopy,
  founderJourney,
  founderPath,
  founderEditorialPortrait,
  founderWebsite,
} from '../../../lib/founder';
import { founderPhotoCredit, founderPhotos } from '../../../lib/founder-photos';
import { getRequestLocale } from '../../../lib/request-locale';
import {
  buildFounderJsonLd,
  serializeJsonLd,
} from '../../../lib/structured-data';
import styles from './page.module.css';

const contactLabels = {
  en: { email: 'Email', phone: 'Phone' },
  fr: { email: 'E-mail', phone: 'Téléphone' },
  ar: { email: 'البريد الإلكتروني', phone: 'الهاتف' },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPublicMetadata(
    locale,
    '/about/founder',
    publicSearch['/about/founder'][locale],
    { profileImage: founderEditorialPortrait.src },
  );
}

export default async function FounderPage() {
  const locale = await getRequestLocale();
  const copy = founderCopy[locale];
  const journey = founderJourney[locale];
  const { props: mobilePortrait } = getImageProps({
    ...founderPhotos.vertical,
    alt: founderPhotos.vertical.alt[locale],
    sizes: '92vw',
  });
  const { '@context': context, ...person } = buildFounderJsonLd({
    name: copy.name,
    description: copy.intro,
    href: localizePathname(locale, founderPath),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': context,
            '@type': 'ProfilePage',
            url: person.url,
            mainEntity: {
              ...person,
              image: new URL(founderEditorialPortrait.src, person.url).href,
              sameAs: [founderWebsite],
            },
          }),
        }}
      />
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
            <div className={styles.introActions}>
              <a className={styles.cta} href={founderWebsite}>
                {copy.website} <span aria-hidden="true">↗</span>
              </a>
              <FounderGold className={styles.goldScene} ornate />
            </div>
          </div>
          <figure
            className={styles.portrait}
            data-media-source={founderEditorialPortrait.source}
            data-media-crop="desktop-full-mobile-right"
          >
            <Image
              src={founderEditorialPortrait.src}
              alt={copy.name}
              fill
              priority
              sizes="(max-width: 760px) 92vw, (max-width: 1200px) 94vw, 1152px"
            />
            <figcaption>
              <strong>
                <bdi>{founderExperience}</bdi>
              </strong>
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
            <figure
              className={styles.studyPhoto}
              data-media-source={founderPhotoCredit.source}
              data-media-license={founderPhotoCredit.license}
              data-media-crop="center-center"
            >
              <Image
                src={founderPhotos.notes.src}
                alt={founderPhotos.notes.alt[locale]}
                fill
                sizes="(max-width: 760px) 90vw, (max-width: 1200px) 46vw, 560px"
              />
            </figure>
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
            <figure
              className={styles.milestonePhoto}
              data-media-source={founderPhotoCredit.source}
              data-media-license={founderPhotoCredit.license}
              data-media-crop="desk-and-books"
            >
              <Image
                src={founderPhotos.milestones.src}
                alt={founderPhotos.milestones.alt[locale]}
                fill
                sizes="(max-width: 760px) 90vw, (max-width: 1200px) 46vw, 560px"
              />
            </figure>
          </section>
        </div>
        <FounderTraining locale={locale} />
        <figure
          className={styles.editorialPortrait}
          data-media-source={founderPhotoCredit.source}
          data-media-license={founderPhotoCredit.license}
          data-media-crop="wide-and-vertical"
        >
          <picture>
            <source
              media="(max-width: 600px)"
              srcSet={mobilePortrait.srcSet}
              sizes={mobilePortrait.sizes}
            />
            <Image
              src={founderPhotos.wide.src}
              alt={founderPhotos.wide.alt[locale]}
              fill
              sizes="(max-width: 1200px) 94vw, 1152px"
            />
          </picture>
          <AcademyLogo className={styles.signature ?? ''} />
        </figure>
        <section
          className={styles.contact}
          aria-labelledby="founder-contact"
          data-reveal
        >
          <div className={styles.contactCopy}>
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
          </div>
          <figure
            className={styles.contactPhoto}
            data-media-source={founderPhotoCredit.source}
            data-media-license={founderPhotoCredit.license}
            data-media-crop="right-center"
          >
            <Image
              src={founderPhotos.academy.src}
              alt={founderPhotos.academy.alt[locale]}
              fill
              sizes="(max-width: 760px) 90vw, 360px"
            />
          </figure>
        </section>
      </main>
      <SiteFooter founderTheme />
    </>
  );
}
