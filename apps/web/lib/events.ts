import type { Locale } from '@luminol/localization';

type Text = Record<Locale, string>;

export type LuminolEvent = {
  id: string;
  /** ISO date (Algeria time); null while the date is still pending. */
  date: string | null;
  secondDate?: string;
  endsAt?: string;
  time?: string;
  free: boolean;
  kind: 'awareness' | 'professional' | 'programme';
  title: Text;
  audience: Text;
  presenters: readonly ('fettouma' | 'dalila' | 'saliha' | 'linda')[];
  registerHref?: string;
  /** Internal page with more details. */
  pageHref?: string;
  recording?: boolean;
  status?: 'waitlist' | 'dateTbc' | 'inProgress';
  /** Optional cover photo in /media/people. */
  cover?: string;
};

export const familyAfterTrauma: LuminolEvent = {
  id: 'family-after-trauma-2026-09-25',
  date: '2026-09-25',
  endsAt: '2026-09-25T22:00:00+01:00',
  free: true,
  kind: 'awareness',
  title: {
    ar: 'الأسرة بعد الصدمة النفسية',
    en: 'The family after psychological trauma',
    fr: 'La famille après un traumatisme psychologique',
  },
  audience: {
    ar: 'الأسر',
    en: 'Families',
    fr: 'Familles',
  },
  presenters: ['fettouma'],
  pageHref: '/workshops/family-after-trauma',
};

const algeriaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Algiers',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function hasEventEnded(event: LuminolEvent, now = new Date()) {
  if (event.endsAt) return now.getTime() >= Date.parse(event.endsAt);
  const lastDay = event.secondDate ?? event.date;
  return lastDay !== null && lastDay < algeriaDay.format(now);
}

/**
 * Luminol events confirmed in the academy CRM export of 15 November 2026.
 * Proposals that are not scheduled yet are deliberately left out.
 */
export const luminolEvents: readonly LuminolEvent[] = [
  {
    id: 'adhd-family-2026-11-20',
    date: '2026-11-20',
    free: true,
    kind: 'awareness',
    title: {
      ar: 'فرط الحركة وتشتت الانتباه: كيف تفهم الأسرة وتساند؟',
      en: 'ADHD: how can the family understand and support?',
      fr: 'TDAH : comment la famille peut-elle comprendre et soutenir ?',
    },
    audience: {
      ar: 'الأولياء والمربون',
      en: 'Parents and educators',
      fr: 'Parents et éducateurs',
    },
    presenters: ['fettouma'],
    registerHref: 'https://chat.whatsapp.com/D6PadKZe73qDXCr3ZRPzHE',
    cover: '/media/people/adhd-event.webp',
  },
  {
    id: 'clinical-interview-2026-11',
    date: '2026-11-14',
    secondDate: '2026-11-21',
    free: false,
    kind: 'professional',
    status: 'inProgress',
    title: {
      ar: 'من الاستقبال إلى تلخيص المقابلة العيادية',
      en: 'From reception to summarising the clinical interview',
      fr: 'De l’accueil à la synthèse de l’entretien clinique',
    },
    audience: {
      ar: 'أخصائيون وطلبة السنوات النهائية',
      en: 'Practitioners and final-year students',
      fr: 'Praticiens et étudiants en fin de cursus',
    },
    presenters: ['fettouma'],
  },
  {
    id: 'self-hypnosis',
    date: null,
    free: false,
    kind: 'programme',
    status: 'dateTbc',
    title: {
      ar: 'التنويم الإيحائي الذاتي – شفرة التحكم الذاتي',
      en: 'Self-hypnosis — the self-control code',
      fr: 'Auto-hypnose — le code de la maîtrise de soi',
    },
    audience: {
      ar: 'برنامج تدريبي',
      en: 'Training programme',
      fr: 'Programme de formation',
    },
    presenters: ['linda'],
  },
  {
    id: 'short-term-therapies',
    date: null,
    free: false,
    kind: 'programme',
    status: 'waitlist',
    title: {
      ar: 'تكوين العلاجات قصيرة المدى',
      en: 'Training in short-term therapies',
      fr: 'Formation aux thérapies brèves',
    },
    audience: {
      ar: 'تكوين مهني',
      en: 'Professional training',
      fr: 'Formation professionnelle',
    },
    presenters: ['fettouma'],
    registerHref: 'https://tally.so/r/Ek9gVA',
  },
  {
    id: 'clinical-interview-mistakes-2026-11-06',
    date: '2026-11-06',
    free: true,
    kind: 'professional',
    title: {
      ar: 'المقابلة العيادية الأولى: أخطاء شائعة لدى المبتدئين',
      en: 'The first clinical interview: common beginner mistakes',
      fr: 'Le premier entretien clinique : erreurs fréquentes des débutants',
    },
    audience: {
      ar: 'أخصائيون وطلبة علم النفس',
      en: 'Psychology practitioners and students',
      fr: 'Praticiens et étudiants en psychologie',
    },
    presenters: ['fettouma'],
  },
  {
    id: 'breast-cancer-2026-10-30',
    date: '2026-10-30',
    free: true,
    kind: 'awareness',
    recording: true,
    title: {
      ar: 'سرطان الثدي: كيف تساند الأسرة المريضة؟',
      en: 'Breast cancer: how can the family support the patient?',
      fr: 'Cancer du sein : comment la famille peut-elle soutenir la patiente ?',
    },
    audience: {
      ar: 'الأسر ومقدمو الرعاية',
      en: 'Families and caregivers',
      fr: 'Familles et aidants',
    },
    presenters: ['fettouma'],
  },
  {
    id: 'autism-family-2026-10-23',
    date: '2026-10-23',
    free: true,
    kind: 'awareness',
    recording: true,
    title: {
      ar: 'مساندة الأسرة لطفل طيف التوحد',
      en: 'Supporting the family of a child on the autism spectrum',
      fr: 'Soutenir la famille d’un enfant autiste',
    },
    audience: {
      ar: 'الأسر',
      en: 'Families',
      fr: 'Familles',
    },
    presenters: ['fettouma', 'dalila'],
  },
  {
    id: 'addiction-family-2026-10-09',
    date: '2026-10-09',
    free: true,
    kind: 'awareness',
    title: {
      ar: 'مدمن في الأسرة: كيف نفهم ونساند؟',
      en: 'Addiction in the family: how do we understand and support?',
      fr: 'L’addiction dans la famille : comprendre et soutenir',
    },
    audience: {
      ar: 'الأسر',
      en: 'Families',
      fr: 'Familles',
    },
    presenters: ['fettouma', 'saliha'],
  },
  familyAfterTrauma,
];

