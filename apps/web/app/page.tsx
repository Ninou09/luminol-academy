import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AcademyImage } from '../components/academy-image';
import { CinematicBackdrop } from '../components/cinematic-backdrop';
import { CinematicScroll } from '../components/cinematic-scroll';
import { EnquiryForm } from '../components/enquiry-form';
import { LearningFilm } from '../components/learning-film';
import { StockImage } from '../components/stock-image';
import { OrganizationJsonLd } from '../components/organization-json-ld';
import { PublishedProgrammeSpotlight } from '../components/published-programme-spotlight';
import { ProvidedFrenchImage } from '../components/provided-image';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { experienceCopy } from '../lib/experience-copy';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSocialPreviewImage } from '../lib/social-preview-metadata';
import { getSchools } from '../lib/schools';
import { academyTestimonials, testimonialCopy } from '../lib/testimonials';
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
  const copy = experienceCopy[locale];
  const schools = Object.values(getSchools(locale));
  const voices = testimonialCopy[locale];

  return (
    <>
      <SiteHeader />
      <CinematicScroll />
      <OrganizationJsonLd description={publicCopy.site.description} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <CinematicBackdrop
            pauseLabel={copy.pauseFilm}
            playLabel={copy.playFilm}
            filmNote={copy.filmNote}
          />
          <div className={styles.heroCopy}>
            <p className={styles.welcome}>{copy.welcome}</p>
            <h1 id="hero-title">
              {copy.title} <em>{copy.accent}</em>
            </h1>
            <p className={styles.heroLede}>{copy.intro}</p>
            <div className={styles.heroActions}>
              <Link
                className={styles.whiteButton}
                href={localizeHref(locale, '/programmes')}
              >
                {copy.explore}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className={styles.ghostButton}
                href={localizeHref(
                  locale,
                  '/consultations#consultation-enquiry',
                )}
              >
                {copy.consultation}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className={styles.heroBottom}>
            <span>{copy.location}</span>
            <a href="#spirit">
              {copy.scroll}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <nav className={styles.schoolRail} aria-label={copy.schools}>
          {schools.map((school) => (
            <Link
              key={school.slug}
              href={localizeHref(locale, `/schools/${school.slug}`)}
            >
              <span>{school.number}</span>
              <strong>{school.name}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </nav>

        <section
          id="spirit"
          className={`${styles.section} ${styles.spirit}`}
          aria-labelledby="spirit-title"
        >
          <div className={styles.spiritImages} data-depth-scene>
            <StockImage
              asset="community"
              locale={locale}
              className={styles.spiritPortrait}
              sizes="(max-width: 700px) 65vw, 32vw"
            />
            <StockImage
              asset="online"
              locale={locale}
              className={styles.spiritDetail}
              sizes="(max-width: 700px) 50vw, 22vw"
            />
            <span className={styles.imageStamp} aria-hidden="true">
              Luminol
            </span>
          </div>
          <div className={styles.spiritCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.communityLabel}</p>
            <h2 id="spirit-title">{copy.communityTitle}</h2>
            <p>{copy.communityBody}</p>
            <Link
              className={styles.textLink}
              href={localizeHref(locale, '/about')}
            >
              {copy.about}
              <span aria-hidden="true">↗</span>
            </Link>
            <div className={styles.facts}>
              <div className={styles.founderStat}>
                <strong dir="ltr">
                  30<span>+</span>
                </strong>
                <p>{copy.founder}</p>
              </div>
              <div className={styles.founderStat}>
                <strong dir="ltr">0{schools.length}</strong>
                <p>{copy.schools}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="schools"
          className={styles.schools}
          aria-labelledby="schools-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.schools}</p>
              <h2 id="schools-title">{copy.schoolTitle}</h2>
            </div>
            <p>{copy.schoolBody}</p>
          </div>
          <div className={styles.schoolGrid}>
            {schools.map((school) => (
              <article
                key={school.slug}
                className={styles.schoolCard}
                data-school={school.slug}
                data-school-card
                aria-labelledby={`school-${school.slug}-title`}
              >
                <Link
                  href={localizeHref(locale, `/schools/${school.slug}`)}
                  aria-label={`${publicCopy.home.discoverSchool}: ${school.name}`}
                >
                  <div className={styles.schoolPhoto}>
                    {school.slug === 'psychology' ? (
                      <AcademyImage
                        asset="psychology"
                        locale={locale}
                        sizes="(max-width: 700px) 100vw, 34vw"
                      />
                    ) : school.slug === 'languages' ? (
                      <ProvidedFrenchImage locale={locale} />
                    ) : (
                      <StockImage
                        asset="speaking"
                        locale={locale}
                        sizes="(max-width: 700px) 100vw, 34vw"
                      />
                    )}
                    <span className={styles.schoolNumber}>{school.number}</span>
                  </div>
                  <div className={styles.schoolContent}>
                    <h3 id={`school-${school.slug}-title`}>{school.name}</h3>
                    <p>{school.promise}</p>
                    <ul className={styles.schoolTopics}>
                      {school.programs.slice(0, 3).map((programme) => (
                        <li key={programme.title}>{programme.title}</li>
                      ))}
                    </ul>
                    <span className={styles.schoolAction}>
                      {publicCopy.home.discoverSchool}
                      <b aria-hidden="true">↗</b>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          id="approach"
          className={styles.journey}
          aria-labelledby="journey-title"
        >
          <div className={styles.journeyHeading} data-reveal>
            <p className={styles.eyebrow}>{copy.journeyLabel}</p>
            <h2 id="journey-title">{copy.journeyTitle}</h2>
            <p>{copy.journeyIntro}</p>
          </div>
          <div className={styles.chapters}>
            {copy.chapters.map((chapter, index) => (
              <article
                className={styles.chapter}
                key={chapter.word}
                data-depth-scene
              >
                <div className={styles.chapterCopy}>
                  <p className={styles.eyebrow}>{chapter.label}</p>
                  <h3>{chapter.word}</h3>
                  <p>{chapter.body}</p>
                  <Link
                    className={styles.textLink}
                    href={localizeHref(
                      locale,
                      `/schools/${schools[index]?.slug ?? 'training'}`,
                    )}
                  >
                    {schools[index]?.name}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                {index === 0 ? (
                  <LearningFilm
                    locale={locale}
                    className={styles.chapterImage}
                  />
                ) : index === 1 ? (
                  <AcademyImage
                    asset="lounge"
                    locale={locale}
                    className={styles.chapterImage}
                    sizes="(max-width: 700px) 100vw, 55vw"
                  />
                ) : (
                  <AcademyImage
                    asset="workshop"
                    locale={locale}
                    className={styles.chapterImage}
                    sizes="(max-width: 700px) 100vw, 60vw"
                  />
                )}
              </article>
            ))}
          </div>
        </section>

        <div className={styles.programmeFeature}>
          <PublishedProgrammeSpotlight locale={locale} />
        </div>

        <section
          className={`${styles.section} ${styles.testimonials}`}
          aria-labelledby="voices-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>{voices.eyebrow}</p>
              <h2 id="voices-title">{voices.title}</h2>
            </div>
            <p>{voices.intro}</p>
          </div>
          <div className={styles.quoteGrid}>
            {academyTestimonials.map((review) => (
              <figure className={styles.quoteCard} key={review.id}>
                <span aria-hidden="true" className={styles.quoteMark}>
                  “
                </span>
                <blockquote>
                  <p>{review.quote[locale]}</p>
                </blockquote>
                <figcaption>
                  <strong dir="auto">{review.name}</strong>
                  <span>{voices.excerptLabel}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className={styles.sourceNote}>{voices.sourceNote}</p>
        </section>

        <section
          className={`${styles.section} ${styles.moments}`}
          aria-labelledby="moments-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{copy.momentsLabel}</p>
              <h2 id="moments-title">{copy.momentsTitle}</h2>
            </div>
            <span className={styles.languageLine}>{copy.languages}</span>
          </div>
          <div className={styles.momentsGrid}>
            {(['atelier', 'online'] as const).map((asset, index) => (
              <Link
                className={styles.moment}
                key={asset}
                href={localizeHref(
                  locale,
                  index === 0 ? '/programmes' : '/contact',
                )}
              >
                <AcademyImage
                  asset={asset}
                  locale={locale}
                  className={styles.momentImage}
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <div>
                  <span>0{index + 1}</span>
                  <h3>{copy.moments[index]}</h3>
                  <p>
                    {copy.momentLinks[index]}
                    <b aria-hidden="true">↗</b>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className={styles.closing}
          aria-labelledby="closing-title"
        >
          <div className={styles.closingCopy}>
            <p className={styles.eyebrow}>{copy.closingLabel}</p>
            <h2 id="closing-title">{copy.closingTitle}</h2>
            <p>{copy.closingBody}</p>
            <StockImage
              asset="consultation"
              locale={locale}
              className={styles.closingImage}
              sizes="(max-width: 700px) 100vw, 40vw"
            />
            <Link
              className={styles.textLink}
              href={localizeHref(locale, '/consultations#consultation-enquiry')}
            >
              {copy.consultation}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className={styles.enquirySurface}>
            <EnquiryForm locale={locale} copy={publicCopy.form} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
