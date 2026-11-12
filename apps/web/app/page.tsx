import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { AcademyImage } from '../components/academy-image';
import { BreathingSpace } from '../components/breathing-space';
import { CinematicBackdrop } from '../components/cinematic-backdrop';
import { InkBlot } from '../components/ink-blot';
import { MindSection } from '../components/mind-section';
import { CinematicScroll } from '../components/cinematic-scroll';
import { LuminousBackdrop } from '../components/luminous-backdrop';
import { OrganizationJsonLd } from '../components/organization-json-ld';
import { PublishedProgrammeSpotlight } from '../components/published-programme-spotlight';
import { SchoolConstellation } from '../components/school-constellation';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { ThoughtNetwork } from '../components/thought-network';
import { VelocityMarquee } from '../components/velocity-marquee';
import {
  brandArtworkCredit,
  commissionedScenes,
  cinematicCopy,
  schoolArtwork,
} from '../lib/academy-media';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSocialPreviewImage } from '../lib/social-preview-metadata';
import { getSchools } from '../lib/schools';
import styles from './home.module.css';
import { GlassIcon, type GlassIconName } from '../components/glass-icon';

const constellationCopy = {
  en: {
    eyebrow: 'One source of light',
    title: 'Three schools. One light.',
    hint: 'Scroll to watch each school emerge',
  },
  fr: {
    eyebrow: 'Une seule source de lumière',
    title: 'Trois écoles. Une seule lumière.',
    hint: 'Faites défiler pour voir chaque école naître',
  },
  ar: {
    eyebrow: 'مصدر واحد للنور',
    title: 'ثلاث مدارس. نور واحد.',
    hint: 'مرّر لترى كل مدرسة تنبثق',
  },
} as const satisfies Record<
  Locale,
  { eyebrow: string; title: string; hint: string }
>;

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