export type TeamMember = {
  id: 'fettouma' | 'dalila' | 'saliha' | 'linda';
  initials: string;
  name: Text;
  role: Text;
  note: Text;
};

/** The psychology team as recorded in the CRM (titles as approved). */
export const psychologyTeam: readonly TeamMember[] = [
  {
    id: 'fettouma',
    initials: 'KF',
    name: {
      en: 'Kheddaoui Fettouma',
      fr: 'Kheddaoui Fettouma',
      ar: 'فطومة خداوي',
    },
    role: {
      en: 'Founder · Therapist',
      fr: 'Fondatrice · Thérapeute',
      ar: 'المؤسسة · المعالجة',
    },
    note: {
      en: 'Leads Luminol Psychology, its consultations and most of its sessions.',
      fr: 'Dirige Luminol Psychologie, ses consultations et la plupart de ses séances.',
      ar: 'تقود قسم لومينول لعلم النفس واستشاراته ومعظم لقاءاته.',
    },
  },
  {
    id: 'dalila',
    initials: 'DT',
    name: { en: 'Dalila Toubal', fr: 'Dalila Toubal', ar: 'دليلة طوبال' },
    role: {
      en: 'Speech and language therapist · Guest presenter',
      fr: 'Orthophoniste · Intervenante invitée',
      ar: 'أخصائية أرطفونية · محاضِرة ضيفة',
    },
    note: {
      en: 'Co-presented the session on supporting families of autistic children.',
      fr: 'A co-animé la séance sur le soutien aux familles d’enfants autistes.',
      ar: 'شاركت في تقديم لقاء مساندة أسر أطفال طيف التوحد.',
    },
  },
  {
    id: 'saliha',
    initials: 'SH',
    name: {
      en: 'Dr Saliha Haj Mohamed',
      fr: 'Dr Saliha Haj Mohamed',
      ar: 'الدكتورة صليحة حاج محمد',
    },
    role: {
      en: 'Doctor · Guest presenter',
      fr: 'Docteure · Intervenante invitée',
      ar: 'دكتورة · محاضِرة ضيفة',
    },
    note: {
      en: 'Co-presented the session on addiction in the family.',
      fr: 'A co-animé la séance sur l’addiction dans la famille.',
      ar: 'شاركت في تقديم لقاء الإدمان في الأسرة.',
    },
  },
  {
    id: 'linda',
    initials: 'LG',
    name: { en: 'Linda Guesmi', fr: 'Linda Guesmi', ar: 'ليندا قاسمي' },
    role: {
      en: 'Trainer · Self-hypnosis programme',
      fr: 'Formatrice · Programme d’auto-hypnose',
      ar: 'مدرّبة · برنامج التنويم الإيحائي الذاتي',
    },
    note: {
      en: 'Leads the upcoming self-hypnosis programme.',
      fr: 'Anime le prochain programme d’auto-hypnose.',
      ar: 'تقدّم برنامج التنويم الإيحائي الذاتي القادم.',
    },
  },
];

