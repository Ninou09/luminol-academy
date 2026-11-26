import { localizeHref } from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';

import { buildPublicMetadata } from '../lib/public-metadata';
import { publicSearch } from '../lib/public-seo';
import Image from 'next/image';
import Link from 'next/link';

import { BreathingSpace } from '../components/breathing-space';
import { CinematicBackdrop } from '../components/cinematic-backdrop';
import { InkBlot } from '../components/ink-blot';
import { MindSection } from '../components/mind-section';
import { CinematicScroll } from '../components/cinematic-scroll';
import { LuminousBackdrop } from '../components/luminous-backdrop';
import { OrganizationJsonLd } from '../components/organization-json-ld';
import { PublishedProgrammeSpotlight } from '../components/published-programme-spotlight';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { ThoughtNetwork } from '../components/thought-network';
import { VelocityMarquee } from '../components/velocity-marquee';
import { cinematicCopy } from '../lib/academy-media';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSchools } from '../lib/schools';
import styles from './home.module.css';
import { EventsSection } from '../components/events-section';
import { PhotoBand } from '../components/live-photo';
import {
  homeSchoolPhotos,
  illustrativePhotoCredit,
  peoplePhotos,
} from '../lib/people-photos';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPublicMetadata(locale, '/', publicSearch['/'][locale]);
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
      <OrganizationJsonLd description={publicSearch['/'][locale].description} />
      <main id="main-content" tabIndex={-1} className={styles.page} data-cosmos>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <LuminousBackdrop locale={locale} />
          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle} data-no-split>
              {publicSearch['/'][locale].heading}
            </h1>
            <p className={styles.heroLede}>{copy.heroLede}</p>
            <div className={styles.heroActions}>
              <ButtonLink
                href={localizeHref(locale, '/consultations')}
                size="lg"
              >
                {copy.bookConsultation}
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/programmes')}
                size="lg"
                variant="secondary"
              >
                {copy.exploreSchools}
              </ButtonLink>
            </div>
          </div>
          <a className={styles.scrollCue} href="#schools">
            {cinematic.discover} <span aria-hidden="true">↓</span>
          </a>
        </section>
        <dl
          className={styles.proof}
          aria-label={copy.strengthsAria}
          data-stagger
        >
          <div>
            <dt data-count="3">3</dt>
            <dd>{copy.connectedSchools}</dd>
          </div>
          <div>
            <dt data-count="31">31+</dt>
            <dd>{copy.humanJourney}</dd>
          </div>
          <div>
            <dt>AR · FR · EN</dt>
            <dd>{copy.multilingualFoundation}</dd>
          </div>
        </dl>

        <PublishedProgrammeSpotlight locale={locale} />

        <section
          id="schools"
          className={`${styles.section} ${styles.schoolsSection}`}
          aria-labelledby="home-schools-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <h2 id="home-schools-title" data-split>
                {copy.schoolsEyebrow}
              </h2>
            </div>
          </div>
          <div className={styles.schoolGrid}>
            {schoolList.map((school) => (
              <article
                className={`${styles.schoolCard} ${schoolTone[school.slug]}`}
                id={school.slug}
                key={school.slug}
                aria-labelledby={`home-school-${school.slug}-title`}
                data-school-card
              >
                <figure
                  className={styles.schoolArt}
                  data-academy-media={school.slug}
                  data-media-source={illustrativePhotoCredit.source}
                  data-media-license={illustrativePhotoCredit.license}
                  data-media-crop="center-center"
                >
                  <Image
                    className={styles.schoolPhoto}
                    src={homeSchoolPhotos[school.slug].src}
                    alt={homeSchoolPhotos[school.slug].alt[locale]}
                    fill
                    sizes="(max-width: 620px) 90vw, (max-width: 1000px) 38vw, 27vw"
                  />
                  <figcaption className="scene-caption">
                    {illustrativePhotoCredit.label[locale]}
                  </figcaption>
                </figure>
                <div className={styles.schoolDetails}>
                  <h3 id={`home-school-${school.slug}-title`}>{school.name}</h3>
                  <p className={styles.schoolPromise}>{school.promise}</p>
                  <Link
                    className={styles.textLink}
                    href={localizeHref(locale, `/schools/${school.slug}`)}
                    aria-label={`${copy.discoverSchool}: ${school.name}`}
                  >
                    {copy.discoverSchool}{' '}
                    <span aria-hidden="true">
                      {locale === 'ar' ? '←' : '→'}
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <MindSection locale={locale} />

        <section
          id="approach"
          className={styles.approach}
          aria-labelledby="home-approach-title"
          data-spotlight
        >
          <ThoughtNetwork className={styles.network} />
          <div className={styles.approachIntro} data-reveal>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.approachEyebrow}
            </p>
            <h2 id="home-approach-title" data-split>
              {copy.approachTitle}
            </h2>
            <p data-scrub-text>{copy.approachIntro}</p>
          </div>
          <div className={styles.approachSide} data-reveal>
            <div className={styles.approachLink}>
              <Link
                className={styles.textLink}
                href={localizeHref(locale, '/approach')}
              >
                {copy.approachEyebrow} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <EventsSection locale={locale} />

        <PhotoBand
          photo={peoplePhotos.academyLecture}
          locale={locale}
          reveal="portal"
        />

        <BreathingSpace locale={locale} />

        <section
          id="about"
          className={`${styles.section} ${styles.about}`}
          aria-labelledby="home-about-title"
        >
          <div
            className={`${styles.aboutVisualWrap} ${styles.aboutFilm}`}
            data-depth="0.08"
          >
            <CinematicBackdrop
              pauseLabel={cinematic.pause}
              playLabel={cinematic.play}
              src="/media/cinematic/hero-loop.mp4"
              poster="/media/cinematic/hero-poster.webp"
            />
            <span className={styles.aboutFilmGlow} aria-hidden="true" />
          </div>
          <div className={styles.aboutCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.aboutEyebrow}</p>
            <h2 id="home-about-title" data-split>
              {copy.aboutTitle}
            </h2>
            <p className={styles.aboutLede} data-scrub-text>
              {copy.aboutLede}
            </p>
            <p>{copy.aboutBody}</p>
            <div className={styles.values}>
              {copy.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        </section>

        <VelocityMarquee
          words={schoolList.flatMap((school) =>
            school.eyebrow.split('·').map((word) => word.trim()),
          )}
        />

        <section
          className={`${styles.section} ${styles.pathway} ${styles.pathwayFilm}`}
          aria-labelledby="pathway-title"
        >
          <CinematicBackdrop
            pauseLabel={cinematic.pause}
            playLabel={cinematic.play}
          />
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.pathwayEyebrow}</p>
            <h2 id="pathway-title" data-split>
              {copy.pathwayTitle}
            </h2>
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
          data-spotlight
        >
          <InkBlot className={styles.inkBlot} />
          <div data-reveal>
            <p className={`${styles.eyebrow} ${styles.light}`}>
              {copy.ctaEyebrow}
            </p>
            <h2 id="home-contact-title" data-split>
              {copy.ctaTitle}
            </h2>
            <p>{copy.ctaBody}</p>
          </div>
          <ButtonLink
            href={localizeHref(locale, '/contact')}
            size="lg"
            data-magnetic
          >
            {copy.startConversation} <span aria-hidden="true">→</span>
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
