import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';

import type { Metadata } from 'next';

import { EnquiryForm } from '../../components/enquiry-form';
import Image from 'next/image';

import { FirstConsultation } from '../../components/first-consultation';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import {
  founderExperience,
  founderPath,
  founderPortrait,
} from '../../lib/founder';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import styles from './page.module.css';
import { PhotoCard } from '../../components/live-photo';
import { consultationPhotos, peoplePhotos } from '../../lib/people-photos';

const CONSULTATION_COPY = {
  en: {
    title: 'Psychology consultations',
    description:
      'Start a psychology enquiry with Luminol Academy and let the team understand your goal before guiding you toward the most appropriate next step.',
    eyebrow: 'Psychology · consultations',
    heroTitle: 'Psychological consultations in Blida and online',
    heroBody:
      'Meet in Blida or online. The academy team will contact you to discuss your request and confirm an appointment once you agree on a time.',
    aside:
      'Luminol Psychology may include therapy, consultation, educational guidance or coaching depending on the request. The first enquiry helps keep those pathways clear.',
    primaryAction: 'Request a consultation',
    feesNote:
      'Accessible fees, explained personally. Message us on WhatsApp or call reception for every detail, with no commitment.',
    secondaryAction: 'Explore psychology',
    routingEyebrow: 'Ways we can help',
    routingTitle: 'Individual, couples and family consultations',
    routingBody:
      'Tell us what brings you here and we’ll help you choose the most suitable type of support.',
    paths: [
      {
        number: '01',
        title: 'Individual consultations',
        body: 'Confidential, personal sessions to understand yourself, work through difficulties and find psychological balance.',
      },
      {
        number: '02',
        title: 'Couples consultations',
        body: 'Specialised sessions to improve mutual understanding, resolve disagreements and build a healthy relationship.',
      },
      {
        number: '03',
        title: 'Family consultations',
        body: 'Practical support to strengthen communication, resolve conflict and build a close, stable family.',
      },
    ],
    authorityEyebrow: 'Founder-led psychology',
    authorityTitle: 'years of clinical experience',
    authorityName: 'Kheddaoui Fettouma',
    authorityRole: 'Founder · expert therapist',
    authorityBody:
      'Founder Kheddaoui Fettouma, an expert therapist, guides Luminol Psychology. Her field experience shapes how the team listens to each enquiry and chooses the right next step with you.',
    authorityAction: 'Learn more about the founder',
    formEyebrow: 'Tell us what you need',
    formTitle: 'Request a psychology consultation',
    formBody:
      'Leave your contact details and choose how you’d like us to reach you. The team will follow up about your request.',
    safety:
      'This form is not emergency care. If there is an immediate risk of harm or an urgent psychiatric or medical situation, contact appropriate local emergency or qualified medical services.',
    initialMessage: 'I would like information about a psychology consultation.',
  },
  fr: {
    title: 'Consultations en psychologie',
    description:
      'Commencez une demande en psychologie auprès de Luminol Academy afin que l’équipe comprenne votre objectif avant de vous orienter vers la prochaine étape la plus adaptée.',
    eyebrow: 'Psychologie · consultations',
    heroTitle: 'Consultations psychologiques à Blida et à distance',
    heroBody:
      'En cabinet à Blida ou à distance. L’équipe de l’académie vous contactera pour échanger sur votre demande et confirmer le rendez-vous après accord sur le créneau.',
    aside:
      'Luminol Psychologie peut inclure thérapie, consultation, accompagnement éducatif ou coaching selon la demande. Le premier échange aide à garder ces parcours clairement distincts.',
    primaryAction: 'Demander une consultation',
    feesNote:
      'Des tarifs accessibles, présentés de vive voix. Écrivez-nous sur WhatsApp ou appelez l’accueil pour tous les détails, sans engagement.',
    secondaryAction: 'Découvrir la psychologie',
    routingEyebrow: 'Les accompagnements proposés',
    routingTitle: 'Consultations individuelles, de couple et familiales',
    routingBody:
      'Expliquez-nous ce qui vous amène. Nous vous aiderons à choisir l’accompagnement le plus adapté.',
    paths: [
      {
        number: '01',
        title: 'Consultations individuelles',
        body: 'Des séances confidentielles et personnalisées pour mieux vous comprendre, traverser les difficultés et retrouver votre équilibre psychologique.',
      },
      {
        number: '02',
        title: 'Consultations de couple',
        body: 'Des séances spécialisées pour améliorer la compréhension mutuelle, résoudre les désaccords et construire une relation saine.',
      },
      {
        number: '03',
        title: 'Consultations familiales',
        body: 'Un soutien concret pour renforcer la communication, apaiser les conflits et bâtir une famille unie et stable.',
      },
    ],
    authorityEyebrow: 'Psychologie portée par la fondatrice',
    authorityTitle: 'ans d’expérience clinique',
    authorityName: 'Kheddaoui Fettouma',
    authorityRole: 'Fondatrice · thérapeute experte',
    authorityBody:
      'La fondatrice Kheddaoui Fettouma, thérapeute experte, guide Luminol Psychologie. Son expérience de terrain façonne la manière dont l’équipe écoute chaque demande et choisit avec vous la bonne prochaine étape.',
    authorityAction: 'Découvrir la fondatrice',
    formEyebrow: 'Expliquez-nous votre besoin',
    formTitle: 'Demander une consultation psychologique',
    formBody:
      'Laissez vos coordonnées et choisissez votre moyen de contact. L’équipe reviendra vers vous au sujet de votre demande.',
    safety:
      'Ce formulaire ne remplace pas les soins d’urgence. En cas de risque immédiat ou de situation psychiatrique ou médicale urgente, contactez les services d’urgence locaux ou des professionnels de santé qualifiés.',
    initialMessage:
      'Je souhaite obtenir des informations sur une consultation en psychologie.',
  },
  ar: {
    title: 'الاستشارات النفسية',
    description:
      'ابدأ طلبك في مجال علم النفس مع أكاديمية لومينول حتى يفهم الفريق هدفك أولاً ثم يوجّهك نحو الخطوة التالية الأنسب.',
    eyebrow: 'علم النفس · الاستشارات',
    heroTitle: 'الاستشارات النفسية في البليدة وعن بُعد',
    heroBody:
      'يمكنك طلب لقاء في البليدة أو عن بُعد. يتواصل معك فريق الأكاديمية لمناقشة طلبك وتأكيد الموعد بعد الاتفاق معك على التوقيت.',
    aside:
      'قد يشمل مسار لومينول في علم النفس العلاج النفسي أو الاستشارة أو الإرشاد التربوي أو الكوتشينغ بحسب طبيعة الطلب. الاستفسار الأول يساعدنا على الفصل بوضوح بين هذه المسارات.',
    primaryAction: 'اطلب استشارة نفسية',
    feesNote:
      'أسعار في متناول الجميع نشرحها لك شخصيًا. راسلنا عبر واتساب أو اتصل بالاستقبال لمعرفة كل التفاصيل دون أي التزام.',
    secondaryAction: 'استكشف قسم علم النفس',
    routingEyebrow: 'كيف يمكننا مساعدتك',
    routingTitle: 'استشارات فردية وزوجية وأسرية',
    routingBody:
      'أخبرنا بما يدفعك إلى طلب الاستشارة، وسنساعدك في اختيار نوع الدعم الأنسب لك.',
    paths: [
      {
        number: '01',
        title: 'الاستشارات الفردية',
        body: 'جلسات سرية ومخصصة لمساعدتك على فهم ذاتك وتجاوز التحديات والوصول إلى التوازن النفسي.',
      },
      {
        number: '02',
        title: 'الاستشارات الزوجية',
        body: 'جلسات متخصصة لتحسين التفاهم وحل الخلافات وبناء علاقة زوجية صحية.',
      },
      {
        number: '03',
        title: 'الاستشارات الأسرية',
        body: 'دعم وحلول عملية لتعزيز التواصل وحل النزاعات وبناء أسرة متماسكة ومستقرة.',
      },
    ],
    authorityEyebrow: 'قسم علم النفس بخبرة المؤسسة',
    authorityTitle: 'سنة من الخبرة السريرية',
    authorityName: 'خداوي فطومة',
    authorityRole: 'المؤسسة · معالجة خبيرة',
    authorityBody:
      'توجّه المؤسسة خداوي فطومة، المعالجة الخبيرة، قسم لومينول لعلم النفس. تصوغ خبرتها الميدانية طريقة إصغاء الفريق لكل طلب واختيار الخطوة التالية المناسبة معك.',
    authorityAction: 'تعرّف على المؤسسة',
    formEyebrow: 'أخبرنا بما تحتاجه',
    formTitle: 'اطلب استشارة نفسية',
    formBody:
      'اترك بيانات الاتصال واختر الوسيلة التي تفضّلها. سيتواصل معك الفريق لمتابعة طلبك.',
    safety:
      'هذا النموذج ليس خدمة طوارئ. إذا كان هناك خطر فوري أو حالة نفسية أو طبية طارئة، تواصل مع خدمات الطوارئ المحلية أو جهة طبية مؤهلة.',
    initialMessage: 'أرغب في معرفة معلومات حول استشارة نفسية.',
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = CONSULTATION_COPY[locale];
  const route = localizePathname(locale, '/consultations');
  const socialPreview = getSocialPreviewImage(locale);

  return {
    title: copy.title as string,
    description: copy.description as string,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/consultations'),
    },
    openGraph: {
      title: copy.title as string,
      description: copy.description as string,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title as string,
      description: copy.description as string,
      images: [socialPreview],
    },
  };
}

