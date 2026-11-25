import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { approachCopy } from '../../lib/approach';
import {
  approachPhotos,
  illustrativePhotoCredit,
  type PeoplePhoto,
} from '../../lib/people-photos';
import { getRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = approachCopy[locale];
  const route = localizePathname(locale, '/approach');
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/approach'),
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

const stepPhotos: Record<string, PeoplePhoto | undefined> = {
  share: approachPhotos.share,
  listen: approachPhotos.listen,
  pathway: approachPhotos.pathway,
  practice: approachPhotos.practice,
};

/** A small luminous drawing for each step, made of light, not stickers. */
function StepGlyph({ kind }: { kind: string }) {
  return (
    <span className={`${styles.glyph} ${styles[`glyph_${kind}`] ?? ''}`}>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default async function ApproachPage() {
  const locale = await getRequestLocale();
  const copy = approachCopy[locale];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="approach-title">
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="approach-title">{copy.heroTitle}</h1>
          <p className={styles.lede}>{copy.heroBody}</p>
          <p className={styles.hint} aria-hidden="true">
            <span />
            {copy.scrollHint}
          </p>
        </section>

        <ol className={styles.journey}>
          {copy.steps.map((step, index) => (
            <li
              key={step.key}
              className={styles.step}
              aria-labelledby={`approach-step-${step.key}`}
            >
              <span className={styles.node} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.stepCard}>
                <div className={styles.stepText}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <h2 id={`approach-step-${step.key}`}>{step.title}</h2>
                  <p>{step.body}</p>
                  <ul>
                    {step.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div
                  className={
                    step.key === 'progress'
                      ? `${styles.stepVisual} ${styles.certificateVisual}`
                      : styles.stepVisual
                  }
                  data-media-source={illustrativePhotoCredit.source}
                  data-media-license={illustrativePhotoCredit.license}
                >
                  <Image
                    className={styles.stepPhoto}
                    src={
                      stepPhotos[step.key]?.src ?? approachPhotos.progress.src
                    }
                    alt={
                      stepPhotos[step.key]?.alt[locale] ??
                      approachPhotos.progress.alt[locale]
                    }
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                  {step.key === 'progress' ? null : (
                    <StepGlyph kind={step.key} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className={styles.cta} aria-labelledby="approach-cta-title">
          <p className={styles.eyebrow}>{copy.ctaEyebrow}</p>
          <h2 id="approach-cta-title">{copy.ctaTitle}</h2>
          <p>{copy.ctaBody}</p>
          <div className={styles.ctaActions}>
            <ButtonLink
              href={localizeHref(locale, '/schools#school-quiz')}
              size="lg"
              data-magnetic
            >
              {copy.ctaQuiz} <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink
              href={localizeHref(locale, '/contact')}
              size="lg"
              variant="secondary"
            >
              {copy.ctaContact}
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
