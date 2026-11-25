import type { Locale } from '@luminol/localization';

import Image from 'next/image';

import { consultationPhotos } from '../lib/people-photos';
import styles from './first-consultation.module.css';

/**
 * How a first consultation happens, as recorded in the academy CRM:
 * the specialist, price and time are confirmed by staff after the request.
 */
const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    steps: readonly { title: string; body: string }[];
  }
> = {
  en: {
    eyebrow: 'Your first consultation',
    title: 'Three calm steps, no surprises.',
    steps: [
      {
        title: 'You send a request',
        body: 'Use the form, WhatsApp or a call to reception. Share only what is needed to understand your request.',
      },
      {
        title: 'The team confirms the details',
        body: 'A team member contacts you to agree on the specialist, the price and the time before anything is booked.',
      },
      {
        title: 'Your session takes place',
        body: 'Online or at the academy in Blida, as agreed with you. Your appointment is confirmed only after that follow-up.',
      },
    ],
  },
  fr: {
    eyebrow: 'Votre première consultation',
    title: 'Trois étapes sereines, sans surprise.',
    steps: [
      {
        title: 'Vous envoyez une demande',
        body: 'Via le formulaire, WhatsApp ou un appel à l’accueil. Partagez seulement ce qui est nécessaire.',
      },
      {
        title: 'L’équipe confirme les détails',
        body: 'Une personne de l’équipe vous contacte pour convenir du spécialiste, du tarif et de l’horaire avant toute réservation.',
      },
      {
        title: 'Votre séance a lieu',
        body: 'En ligne ou à l’académie à Blida, selon ce qui est convenu. Le rendez-vous n’est confirmé qu’après ce suivi.',
      },
    ],
  },
  ar: {
    eyebrow: 'استشارتك الأولى',
    title: 'ثلاث خطوات هادئة، دون مفاجآت.',
    steps: [
      {
        title: 'ترسل طلبك',
        body: 'عبر الاستمارة أو واتساب أو مكالمة إلى الاستقبال. شارك فقط ما يلزم لفهم طلبك.',
      },
      {
        title: 'يؤكد الفريق التفاصيل',
        body: 'يتواصل معك أحد أعضاء الفريق للاتفاق على المختص والسعر والموعد قبل أي حجز.',
      },
      {
        title: 'تتم جلستك',
        body: 'عبر الإنترنت أو في الأكاديمية بالبليدة حسب ما يُتفق عليه. لا يُؤكَّد الموعد إلا بعد هذا التواصل.',
      },
    ],
  },
};

export function FirstConsultation({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section
      className={styles.section}
      aria-labelledby="first-consultation-title"
    >
      <p className={styles.eyebrow}>{text.eyebrow}</p>
      <h2 id="first-consultation-title" data-no-split>
        {text.title}
      </h2>
      <ol className={styles.steps}>
        {text.steps.map((step, index) => (
          <li key={step.title}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <figure className={styles.photo}>
        <Image
          src={consultationPhotos.welcome.src}
          alt={consultationPhotos.welcome.alt[locale]}
          fill
          sizes="(max-width: 900px) 100vw, 82rem"
        />
      </figure>
    </section>
  );
}
