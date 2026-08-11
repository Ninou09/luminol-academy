import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;
  const route = localizePathname(locale, '/about');
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/about'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      siteName: 'Luminol Academy',
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

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;
  const schoolCards = [
    {
      slug: 'psychology',
      number: '01',
      name: copy.psychologyName,
      tagline: copy.psychologyTagline,
      tone: styles.psychology ?? '',
    },
    {
      slug: 'languages',
      number: '02',
      name: copy.languagesName,
      tagline: copy.languagesTagline,
      tone: styles.languages ?? '',
    },
    {
      slug: 'training',
      number: '03',
      name: copy.trainingName,
      tagline: copy.trainingTagline,
      tone: styles.training ?? '',
    },
  ] as const;

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="about-hero-title"
          data-about-hero
        >
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
            <h1 id="about-hero-title">{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
          </div>
          <div className={styles.heroVisual} aria-hidden="true" data-reveal>
            <div className={styles.rays} />
            <div className={styles.orbit} data-motion-orbit />
            <span className={styles.core} data-motion-float>
              L
            </span>
            <p>{copy.visualCaption}</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.origin}`}>
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.originEyebrow}</p>
            <h2>{copy.originTitle}</h2>
          </div>
          <div className={styles.originCopy} data-reveal>
            <p className={styles.originLede}>{copy.originLede}</p>
            <p>{copy.originBodyOne}</p>
            <p>{copy.originBodyTwo}</p>
          </div>
        </section>

        <section className={styles.missionVision}>
          <article data-reveal>
            <span>{copy.missionLabel}</span>
            <h2>{copy.missionTitle}</h2>
            <p>{copy.missionBody}</p>
          </article>
          <article data-reveal>
            <span>{copy.visionLabel}</span>
            <h2>{copy.visionTitle}</h2>
            <p>{copy.visionBody}</p>
          </article>
        </section>

        <section className={styles.section} aria-labelledby="values-title">
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.valuesEyebrow}</p>
              <h2 id="values-title">{copy.valuesTitle}</h2>
            </div>
            <p>{copy.valuesBody}</p>
          </div>
          <div className={styles.valueGrid}>
            {copy.values.map((value) => (
              <article
                className={styles.valueCard}
                key={value.number}
                data-value-card
                data-reveal
              >
                <span>{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.ecosystem}`}
          aria-labelledby="ecosystem-title"
        >
          <div className={styles.ecosystemHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.oneJourney}</p>
              <h2 id="ecosystem-title">Luminol</h2>
            </div>
          </div>
          <div className={styles.ecosystemStage} data-reveal>
            <div className={styles.ecosystemCore} data-motion-float>
              Luminol
              <small>{copy.oneJourney}</small>
            </div>
            {schoolCards.map((school) => (
              <Link
                className={`${styles.schoolCard} ${school.tone}`}
                href={localizeHref(locale, `/schools/${school.slug}`)}
                key={school.slug}
                data-ecosystem-school={school.slug}
              >
                <span>{school.number}</span>
                <h3>{school.name}</h3>
                <p>{school.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.cta} data-reveal>
          <div className={styles.ctaText}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.ctaEyebrow}
            </p>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaBody}</p>
          </div>
          <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
            {copy.ctaAction} <span aria-hidden="true">→</span>
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
