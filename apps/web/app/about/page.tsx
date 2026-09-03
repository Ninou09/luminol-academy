import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import styles from './page.module.css';

const founderMediaByLocale = {
  en: {
    name: 'Kheddaoui Fettouma',
    alt: 'Kheddaoui Fettouma, founder of Luminol Academy',
  },
  fr: {
    name: 'Kheddaoui Fettouma',
    alt: 'Kheddaoui Fettouma, fondatrice de Luminol Academy',
  },
  ar: {
    name: 'خداوي فطومة',
    alt: 'خداوي فطومة، مؤسسة أكاديمية لومينول',
  },
} as const;

const founderAuthorityByLocale = {
  en: {
    eyebrow: 'Founder-led authority',
    title: 'Experience behind the institution.',
    body: 'Luminol Academy is anchored by founder Kheddaoui Fettouma, an expert therapist with more than 30 years of field experience, and supported by a broader expert team across content and programme delivery.',
    facts: [
      {
        number: '30+',
        title: 'Years of field experience',
        description:
          'Long-term practical experience anchors the psychology division in real human work, not trend-led content alone.',
      },
      {
        number: '01',
        title: 'A recognizable founder voice',
        description:
          'The founder remains a visible trust anchor while Luminol develops institutional authority through its wider expert team.',
      },
    ],
    action: 'Start a psychology enquiry',
  },
  fr: {
    eyebrow: 'Une autorité portée par la fondatrice',
    title: 'Une expérience réelle derrière l’institution.',
    body: 'Luminol Academy s’appuie sur sa fondatrice Kheddaoui Fettouma, thérapeute experte avec plus de 30 ans d’expérience de terrain, ainsi que sur une équipe élargie d’experts pour les contenus et les programmes.',
    facts: [
      {
        number: '30+',
        title: 'Années d’expérience de terrain',
        description:
          'Une longue expérience pratique ancre le pôle psychologie dans le travail humain réel, au-delà des tendances de contenu.',
      },
      {
        number: '01',
        title: 'Une voix fondatrice identifiable',
        description:
          'La fondatrice reste un repère de confiance visible tandis que Luminol développe aussi l’autorité de son équipe d’experts.',
      },
    ],
    action: 'Commencer une demande en psychologie',
  },
  ar: {
    eyebrow: 'خبرة تقودها المؤسسة',
    title: 'خبرة ميدانية حقيقية وراء المؤسسة.',
    body: 'ترتكز أكاديمية لومينول على خبرة مؤسستها خداوي فطومة، وهي معالجة خبيرة تمتلك أكثر من 30 سنة من الخبرة الميدانية، إلى جانب فريق أوسع من الخبراء في المحتوى وتقديم البرامج.',
    facts: [
      {
        number: '+30',
        title: 'سنة من الخبرة الميدانية',
        description:
          'تمنح الخبرة العملية الطويلة قسم علم النفس أساساً مرتبطاً بالعمل الإنساني الحقيقي، وليس بالمحتوى الرائج فقط.',
      },
      {
        number: '01',
        title: 'صوت مؤسس واضح ومعروف',
        description:
          'تبقى المؤسسة ركناً أساسياً للثقة، مع بناء سلطة مؤسساتية أوسع من خلال بقية فريق الخبراء في لومينول.',
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
  const copy = getPublicCopy(locale).about;
  const route = localizePathname(locale, '/about');
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/about'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [socialPreview],
    },
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;
  const founderMedia = founderMediaByLocale[locale];
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
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="about-hero-title"
          data-about-hero
        >
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
            <h1 id="about-hero-title">{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
          </div>
          <div
            className={styles.heroVisual}
            data-founder-media
            data-media-source="user-approved-upload"
            data-media-approval="2026-08-13"
            data-media-crop="portrait-center-face"
            data-reveal
          >
            <span
              role="img"
              aria-label={founderMedia.alt}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  "url('/media/founder-kheddaoui-fettouma.webp')",
                backgroundSize: 'cover',
                backgroundPosition: '50% 35%',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
              }}
            />
            <div className={styles.rays} aria-hidden="true" />
            <span
              className={styles.core}
              data-motion-float
              aria-hidden="true"
              style={{ opacity: 0, pointerEvents: 'none' }}
            >
              L
            </span>
            <p
              style={{
                zIndex: 2,
                display: 'grid',
                gap: '0.2rem',
              }}
            >
              <strong
                style={{
                  color: 'var(--color-brand-surface)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                }}
              >
                {founderMedia.name}
              </strong>
              <span>{copy.visualCaption}</span>
            </p>
          </div>
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

        <section
          className={styles.section}
          aria-labelledby="founder-authority-title"
          data-founder-authority
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>{founderAuthority.eyebrow}</p>
              <h2 id="founder-authority-title">{founderAuthority.title}</h2>
            </div>
            <p>{founderAuthority.body}</p>
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

        <section className={styles.missionVision}>
          <article aria-labelledby="about-mission-title" data-reveal>
            <span>{copy.missionLabel}</span>
            <h2 id="about-mission-title">{copy.missionTitle}</h2>
            <p>{copy.missionBody}</p>
          </article>
          <article aria-labelledby="about-vision-title" data-reveal>
            <span>{copy.visionLabel}</span>
            <h2 id="about-vision-title">{copy.visionTitle}</h2>
            <p>{copy.visionBody}</p>
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
            <div className={styles.ecosystemCore} data-motion-float>
              Luminol
              <small>{copy.oneJourney}</small>
            </div>
            {schoolCards.map((school) => (
              <Link
                className={`${styles.schoolCard} ${school.tone}`}
                href={localizeHref(locale, `/schools/${school.slug}`)}
                key={school.slug}
                aria-labelledby={`about-school-${school.slug}-title`}
                data-ecosystem-school={school.slug}
              >
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
