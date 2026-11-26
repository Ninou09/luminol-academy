import {
  localizeHref,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';

import { buildPublicMetadata } from '../../lib/public-metadata';
import { publicSearch } from '../../lib/public-seo';
import Link from 'next/link';

import { AcademyImage } from '../../components/academy-image';
import { FounderJsonLd } from '../../components/founder-json-ld';
import { TeamSection } from '../../components/events-section';
import {
  founderEditorialPortrait,
  founderPath,
  founderCopy,
} from '../../lib/founder';
import { PhotoMosaic } from '../../components/photo-mosaic';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';
import Image from 'next/image';
import {
  aboutPhotos,
  editorialPhotos,
  extraPhotos,
  peoplePhotos,
} from '../../lib/people-photos';

const founderNameByLocale = {
  en: 'Kheddaoui Fettouma',
  fr: 'Kheddaoui Fettouma',
  ar: 'خداوي فطومة',
} as const;

const founderAuthorityByLocale = {
  en: {
    eyebrow: 'Founder-led authority',
    title: 'Experience behind the institution.',
    body: 'Luminol Academy is anchored by founder Kheddaoui Fettouma, an expert therapist with more than 31 years of field experience, and supported by a broader expert team across content and programme delivery.',
    facts: [
      {
        number: '31+',
        title: 'Years of field experience',
        description:
          'Long-term practical experience anchors the psychology division in real human work, not trend-led content alone.',
      },
      {
        number: '01',
        title: 'A recognizable founder voice',
        description:
          'You always know who stands behind the psychology division — and the wider expert team carries the same standards into every programme.',
      },
    ],
    action: 'Start a psychology enquiry',
  },
  fr: {
    eyebrow: 'Une autorité portée par la fondatrice',
    title: 'Une expérience réelle derrière l’institution.',
    body: 'Luminol Academy s’appuie sur sa fondatrice Kheddaoui Fettouma, thérapeute experte avec plus de 31 ans d’expérience de terrain, ainsi que sur une équipe élargie d’experts pour les contenus et les programmes.',
    facts: [
      {
        number: '31+',
        title: 'Années d’expérience de terrain',
        description:
          'Une longue expérience pratique ancre le pôle psychologie dans le travail humain réel, au-delà des tendances de contenu.',
      },
      {
        number: '01',
        title: 'Une voix fondatrice identifiable',
        description:
          'Vous savez toujours qui se tient derrière le pôle psychologie — et l’équipe d’experts porte les mêmes exigences dans chaque programme.',
      },
    ],
    action: 'Commencer une demande en psychologie',
  },
  ar: {
    eyebrow: 'خبرة تقودها المؤسسة',
    title: 'خبرة ميدانية حقيقية وراء المؤسسة.',
    body: 'ترتكز أكاديمية لومينول على خبرة مؤسستها خداوي فطومة، وهي معالجة خبيرة تمتلك أكثر من 31 سنة من الخبرة الميدانية، إلى جانب فريق أوسع من الخبراء في المحتوى وتقديم البرامج.',
    facts: [
      {
        number: '+31',
        title: 'سنة من الخبرة الميدانية',
        description:
          'تمنح الخبرة العملية الطويلة قسم علم النفس أساساً مرتبطاً بالعمل الإنساني الحقيقي، وليس بالمحتوى الرائج فقط.',
      },
      {
        number: '01',
        title: 'صوت مؤسس واضح ومعروف',
        description:
          'تعرف دائمًا من يقف وراء قسم علم النفس، ويحمل فريق الخبراء المعايير نفسها إلى كل برنامج.',
      },
    ],
    action: 'ابدأ طلباً في علم النفس',
  },
} as const satisfies Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    facts: readonly {
      number: string;
      title: string;
      description: string;
    }[];
    action: string;
  }
>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPublicMetadata(locale, '/about', publicSearch['/about'][locale]);
}

const galleryChapters = {
  en: [
    'Listening in practice',
    'After class',
    'In the classroom',
    'Family support',
    'Learning online',
    'Role-play practice',
    'Independent study',
    'Recognising progress',
  ],
  fr: [
    'L’écoute en pratique',
    'Après le cours',
    'En salle de cours',
    'Soutien familial',
    'Apprendre en ligne',
    'Mise en situation',
    'Étude en autonomie',
    'Reconnaître les progrès',
  ],
  ar: [
    'الإصغاء في الممارسة',
    'بعد الدرس',
    'داخل قاعة التدريب',
    'دعم الأسرة',
    'التعلّم عن بُعد',
    'تمرين تمثيل الأدوار',
    'الدراسة الفردية',
    'تقدير التقدّم',
  ],
} as const;

