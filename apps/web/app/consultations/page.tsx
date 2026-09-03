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
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import styles from './page.module.css';

const CONSULTATION_COPY = {
  en: {
    title: 'Psychology consultations',
    description:
      'Start a psychology enquiry with Luminol Academy and let the team understand your goal before guiding you toward the most appropriate next step.',
    eyebrow: 'Psychology · consultations',
    heroTitle: 'A clearer first step when you need psychological support.',
    heroBody:
      'Tell us what you are looking for before moving to a call or WhatsApp. The team can understand your request, preferred format and timing, then guide you toward an appropriate psychology pathway.',
    aside:
      'Luminol Psychology may include therapy, consultation, educational guidance or coaching depending on the request. The first enquiry helps keep those pathways clear.',
    primaryAction: 'Start your enquiry',
    secondaryAction: 'Explore psychology',
    routingEyebrow: 'One request · the right pathway',
    routingTitle: 'Not every psychology enquiry needs the same next step.',
    routingBody:
      'The goal is to understand what you need before recommending a service or programme.',
    paths: [
      {
        number: '01',
        title: 'Therapy & consultations',
        body: 'For people seeking psychological support or a professional consultation pathway.',
      },
      {
        number: '02',
        title: 'Parents & families',
        body: 'For parenting, child-development, family communication and guidance requests.',
      },
      {
        number: '03',
        title: 'Learning & development',
        body: 'For psychology education, workshops, coaching or professional-learning enquiries.',
      },
    ],
    formEyebrow: 'Tell us what you need',
    formTitle: 'Start with a short, structured enquiry.',
    formBody:
      'Share only what is needed for the team to understand your request. A team member can then follow up with the most suitable next step.',
    safety:
      'This form is not emergency care. If there is an immediate risk of harm or an urgent psychiatric or medical situation, contact appropriate local emergency or qualified medical services.',
    initialMessage: 'I would like information about a psychology consultation.',
  },
  fr: {
    title: 'Consultations en psychologie',
    description:
      'Commencez une demande en psychologie auprès de Luminol Academy afin que l’équipe comprenne votre objectif avant de vous orienter vers la prochaine étape la plus adaptée.',
    eyebrow: 'Psychologie · consultations',
    heroTitle:
      'Une première étape plus claire lorsque vous cherchez un soutien psychologique.',
    heroBody:
      'Expliquez-nous d’abord ce que vous recherchez avant de passer à un appel ou à WhatsApp. L’équipe peut comprendre votre demande, le format souhaité et votre disponibilité, puis vous orienter vers un parcours adapté.',
    aside:
      'Luminol Psychologie peut inclure thérapie, consultation, accompagnement éducatif ou coaching selon la demande. Le premier échange aide à garder ces parcours clairement distincts.',
    primaryAction: 'Commencer la demande',
    secondaryAction: 'Découvrir la psychologie',
    routingEyebrow: 'Une demande · le bon parcours',
    routingTitle:
      'Toutes les demandes en psychologie n’appellent pas la même prochaine étape.',
    routingBody:
      'L’objectif est de comprendre votre besoin avant de recommander un service ou un programme.',
    paths: [
      {
        number: '01',
        title: 'Thérapie & consultations',
        body: 'Pour les personnes qui recherchent un soutien psychologique ou un parcours de consultation professionnelle.',
      },
      {
        number: '02',
        title: 'Parents & familles',
        body: 'Pour les demandes liées à la parentalité, au développement de l’enfant, à la communication familiale et à l’orientation.',
      },
      {
        number: '03',
        title: 'Apprentissage & développement',
        body: 'Pour la psychoéducation, les ateliers, le coaching ou la formation professionnelle.',
      },
    ],
    formEyebrow: 'Expliquez-nous votre besoin',
    formTitle: 'Commencez par une demande courte et structurée.',
    formBody:
      'Partagez uniquement les informations nécessaires pour comprendre votre demande. Un membre de l’équipe pourra ensuite vous proposer la prochaine étape la plus adaptée.',
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
    heroTitle: 'خطوة أولى أوضح عندما تحتاج إلى دعم نفسي.',
    heroBody:
      'أخبرنا بما تبحث عنه قبل الانتقال مباشرة إلى المكالمة أو واتساب. يساعد ذلك الفريق على فهم طلبك وطريقة المتابعة المناسبة وتوقيتك، ثم توجيهك نحو المسار النفسي الأنسب.',
    aside:
      'قد يشمل مسار لومينول في علم النفس العلاج النفسي أو الاستشارة أو الإرشاد التربوي أو الكوتشينغ بحسب طبيعة الطلب. الاستفسار الأول يساعدنا على الفصل بوضوح بين هذه المسارات.',
    primaryAction: 'ابدأ طلبك',
    secondaryAction: 'استكشف قسم علم النفس',
    routingEyebrow: 'طلب واحد · المسار المناسب',
    routingTitle: 'ليست كل طلبات علم النفس بحاجة إلى الخطوة نفسها.',
    routingBody:
      'هدفنا أولاً هو فهم حاجتك قبل اقتراح خدمة أو برنامج محدد.',
    paths: [
      {
        number: '01',
        title: 'العلاج النفسي والاستشارات',
        body: 'لمن يبحث عن دعم نفسي أو مسار استشارة مع مختص.',
      },
      {
        number: '02',
        title: 'الوالدان والعائلة',
        body: 'لطلبات التربية ونمو الطفل والتواصل الأسري والإرشاد.',
      },
      {
        number: '03',
        title: 'التعلم والتطوير',
        body: 'للتثقيف النفسي والورشات والكوتشينغ أو التكوين المهني.',
      },
    ],
    formEyebrow: 'أخبرنا بما تحتاجه',
    formTitle: 'ابدأ بطلب قصير ومنظم.',
    formBody:
      'شارك فقط المعلومات اللازمة لفهم طلبك. بعد ذلك يستطيع أحد أفراد الفريق التواصل معك واقتراح الخطوة التالية الأنسب.',
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
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="consultation-title"
        >
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow as string}</p>
            <h1 id="consultation-title">{copy.heroTitle as string}</h1>
            <p className={styles.lede}>{copy.heroBody as string}</p>
          </div>
          <aside className={styles.heroAside}>
            <p>{copy.aside as string}</p>
            <div className={styles.heroActions}>
              <ButtonLink href="#consultation-enquiry">
                {copy.primaryAction as string}
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/schools/psychology')}
                variant="secondary"
              >
                {copy.secondaryAction as string}
              </ButtonLink>
            </div>
          </aside>
        </section>

        <section
          className={styles.routing}
          aria-labelledby="routing-title"
        >
          <div className={styles.routingHeader}>
            <div>
              <p className={styles.eyebrow}>
                {copy.routingEyebrow as string}
              </p>
              <h2 id="routing-title">{copy.routingTitle as string}</h2>
            </div>
            <p>{copy.routingBody as string}</p>
          </div>
          <div className={styles.pathGrid}>
            {paths.map((path) => (
              <article className={styles.pathCard} key={path.number}>
                <span>{path.number}</span>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="consultation-enquiry"
          className={styles.enquiry}
          aria-labelledby="consultation-enquiry-title"
        >
          <div className={styles.enquiryContext}>
            <p className={styles.eyebrow}>{copy.formEyebrow as string}</p>
            <h2 id="consultation-enquiry-title">
              {copy.formTitle as string}
            </h2>
            <p>{copy.formBody as string}</p>
            <p className={styles.safetyNote}>{copy.safety as string}</p>
          </div>
          <div className={styles.formSurface}>
            <EnquiryForm
              locale={locale}
              copy={publicCopy.form}
              initialSchool="PSYCHOLOGY"
              initialMessage={copy.initialMessage as string}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
