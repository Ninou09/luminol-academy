import { GoldAccent } from '../../components/gold-accent';
import { localizeHref } from '@luminol/localization';
import type { Metadata } from 'next';

import { buildPublicMetadata } from '../../lib/public-metadata';
import { publicSearch } from '../../lib/public-seo';
import Image from 'next/image';
import Link from 'next/link';

import { SchoolQuiz } from '../../components/school-quiz';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import {
  homeSchoolPhotos,
  illustrativePhotoCredit,
} from '../../lib/people-photos';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { schoolQuiz } from '../../lib/school-quiz';
import { getSchools } from '../../lib/schools';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPublicMetadata(
    locale,
    '/schools',
    publicSearch['/schools'][locale],
  );
}

export default async function SchoolsPage() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const schools = Object.values(getSchools(locale));
  const quiz = schoolQuiz[locale];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="schools-title">
          <GoldAccent name="rings" />
          <p className={styles.eyebrow}>{copy.home.schoolsEyebrow}</p>
          <h1 id="schools-title">{publicSearch['/schools'][locale].heading}</h1>
          <p className={styles.lede}>{copy.home.schoolsIntro}</p>
        </section>

        <div className={styles.cards}>
          {schools.map((school) => (
            <Link
              key={school.slug}
              href={localizeHref(locale, `/schools/${school.slug}`)}
              className={`${styles.card} ${styles[school.slug] ?? ''}`}
            >
              <span
                className={styles.cardPhoto}
                data-media-source={illustrativePhotoCredit.source}
                data-media-license={illustrativePhotoCredit.license}
                data-media-crop="center-center"
              >
                <Image
                  src={homeSchoolPhotos[school.slug].src}
                  alt={homeSchoolPhotos[school.slug].alt[locale]}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
              </span>
              <span className={`scene-caption ${styles.sourceCaption}`}>
                {illustrativePhotoCredit.label[locale]}
              </span>
              <span className={styles.cardBody}>
                <span className={styles.number}>{school.number}</span>
                <h2 id={`schools-card-${school.slug}`}>{school.name}</h2>
                <span className={styles.promise}>{school.promise}</span>
                <span className={styles.tags}>
                  {school.programs.slice(0, 3).map((program) => (
                    <span key={program.title}>{program.title}</span>
                  ))}
                </span>
                <b className={styles.go} aria-hidden="true">
                  →
                </b>
              </span>
            </Link>
          ))}
        </div>

        <section
          id="school-quiz"
          className={styles.quizSection}
          aria-labelledby="school-quiz-title"
        >
          <div className={styles.quizIntro}>
            <p className={styles.eyebrow}>{quiz.eyebrow}</p>
            <h2 id="school-quiz-title">{quiz.title}</h2>
            <p>{quiz.intro}</p>
          </div>
          <SchoolQuiz
            copy={quiz}
            contactHref={localizeHref(locale, '/contact')}
            schools={schools.map((school) => ({
              slug: school.slug,
              name: school.name,
              promise: school.promise,
              href: localizeHref(locale, `/schools/${school.slug}`),
            }))}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