const galleryLabel = {
  en: 'Moments at Luminol',
  fr: 'Moments chez Luminol',
  ar: 'لحظات في لومينول',
} as const satisfies Record<Locale, string>;

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;
  const founderName = founderNameByLocale[locale];
  const founderAuthority = founderAuthorityByLocale[locale];
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
      <FounderJsonLd
        name={founderName}
        description={founderAuthority.body}
        href={localizePathname(locale, '/about')}
      />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="about-hero-title"
          data-about-hero
        >
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
            <h1 id="about-hero-title">
              {publicSearch['/about'][locale].heading}
            </h1>
            <p>{copy.heroBody}</p>
          </div>
          <AcademyImage
            className={styles.heroVisual}
            school="psychology"
            locale={locale}
            priority
            sizes="(max-width: 1000px) 100vw, 48vw"
            scene={peoplePhotos.liveCommunity}
            sceneKind="photo"
          />
        </section>

        <section
          className={`${styles.section} ${styles.origin}`}
          aria-labelledby="about-origin-title"
        >
          <div data-reveal>
            <p className={styles.eyebrow}>{copy.originEyebrow}</p>
            <h2 id="about-origin-title">{copy.originTitle}</h2>
          </div>
          <div className={styles.originCopy} data-reveal>
            <p className={styles.originLede}>{copy.originLede}</p>
            <p>{copy.originBodyOne}</p>
            <p>{copy.originBodyTwo}</p>
          </div>
        </section>

        <PhotoMosaic
          label={galleryLabel[locale]}
          chapters={galleryChapters[locale]}
          locale={locale}
          preserveFrame={aboutPhotos.graduate.src}
          photos={[
            editorialPhotos.seminar,
            editorialPhotos.afterClass,
            aboutPhotos.event,
            aboutPhotos.family,
            aboutPhotos.online,
            peoplePhotos.academyRoleplay,
            aboutPhotos.listening,
            aboutPhotos.graduate,
          ]}
        />

        <section
          className={styles.section}
          aria-labelledby="founder-authority-title"
          data-founder-authority
        >
          <div className={styles.founderFeature} data-founder-theme>
            <div className={styles.founderFeatureCopy} data-reveal>
              <p className={styles.eyebrow}>{founderAuthority.eyebrow}</p>
              <h2 id="founder-authority-title">{founderCopy[locale].name}</h2>
              <p>{founderAuthority.body}</p>
              <ButtonLink
                href={localizeHref(locale, founderPath)}
                variant="secondary"
              >
                {
                  {
                    en: 'Meet the founder',
                    fr: 'Découvrir la fondatrice',
                    ar: 'تعرّف على المؤسسة',
                  }[locale]
                }
                <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
              </ButtonLink>
            </div>
            <div
              className={styles.founderFeaturePhoto}
              data-media-source={founderEditorialPortrait.source}
            >
              <Image
                src={founderEditorialPortrait.src}
                alt={founderCopy[locale].name}
                fill
                sizes="(max-width: 720px) 90vw, 43vw"
              />
            </div>
          </div>
          <div className={styles.valueGrid}>
            {founderAuthority.facts.map((fact) => (
              <article
                className={styles.valueCard}
                key={`${fact.number}-${fact.title}`}
                data-reveal
              >
                <span>{fact.number}</span>
                <h3>{fact.title}</h3>
                <p>{fact.description}</p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }} data-reveal>
            <ButtonLink href={localizeHref(locale, '/consultations')} size="lg">
              {founderAuthority.action} <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </section>

        <TeamSection locale={locale} />

        <section className={styles.missionVision}>
          <article aria-labelledby="about-mission-title" data-reveal>
            <div className={styles.missionFrame}>
              <Image
                className={styles.missionPhoto}
                src={aboutPhotos.audience.src}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                aria-hidden="true"
              />
            </div>
            <div className={styles.missionCopy}>
              <span>{copy.missionLabel}</span>
              <h2 id="about-mission-title">{copy.missionTitle}</h2>
              <p>{copy.missionBody}</p>
            </div>
          </article>
          <article aria-labelledby="about-vision-title" data-reveal>
            <div className={styles.missionFrame}>
              <Image
                className={styles.missionPhoto}
                src={extraPhotos.aboutCommunity.src}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                aria-hidden="true"
              />
            </div>
            <div className={styles.missionCopy}>
              <span>{copy.visionLabel}</span>
              <h2 id="about-vision-title">{copy.visionTitle}</h2>
              <p>{copy.visionBody}</p>
            </div>
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
            {copy.values.map((value) => {
              const valueTitleId = `about-value-${value.number}-title`;

              return (
                <article
                  className={styles.valueCard}
                  key={value.number}
                  aria-labelledby={valueTitleId}
                  data-value-card
                  data-reveal
                >
                  <span>{value.number}</span>
                  <h3 id={valueTitleId}>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              );
            })}
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
            <div className={styles.orbitSystem} aria-hidden="true">
              <span className={styles.orbitRing} />
              <span className={styles.orbitRing} />
              <span className={styles.orbitRing} />
              <span className={styles.orbitSpark} />
              <span className={styles.orbitSpark} />
              <span className={styles.orbitSpark} />
            </div>
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
                <span className={styles.schoolBeam} aria-hidden="true" />
                <Image
                  className={styles.schoolCardArt}
                  src={`/media/brand/about-${school.slug}.webp`}
                  alt=""
                  width={1122}
                  height={1402}
                  sizes="(max-width: 1000px) 60vw, 22vw"
                  aria-hidden="true"
                />
                <span>{school.number}</span>
                <h3 id={`about-school-${school.slug}-title`}>{school.name}</h3>
                <p>{school.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section
          className={styles.cta}
          aria-labelledby="about-cta-title"
          data-reveal
        >
          <div className={styles.ctaText}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.ctaEyebrow}
            </p>
            <h2 id="about-cta-title">{copy.ctaTitle}</h2>
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
