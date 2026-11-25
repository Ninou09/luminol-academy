import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { founderExperience, founderPath } from '../../lib/founder';
import { actPhotos, illustrativePhotoCredit } from '../../lib/people-photos';
import {
  clinicalPathways,
  familyPathways,
  founderProgrammeSource,
} from '../../lib/psychology-library';
import { getRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';

const copy = {
  en: {
    title: 'Psychology Library',
    intro:
      'Explore clinical approaches and family support through reading, visual tools and the teaching topics of clinical psychologist Kheddaoui Fettouma.',
    founder: 'Years of clinical experience',
    profile: 'About the founder',
    catalogue: 'Browse Academy programmes',
    tools: 'Reading and visual tools',
    maps: 'Visual maps and worksheets',
    mapsBody: 'Explore the original interactive resource collection in Arabic.',
    journal: 'Luminol Journal',
    journalBody: 'Read short articles on psychology in daily life.',
    consultation: 'Psychology consultations',
    consultationBody: 'Find individual, couples and family support.',
    clinical: 'Clinical approaches and practice',
    family: 'Learning and parenting',
    source: 'Based on Kheddaoui Fettouma’s published course outlines.',
    outline: 'Read the original syllabus (Arabic)',
    act: 'View the Academy’s ACT programme',
    personal: 'See all programmes on her site',
  },
  fr: {
    title: 'Bibliothèque de psychologie',
    intro:
      'Explorez les approches cliniques et l’accompagnement des familles à travers des lectures, des outils visuels et les thèmes enseignés par la psychologue clinicienne Kheddaoui Fettouma.',
    founder: 'Ans d’expérience clinique',
    profile: 'Découvrir la fondatrice',
    catalogue: 'Voir les programmes de l’académie',
    tools: 'Lectures et outils visuels',
    maps: 'Cartes et fiches pratiques',
    mapsBody:
      'Retrouvez la collection interactive d’origine, disponible en arabe.',
    journal: 'Journal Luminol',
    journalBody: 'Lisez des articles courts sur la psychologie au quotidien.',
    consultation: 'Consultations psychologiques',
    consultationBody:
      'Découvrez l’accompagnement individuel, conjugal et familial.',
    clinical: 'Approches et pratique cliniques',
    family: 'Apprentissage et parentalité',
    source: 'D’après les plans de formation publiés par Kheddaoui Fettouma.',
    outline: 'Lire le programme d’origine (arabe)',
    act: 'Voir la formation ACT de l’académie',
    personal: 'Voir toutes les formations sur son site',
  },
  ar: {
    title: 'المكتبة النفسية',
    intro:
      'استكشف المقاربات السريرية ودعم الأسرة من خلال قراءات وأدوات بصرية وموضوعات التكوين التي تقدّمها الأخصائية النفسية خداوي فطومة.',
    founder: 'سنة من الخبرة السريرية',
    profile: 'تعرّف على المؤسسة',
    catalogue: 'استعرض برامج الأكاديمية',
    tools: 'قراءات وأدوات بصرية',
    maps: 'خرائط وأوراق عمل',
    mapsBody: 'استكشف مجموعة الموارد التفاعلية الأصلية باللغة العربية.',
    journal: 'مجلة لومينول',
    journalBody: 'اقرأ مقالات قصيرة عن علم النفس في الحياة اليومية.',
    consultation: 'الاستشارات النفسية',
    consultationBody: 'تعرّف على الدعم الفردي والزوجي والأسري.',
    clinical: 'المقاربات والممارسة السريرية',
    family: 'التعلّم والتنشئة',
    source: 'استنادًا إلى محاور التكوين المنشورة على موقع خداوي فطومة.',
    outline: 'اقرأ محاور الدورة الأصلية',
    act: 'اطّلع على برنامج ACT في الأكاديمية',
    personal: 'استعرض جميع الدورات على موقعها',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: copy[locale].title,
    description: copy[locale].intro,
    alternates: {
      canonical: localizePathname(locale, '/psy-library'),
      languages: buildLanguageAlternates('/psy-library'),
    },
  };
}

export default async function PsychologyLibrary() {
  const locale = await getRequestLocale();
  const text = copy[locale];
  const direction = locale === 'ar' ? '←' : '→';
  const resources = [
    { title: text.maps, body: text.mapsBody, href: '/psy-library.html' },
    {
      title: text.journal,
      body: text.journalBody,
      href: localizeHref(locale, '/journal'),
    },
    {
      title: text.consultation,
      body: text.consultationBody,
      href: localizeHref(locale, '/consultations'),
    },
  ];
  const groups = [
    {
      id: 'clinical-pathways',
      title: text.clinical,
      pathways: clinicalPathways,
    },
    { id: 'family-pathways', title: text.family, pathways: familyPathways },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="library-title">
          <div>
            <h1 id="library-title">{text.title}</h1>
            <p>{text.intro}</p>
            <p className={styles.experience}>
              <strong>
                <bdi>{founderExperience}</bdi>
              </strong>{' '}
              {text.founder}
            </p>
            <div className={styles.links}>
              <a href={localizeHref(locale, '/programmes?school=psychology')}>
                {text.catalogue} <span aria-hidden="true">{direction}</span>
              </a>
              <a href={localizeHref(locale, founderPath)}>{text.profile}</a>
            </div>
          </div>
          <figure
            className={styles.photo}
            data-media-source={illustrativePhotoCredit.source}
            data-media-license={illustrativePhotoCredit.license}
          >
            <Image
              src={actPhotos.values.src}
              alt={actPhotos.values.alt[locale]}
              width={actPhotos.values.width}
              height={actPhotos.values.height}
              sizes="(max-width: 740px) 92vw, 42vw"
              preload
            />
          </figure>
        </section>

        <section
          className={styles.section}
          aria-labelledby="library-tools-title"
        >
          <h2 id="library-tools-title">{text.tools}</h2>
          <div className={styles.resources}>
            {resources.map((item) => (
              <a className={styles.resource} key={item.href} href={item.href}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span aria-hidden="true">{direction}</span>
              </a>
            ))}
          </div>
        </section>

        {groups.map(({ id, title, pathways }) => (
          <section key={id} className={styles.section} aria-labelledby={id}>
            <h2 id={id}>{title}</h2>
            <ul className={styles.pathways}>
              {pathways.map((entry) => {
                const isAct = entry.slug === 'act-therapy-techniques-course';
                const href = isAct
                  ? localizeHref(
                      locale,
                      '/programmes/acceptance-commitment-therapy-act',
                    )
                  : `https://luminolacademy.nl/${entry.slug}`;
                return (
                  <li className={styles.pathway} key={entry.slug}>
                    <h3>{entry.title[locale]}</h3>
                    <p>{entry.summary[locale]}</p>
                    <a
                      href={href}
                      aria-label={`${isAct ? text.act : text.outline} — ${entry.title[locale]}`}
                    >
                      {isAct ? text.act : text.outline}{' '}
                      <span aria-hidden="true">{isAct ? direction : '↗'}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className={styles.credit}>
          {text.source}{' '}
          <a href={founderProgrammeSource}>
            {text.personal} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