export const eventsCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    upcoming: string;
    past: string;
    free: string;
    paid: string;
    online: string;
    register: string;
    details: string;
    askRecording: string;
    recording: string;
    dateTbc: string;
    waitlist: string;
    joinWaitlist: string;
    inProgress: string;
    session2: string;
    notify: string;
    calendar: string;
    with: string;
    teamEyebrow: string;
    teamTitle: string;
    teamIntro: string;
  }
> = {
  en: {
    eyebrow: 'Events & sessions',
    title: 'Learn with Luminol, live.',
    intro:
      'Free awareness sessions for families and professional sessions for practitioners, mostly online via Zoom.',
    upcoming: 'Coming up',
    past: 'Recent sessions',
    free: 'Free',
    paid: 'Paid',
    online: 'Online · Zoom',
    register: 'Join the WhatsApp group',
    details: 'See details',
    askRecording: 'Ask for the recording',
    recording: 'Recording available',
    dateTbc: 'Date to be announced',
    waitlist: 'Waitlist open',
    joinWaitlist: 'Join the waitlist',
    inProgress: 'In progress',
    session2: 'Session 2',
    notify: 'Get notified',
    calendar: 'Add to calendar',
    with: 'With',
    teamEyebrow: 'The people',
    teamTitle: 'Who guides Luminol Psychology.',
    teamIntro:
      'The founder leads the psychology division, joined by specialists who present sessions and programmes.',
  },
  fr: {
    eyebrow: 'Événements & séances',
    title: 'Apprendre avec Luminol, en direct.',
    intro:
      'Des séances de sensibilisation gratuites pour les familles et des séances professionnelles pour les praticiens, surtout en ligne via Zoom.',
    upcoming: 'À venir',
    past: 'Séances récentes',
    free: 'Gratuit',
    paid: 'Payant',
    online: 'En ligne · Zoom',
    register: 'Rejoindre le groupe WhatsApp',
    details: 'Voir les détails',
    askRecording: 'Demander l’enregistrement',
    recording: 'Enregistrement disponible',
    dateTbc: 'Date à annoncer',
    waitlist: 'Liste d’attente ouverte',
    joinWaitlist: 'Rejoindre la liste d’attente',
    inProgress: 'En cours',
    session2: 'Séance 2',
    notify: 'Être informé',
    calendar: 'Ajouter au calendrier',
    with: 'Avec',
    teamEyebrow: 'Les personnes',
    teamTitle: 'Qui guide Luminol Psychologie.',
    teamIntro:
      'La fondatrice dirige le pôle psychologie, avec des spécialistes qui animent des séances et des programmes.',
  },
  ar: {
    eyebrow: 'الفعاليات واللقاءات',
    title: 'تعلّم مع لومينول مباشرة.',
    intro:
      'لقاءات توعوية مجانية للأسر ولقاءات مهنية للممارسين، غالبًا عبر الإنترنت على Zoom.',
    upcoming: 'قريبًا',
    past: 'لقاءات سابقة',
    free: 'مجاني',
    paid: 'مدفوع',
    online: 'عبر الإنترنت · Zoom',
    register: 'انضم إلى مجموعة واتساب',
    details: 'التفاصيل',
    askRecording: 'اطلب التسجيل',
    recording: 'التسجيل متاح',
    dateTbc: 'الموعد يُعلن لاحقًا',
    waitlist: 'قائمة الانتظار مفتوحة',
    joinWaitlist: 'انضم إلى قائمة الانتظار',
    inProgress: 'جارٍ الآن',
    session2: 'الجلسة 2',
    notify: 'أعلمني',
    calendar: 'أضف إلى التقويم',
    with: 'مع',
    teamEyebrow: 'الفريق',
    teamTitle: 'من يقود لومينول لعلم النفس.',
    teamIntro:
      'تقود المؤسسة قسم علم النفس، وينضم إليها مختصون يقدّمون اللقاءات والبرامج.',
  },
};
