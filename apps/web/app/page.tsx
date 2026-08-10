import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter, SiteHeader } from '../components/site-shell';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSchools } from '../lib/schools';
import styles from './home.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const route = localizePathname(locale, '/');

  return {
    title: { absolute: 'Luminol Academy' },
    description: copy.site.description,
    alternates: { canonical: route, languages: buildLanguageAlternates('/') },
    openGraph: {
      title: 'Luminol Academy',
      description: copy.site.description,
      type: 'website',
      url: route,
    },
    twitter: {
      card: 'summary',
      title: 'Luminol Academy',
      description: copy.site.description,
    },
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).home;
  const schoolList = Object.values(getSchools(locale));
  const schoolTone = {
    psychology: styles.psychology ?? '',
    languages: styles.languages ?? '',
    training: styles.training ?? '',
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              {copy.heroTitle}
              <span>{copy.heroAccent}</span>
            </h1>
            <p className={styles.heroLede}>{copy.heroLede}</p>
            <div className={styles.heroActions}>
              <ButtonLink href="#schools" size="lg">
                {copy.exploreSchools} <span aria-hidden="true">↘</span>
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/about')}
                size="lg"
                variant="secondary"
              >
                {copy.discoverLuminol}
              </ButtonLink>
            </div>
            <dl className={styles.proof} aria-label={copy.strengthsAria}>
              <div>
                <dt>3</dt>
                <dd>{copy.connectedSchools}</dd>
              </div>
              <div>
                <dt>1</dt>
                <dd>{copy.humanJourney}</dd>
              </div>
              <div>
                <dt>AR · FR · EN</dt>
                <dd>{copy.multilingualFoundation}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.stage} aria-hidden="true" data-reveal>
            <div className={styles.stageGrid} />
            <div className={styles.glow} data-motion-float />
            <div className={styles.orbit} data-motion-orbit />
            <div
              className={`${styles.orbit} ${styles.orbitInner}`}
              data-motion-orbit="reverse"
            />
            <div className={styles.core} data-motion-float>
              Lu
            </div>
            <div
              className={`${styles.signal} ${styles.signalOne}`}
              data-motion-float
            >
              <span>{copy.mind}</span>
              <strong>{copy.understand}</strong>
            </div>
            <div
              className={`${styles.signal} ${styles.signalTwo}`}
              data-motion-float
            >
              <span>{copy.voice}</span>
              <strong>{copy.connect}</strong>
            </div>
            <div
              className={`${styles.signal} ${styles.signalThree}`}
              data-motion-float
            >
              <span>{copy.work}</span>
              <strong>{copy.advance}</strong>
            </div>
          </div>
        </section>

        <section id="schools" className={styles.section}>
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.schoolsEyebrow}</p>
              <h2>{copy.schoolsTitle}</h2>
            </div>
            <p>{copy.schoolsIntro}</p>
          </div>
          <div className={styles.schoolGrid}>
            {schoolList.map((school) => (
              <article
                className={`${styles.schoolCard} ${schoolTone[school.slug]} school-card`}
                id={school.slug}
                key={school.slug}
                data-reveal
              >
                <div className={styles.schoolTop}>
                  <span>{school.number}</span>
                  <span className={styles.schoolGlyph} aria-hidden="true" />
                </div>
                <h3>{school.name}</h3>
                <p className={styles.schoolPromise}>{school.promise}</p>
                <p className={styles.schoolDescription}>
                  {school.introduction}
                </p>
                <ul aria-label={`${school.name} — ${copy.focusAreas}`}>
                  {school.programs.slice(0, 3).map((program) => (
                    <li key={program.title}>{program.title}</li>
                  ))}
                </ul>
                <Link
                  className={styles.textLink}
                  href={localizeHref(locale, `/schools/${school.slug}`)}
                >
                  {copy.discoverSchool} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="approach" className={styles.approach}>
          <div className={styles.approachIntro} data-reveal>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.approachEyebrow}
            </p>
            <h2>{copy.approachTitle}</h2>
            <p>{copy.approachIntro}</p>
          </div>
          <ol className={styles.principles}>
            {copy.principles.map((principle) => (
              <li key={principle.number} data-reveal>
                <span>{principle.number}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="about" className={`${styles.section} ${styles.about}`}>
          <div className={styles.aboutVisual} aria-hidden="true" data-reveal>
            <div className={styles.monogram}>L</div>
            <p>{copy.aboutVisual}</p>
          </div>
          <div className={styles.aboutCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.aboutEyebrow}</p>
            <h2>{copy.aboutTitle}</h2>
            <p className={styles.aboutLede}>{copy.aboutLede}</p>
            <p>{copy.aboutBody}</p>
            <div className={styles.values}>
              {copy.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.pathway}`}
          aria-labelledby="pathway-title"
        >
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.pathwayEyebrow}</p>
            <h2 id="pathway-title">{copy.pathwayTitle}</h2>
          </div>
          <div className={styles.pathwayLinks} data-reveal>
            <Link href={localizeHref(locale, '/schools/psychology')}>
              <span>01</span>
              {copy.pathwayPsychology}
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href={localizeHref(locale, '/schools/languages')}>
              <span>02</span>
              {copy.pathwayLanguages}
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href={localizeHref(locale, '/schools/training')}>
              <span>03</span>
              {copy.pathwayTraining}
              <b aria-hidden="true">↗</b>
            </Link>
          </div>
        </section>

        <section id="contact" className={styles.cta} data-reveal>
          <div>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.ctaEyebrow}
            </p>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaBody}</p>
          </div>
          <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
            {copy.startConversation} <span aria-hidden="true">→</span>
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
