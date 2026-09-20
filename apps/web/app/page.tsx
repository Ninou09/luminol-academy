import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AcademyImage } from '../components/academy-image';
import { CinematicBackdrop } from '../components/cinematic-backdrop';
import { CinematicScroll } from '../components/cinematic-scroll';
import { KnowledgeSculpture } from '../components/knowledge-sculpture';
import { OrganizationJsonLd } from '../components/organization-json-ld';
import { PublishedProgrammeSpotlight } from '../components/published-programme-spotlight';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { academyMedia, cinematicCopy } from '../lib/academy-media';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSocialPreviewImage } from '../lib/social-preview-metadata';
import { getSchools } from '../lib/schools';
import styles from './home.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const route = localizePathname(locale, '/');
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: { absolute: 'Luminol Academy' },
    description: copy.site.description,
    alternates: { canonical: route, languages: buildLanguageAlternates('/') },
    openGraph: {
      title: 'Luminol Academy',
      description: copy.site.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Luminol Academy',
      description: copy.site.description,
      images: [socialPreview],
    },
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const publicCopy = getPublicCopy(locale);
  const copy = publicCopy.home;
  const schoolList = Object.values(getSchools(locale));
  const schoolTone = {
    psychology: styles.psychology ?? '',
    languages: styles.languages ?? '',
    training: styles.training ?? '',
  };
  const cinematic = cinematicCopy[locale];

  return (
    <>
      <SiteHeader />
      <CinematicScroll />
      <OrganizationJsonLd description={publicCopy.site.description} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <CinematicBackdrop
            pauseLabel={cinematic.pause}
            playLabel={cinematic.play}
          />
          <div className={styles.heroLocation} aria-hidden="true">
            <span>Luminol Academy</span>
            <span>{cinematic.location}</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              {copy.heroTitle} <span>{copy.heroAccent}</span>
            </h1>
            <p className={styles.heroLede}>{copy.heroLede}</p>
            <div className={styles.heroActions}>
              <ButtonLink href={localizeHref(locale, '/programmes')} size="lg">
                {copy.exploreSchools} <span aria-hidden="true">↘</span>
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/consultations')}
                size="lg"
                variant="secondary"
              >
                {copy.pathwayPsychology} <span aria-hidden="true">→</span>
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
          <KnowledgeSculpture className={styles.heroSculpture ?? ''} />
          <a className={styles.scrollCue} href="#schools">
            {cinematic.discover} <span aria-hidden="true">↓</span>
          </a>
        </section>

        <PublishedProgrammeSpotlight locale={locale} />

        <section
          id="schools"
          className={styles.section}
          aria-labelledby="home-schools-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.schoolsEyebrow}</p>
              <h2 id="home-schools-title">{copy.schoolsTitle}</h2>
            </div>
            <p>{copy.schoolsIntro}</p>
          </div>
          <div className={styles.schoolGrid}>
            {schoolList.map((school) => (
              <article
                className={`${styles.schoolCard} ${schoolTone[school.slug]}`}
                id={school.slug}
                key={school.slug}
                aria-labelledby={`home-school-${school.slug}-title`}
                data-school-card
                data-reveal
              >
                <div className={styles.schoolTop}>
                  <span>{school.number}</span>
                  <span className={styles.schoolGlyph} aria-hidden="true" />
                </div>
                <AcademyImage
                  className={styles.schoolPhoto}
                  school={school.slug}
                  locale={locale}
                  sizes="(max-width: 1000px) 100vw, 33vw"
                />
                <h3 id={`home-school-${school.slug}-title`}>{school.name}</h3>
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
                  aria-label={`${copy.discoverSchool}: ${school.name}`}
                >
                  {copy.discoverSchool} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          id="approach"
          className={styles.approach}
          aria-labelledby="home-approach-title"
        >
          <div className={styles.approachIntro} data-reveal>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.approachEyebrow}
            </p>
            <h2 id="home-approach-title">{copy.approachTitle}</h2>
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

        <section
          id="about"
          className={`${styles.section} ${styles.about}`}
          aria-labelledby="home-about-title"
        >
          <AcademyImage
            className={styles.aboutVisual}
            school="psychology"
            locale={locale}
            sizes="(max-width: 1000px) 100vw, 40vw"
          />
          <div className={styles.aboutCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.aboutEyebrow}</p>
            <h2 id="home-about-title">{copy.aboutTitle}</h2>
            <p className={styles.aboutLede}>{copy.aboutLede}</p>
            <p>{copy.aboutBody}</p>
            <div className={styles.values}>
              {copy.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.mediaCredits} aria-label={cinematic.credits}>
          <span>{cinematic.credits}</span>
          {Object.values(academyMedia).map((media) => (
            <a
              key={media.sourceUrl}
              href={media.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {media.credit}
            </a>
          ))}
        </aside>

        <section
          className={`${styles.section} ${styles.pathway}`}
          aria-labelledby="pathway-title"
        >
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.pathwayEyebrow}</p>
            <h2 id="pathway-title">{copy.pathwayTitle}</h2>
          </div>
          <nav
            className={styles.pathwayLinks}
            aria-labelledby="pathway-title"
            data-reveal
          >
            <Link href={localizeHref(locale, '/consultations')}>
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
          </nav>
        </section>

        <section
          id="contact"
          className={styles.cta}
          aria-labelledby="home-contact-title"
          data-reveal
        >
          <div>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.ctaEyebrow}
            </p>
            <h2 id="home-contact-title">{copy.ctaTitle}</h2>
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
