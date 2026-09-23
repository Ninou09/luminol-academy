import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AcademyImage } from '../components/academy-image';
import { CinematicScroll } from '../components/cinematic-scroll';
import { OrganizationJsonLd } from '../components/organization-json-ld';
import { PublishedProgrammeSpotlight } from '../components/published-programme-spotlight';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { experienceCopy } from '../lib/experience-copy';
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
  const copy = experienceCopy[locale];
  const schools = Object.values(getSchools(locale));
  const chapterAssets = ['detail', 'conversation', 'workshop'] as const;

  return (
    <>
      <SiteHeader />
      <CinematicScroll />
      <OrganizationJsonLd description={publicCopy.site.description} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <AcademyImage
            asset="community"
            locale={locale}
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.welcome}</p>
            <h1 id="hero-title">
              {copy.title}
              <em>{copy.accent}</em>
            </h1>
            <p className={styles.heroLede}>{copy.intro}</p>
            <Link className={styles.whiteButton} href="#schools">
              {copy.explore}
              <span aria-hidden="true">↗</span>
            </Link>
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
          <div className={styles.spiritImages}>
            <AcademyImage
              asset="about"
              locale={locale}
              className={styles.spiritPortrait}
              sizes="(max-width: 700px) 65vw, 32vw"
            />
            <AcademyImage
              asset="study"
              locale={locale}
              className={styles.spiritDetail}
              sizes="(max-width: 700px) 50vw, 22vw"
            />
            <span className={styles.imageStamp} aria-hidden="true">
              L / A
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
            <div className={styles.founderStat}>
              <strong dir="ltr">
                30<span>+</span>
              </strong>
              <p>{copy.founder}</p>
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
              >
                <Link
                  href={localizeHref(locale, `/schools/${school.slug}`)}
                  aria-label={`${publicCopy.home.discoverSchool}: ${school.name}`}
                >
                  <div className={styles.schoolPhoto}>
                    <AcademyImage
                      asset={school.slug}
                      locale={locale}
                      sizes="(max-width: 700px) 100vw, 34vw"
                    />
                    <span className={styles.schoolNumber}>{school.number}</span>
                  </div>
                  <div className={styles.schoolContent}>
                    <h3>{school.name}</h3>
                    <p>{school.promise}</p>
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
              <article className={styles.chapter} key={chapter.word}>
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
                <AcademyImage
                  asset={chapterAssets[index] ?? 'detail'}
                  locale={locale}
                  className={styles.chapterImage}
                  sizes="(max-width: 700px) 100vw, 60vw"
                />
              </article>
            ))}
          </div>
        </section>

        <div className={styles.programmeFeature}>
          <PublishedProgrammeSpotlight locale={locale} />
        </div>

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
            {(['parenting', 'online'] as const).map((asset, index) => (
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

        <section className={styles.closing} aria-labelledby="closing-title">
          <span className={styles.closingMonogram} aria-hidden="true">
            L
          </span>
          <div>
            <p className={styles.eyebrow}>{copy.closingLabel}</p>
            <h2 id="closing-title">{copy.closingTitle}</h2>
            <p>{copy.closingBody}</p>
          </div>
          <Link
            className={styles.roundAction}
            href={localizeHref(locale, '/contact')}
          >
            <span>{copy.enquire}</span>
            <b aria-hidden="true">↗</b>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