const approachIcons: GlassIconName[] = [
  'journey-listen',
  'journey-clarity',
  'journey-build',
];

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
  // Words rise in sequence; the heading text itself stays a single phrase.
  const splitWords = (text: string, offset = 0) =>
    text.split(/\s+/).map((word, index) => (
      <span
        className={styles.word}
        key={`${index}-${word}`}
        style={{ '--word-index': index + offset } as React.CSSProperties}
      >
        {word}{' '}
      </span>
    ));
  const titleWordCount = copy.heroTitle.split(/\s+/).length;

  return (
    <>
      <SiteHeader />
      <CinematicScroll />
      <OrganizationJsonLd description={publicCopy.site.description} />
      <main id="main-content" tabIndex={-1} className={styles.page} data-cosmos>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <LuminousBackdrop locale={locale} />
          <div className={styles.heroLocation} aria-hidden="true">
            <span>Luminol Academy</span>
            <span>{cinematic.location}</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-hero-exit>
              <span className={styles.pulse} aria-hidden="true" />
              {copy.heroEyebrow}
            </p>
            <h1
              id="hero-title"
              className={styles.heroTitle}
              data-hero-exit
              data-no-split
            >
              <span className={styles.titleLine}>
                {splitWords(copy.heroTitle)}
              </span>
              <span className={`${styles.titleLine} ${styles.titleAccent}`}>
                {splitWords(copy.heroAccent, titleWordCount)}
              </span>
            </h1>
          </div>
          <div className={styles.heroSummary}>
            <p className={styles.heroLede} data-hero-exit>
              {copy.heroLede}
            </p>
            <div className={styles.heroActions} data-hero-exit>
              <ButtonLink
                href={localizeHref(locale, '/programmes')}
                size="lg"
                data-magnetic
              >
                {copy.exploreSchools} <span aria-hidden="true">↘</span>
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/consultations')}
                size="lg"
                variant="secondary"
                data-magnetic
              >
                {copy.pathwayPsychology} <span aria-hidden="true">→</span>
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

        <PublishedProgrammeSpotlight locale={locale} />

        <SchoolConstellation
          {...constellationCopy[locale]}
          schools={schoolList.map((school) => ({
            slug: school.slug,
            number: school.number,
            name: school.name,
            promise: school.promise,
            href: `#${school.slug}`,
          }))}
        />

        <section
          id="schools"
          className={styles.section}
          aria-labelledby="home-schools-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.schoolsEyebrow}</p>
              <h2 id="home-schools-title" data-split>
                {copy.schoolsTitle}
              </h2>
            </div>
            <p data-scrub-text>{copy.schoolsIntro}</p>
          </div>
          <div className={styles.schoolGrid}>
            {schoolList.map((school, index) => (
              <article
                className={`${styles.schoolCard} ${schoolTone[school.slug]}`}
                id={school.slug}
                key={school.slug}
                aria-labelledby={`home-school-${school.slug}-title`}
                data-school-card
              >
                <div
                  className={styles.schoolArtWrap}
                  data-flip-in={index % 2 ? 'end' : 'start'}
                >
                  <figure
                    className={styles.schoolArt}
                    data-tilt="9"
                    data-academy-media={school.slug}
                    data-media-source={brandArtworkCredit.source}
                    data-media-license={brandArtworkCredit.license}
                    data-media-crop="center-center"
                  >
                    <span className={styles.artGlow} aria-hidden="true" />
                    <Image
                      className={styles.artImage}
                      src={schoolArtwork[school.slug].src}
                      alt={schoolArtwork[school.slug].alt[locale]}
                      width={schoolArtwork[school.slug].width}
                      height={schoolArtwork[school.slug].height}
                      sizes="(max-width: 800px) 100vw, 45vw"
                    />
                    <span className={styles.artGlare} aria-hidden="true" />
                    <span className={styles.artNumber} aria-hidden="true">
                      {school.number}
                    </span>
                  </figure>
                  <AcademyImage
                    className={styles.schoolInset}
                    school={school.slug}
                    locale={locale}
                    sizes="(max-width: 800px) 45vw, 18vw"
                    scene={commissionedScenes.inset[school.slug]}
                  />
                </div>
                <div className={styles.schoolDetails} data-reveal>
                  <div className={styles.schoolTop}>
                    <span>{school.number}</span>
                    <span aria-hidden="true">Luminol Academy</span>
                  </div>
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
          <ol className={styles.principles} data-stagger>
            {copy.principles.map((principle, index) => (
              <li key={principle.number}>
                <GlassIcon
                  name={approachIcons[index % approachIcons.length]!}
                  size="md"
                  delay={index}
                  className={styles.principleIcon}
                />
                <span>{principle.number}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

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
          words={[...schoolList.map((school) => school.name), ...copy.values]}
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
            <Link
              href={localizeHref(locale, '/consultations')}
              data-preview-src={schoolArtwork.psychology.src}
            >
              <span>01</span>
              {copy.pathwayPsychology}
              <b aria-hidden="true">↗</b>
            </Link>
            <Link
              href={localizeHref(locale, '/schools/languages')}
              data-preview-src={schoolArtwork.languages.src}
            >
              <span>02</span>
              {copy.pathwayLanguages}
              <b aria-hidden="true">↗</b>
            </Link>
            <Link
              href={localizeHref(locale, '/schools/training')}
              data-preview-src={schoolArtwork.training.src}
            >
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

        <aside className={styles.mediaCredits} aria-label={cinematic.credits}>
          <span>{cinematic.credits}</span>
          <a
            href="https://mixkit.co/free-stock-video/a-hand-runs-through-the-book-spines-in-the-library-50726/"
            target="_blank"
            rel="noreferrer"
          >
            Mixkit · 50726
          </a>
          <a
            href="https://mixkit.co/free-stock-video/reverse-tour-of-a-library-full-of-books-21595/"
            target="_blank"
            rel="noreferrer"
          >
            Mixkit · 21595
          </a>
          <span>{brandArtworkCredit.label[locale]}</span>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