const routePhotos = [
  peoplePhotos.therapySession,
  consultationPhotos.family,
  consultationPhotos.learning,
] as const;

export default async function ConsultationsPage() {
  const locale = await getRequestLocale();
  const copy = CONSULTATION_COPY[locale];
  const publicCopy = getPublicCopy(locale);
  const paths = copy.paths as readonly {
    number: string;
    title: string;
    body: string;
  }[];

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className={styles.page}
        data-quiet-page
      >
        <section className={styles.hero} aria-labelledby="consultation-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.eyebrow as string}</p>
            <h1 id="consultation-title">{copy.heroTitle as string}</h1>
            <p className={styles.lede}>{copy.heroBody as string}</p>
            <div className={styles.heroActions}>
              <ButtonLink href="#consultation-enquiry">
                {copy.primaryAction}
              </ButtonLink>
            </div>
            <p className={styles.feesNote}>{copy.feesNote as string}</p>
          </div>
          <PhotoCard
            className={styles.heroStack}
            locale={locale}
            photo={consultationPhotos.firstMeeting}
            priority
            caption
          />
        </section>

        <section
          id="consultation-enquiry"
          className={styles.enquiry}
          aria-labelledby="consultation-enquiry-title"
        >
          <div className={styles.enquiryBackdrop} aria-hidden="true">
            <Image
              src={consultationPhotos.journal.src}
              alt=""
              fill
              sizes="(max-width: 720px) 100vw, 74rem"
            />
          </div>
          <div className={styles.formSurface}>
            <EnquiryForm
              locale={locale}
              copy={{
                ...publicCopy.form,
                eyebrow: copy.formEyebrow,
                title: copy.formTitle,
                intro: copy.formBody,
              }}
              headingId="consultation-enquiry-title"
              initialSchool="PSYCHOLOGY"
              initialMessage={copy.initialMessage as string}
            />
            <p className={styles.safetyNote}>{copy.safety as string}</p>
          </div>
        </section>

        <section className={styles.routing} aria-labelledby="routing-title">
          <div className={styles.routingHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.routingEyebrow as string}</p>
              <h2 id="routing-title">{copy.routingTitle as string}</h2>
            </div>
            <div>
              <p>{copy.routingBody as string}</p>
              <ButtonLink
                href={localizeHref(locale, '/schools/psychology')}
                variant="secondary"
              >
                {copy.secondaryAction}
              </ButtonLink>
            </div>
          </div>
          <div className={styles.pathGrid}>
            {paths.map((path, index) => (
              <article className={styles.pathCard} key={path.number}>
                <div className={styles.pathPhoto}>
                  <Image
                    src={routePhotos[index % routePhotos.length]!.src}
                    alt={routePhotos[index % routePhotos.length]!.alt[locale]}
                    fill
                    sizes="(max-width: 900px) 100vw, 30vw"
                  />
                </div>
                <div className={styles.pathBody}>
                  <h3>{path.title}</h3>
                  <p>{path.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.authority} ${styles.authorityV2}`}
          aria-labelledby="consultation-authority-title"
          data-consultation-founder-authority
          data-founder-theme
        >
          <div className={styles.authorityVisual} data-reveal>
            <figure
              className={styles.authorityPhotoLarge}
              data-media-source={founderPortrait.source}
              data-media-crop="center-top"
            >
              <Image
                src={founderPortrait.src}
                alt={copy.authorityName}
                fill
                sizes="(max-width: 900px) 90vw, 40vw"
              />
            </figure>
          </div>
          <div className={styles.authorityText} data-reveal>
            <p className={styles.eyebrow}>{copy.authorityEyebrow as string}</p>
            <h2 id="consultation-authority-title">
              <bdi>{founderExperience}</bdi> {copy.authorityTitle}
            </h2>
            <div className={styles.signature}>
              <div>
                <p className={styles.authorityName}>
                  {copy.authorityName as string}
                </p>
                <p className={styles.authorityRole}>
                  {copy.authorityRole as string}
                </p>
              </div>
            </div>
            <p className={styles.authorityBodyText}>
              {copy.authorityBody as string}
            </p>
            <ButtonLink
              href={localizeHref(locale, founderPath)}
              className={styles.founderAction}
              variant="secondary"
            >
              {copy.authorityAction}{' '}
              <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
            </ButtonLink>
          </div>
        </section>

        <FirstConsultation locale={locale} />
      </main>
      <SiteFooter />
    </>
  );
}
