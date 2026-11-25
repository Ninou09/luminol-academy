import type { Locale } from '@luminol/localization';

export const founderPath = '/about/founder';
export const founderExperience = '31+';
export const founderWebsite = 'https://luminolacademy.nl/';
export const founderPortrait = {
  src: '/media/founder-office-portrait.webp',
  source:
    'https://assets.cdn.filesafe.space/YpQfZFsq469Yi5AADq1v/media/6ad88cbe3cacdd911709f799.png',
} as const;
export const founderContact = {
  email: 'kheddaouipsy@yahoo.fr',
  phone: '+213556914517',
  phoneDisplay: '+213 556 91 45 17',
} as const;

export const founderNav = {
  en: { label: 'About the founder', description: 'Meet Kheddaoui Fettouma' },
  fr: { label: 'La fondatrice', description: 'Rencontrez Kheddaoui Fettouma' },
  ar: { label: 'عن المؤسّسة', description: 'تعرّفوا على خداوي فطومة' },
} as const satisfies Record<Locale, { label: string; description: string }>;

export const founderCourses = {
  en: {
    title: 'Training with Kheddaoui Fettouma',
    courses: [
      'Cognitive behavioural therapy techniques',
      'Emotional Freedom Technique (EFT)',
      'Couples counselling: assessment and support',
      'Family counsellor training',
    ],
    action: 'View courses on her website',
  },
  fr: {
    title: 'Se former avec Kheddaoui Fettouma',
    courses: [
      'Techniques de thérapie cognitivo-comportementale',
      'Technique de libération émotionnelle (EFT)',
      'Conseil conjugal : évaluation et accompagnement',
      'Formation de conseiller familial',
    ],
    action: 'Voir les formations sur son site',
  },
  ar: {
    title: 'التدريب مع خداوي فطومة',
    courses: [
      'دورة فنيات العلاج المعرفي السلوكي',
      'دورة تقنية تحرير المشاعر السلبية (EFT)',
      'دورة الإرشاد الزواجي: تشخيص وتكفّل',
      'دورة مستشار أسري',
    ],
    action: 'اطّلع على الدورات في موقعها',
  },
} as const satisfies Record<
  Locale,
  { title: string; courses: readonly string[]; action: string }
>;

export const founderCopy = {
  en: {
    name: 'Kheddaoui Fettouma',
    role: 'Founder of Luminol Academy · Clinical psychologist',
    intro:
      'Kheddaoui Fettouma founded Luminol Academy in 2019 to bring psychological consultations, education and professional training together. She brings more than 31 years of experience to her work with individuals, couples and families.',
    years: 'Years of experience',
    website: 'Visit her personal website',
    career: 'Clinical practice and teaching',
    careerBody:
      'She worked as a psychologist at the cancer centre of Frantz Fanon Hospital in Blida, then practised in a private clinic. She taught at the University of Blida and supervised field placements for psychology students at the universities of Algiers and Blida.',
    contact: 'Contact Kheddaoui Fettouma',
  },
  fr: {
    name: 'Kheddaoui Fettouma',
    role: 'Fondatrice de Luminol Academy · Psychologue clinicienne',
    intro:
      'Kheddaoui Fettouma a fondé Luminol Academy en 2019 pour réunir consultations psychologiques, enseignement et formation professionnelle. Elle s’appuie sur plus de 31 ans d’expérience pour accompagner les personnes, les couples et les familles.',
    years: 'Ans d’expérience',
    website: 'Visiter son site personnel',
    career: 'Pratique clinique et enseignement',
    careerBody:
      'Elle a exercé comme psychologue au centre anticancer de l’hôpital Frantz Fanon de Blida, puis en cabinet privé. Elle a enseigné à l’université de Blida et supervisé les stages de terrain d’étudiants en psychologie aux universités d’Alger et de Blida.',
    contact: 'Contacter Kheddaoui Fettouma',
  },
  ar: {
    name: 'خداوي فطومة',
    role: 'مؤسّسة أكاديمية لومينول · أخصائية نفسية عيادية',
    intro:
      'أسّست خداوي فطومة أكاديمية لومينول عام 2019 لتجمع بين الاستشارات النفسية والتعليم والتدريب المهني. وتستند في عملها مع الأفراد والأزواج والأسر إلى أكثر من 31 عامًا من الخبرة.',
    years: 'عامًا من الخبرة',
    website: 'زيارة موقعها الشخصي',
    career: 'الممارسة العيادية والتدريس',
    careerBody:
      'عملت أخصائية نفسية في مركز مكافحة السرطان بمستشفى فرانس فانون في البليدة، ثم مارست العلاج النفسي في عيادة خاصة. درّست في جامعة البليدة وأشرفت على التدريب الميداني لطلبة علم النفس في جامعتي الجزائر والبليدة.',
    contact: 'التواصل مع خداوي فطومة',
  },
} as const satisfies Record<
  Locale,
  {
    name: string;
    role: string;
    intro: string;
    years: string;
    website: string;
    career: string;
    careerBody: string;
    contact: string;
  }
>;

export const founderJourney = {
  en: {
    navigation: 'On this page',
    career: 'Career',
    training: 'Training',
    contact: 'Contact',
    title: 'Milestones',
    entries: [
      {
        year: 1995,
        title: 'Clinical psychology degree',
        detail: 'University of Algiers.',
      },
      {
        year: 2007,
        title: 'Postgraduate diploma',
        detail: 'Specialisation in psychopathology.',
      },
      {
        year: 2018,
        title: 'Master’s in clinical psychology',
        detail: 'University of Blida 2.',
      },
      {
        year: 2019,
        title: 'Luminol Academy founded',
        detail:
          'Education, professional training and psychological consultations.',
      },
    ],
  },
  fr: {
    navigation: 'Sur cette page',
    career: 'Parcours',
    training: 'Formations',
    contact: 'Contact',
    title: 'Dates clés',
    entries: [
      {
        year: 1995,
        title: 'Licence en psychologie clinique',
        detail: 'Université d’Alger.',
      },
      {
        year: 2007,
        title: 'Diplôme de post-graduation',
        detail: 'Spécialisation en psychopathologie.',
      },
      {
        year: 2018,
        title: 'Master en psychologie clinique',
        detail: 'Université de Blida 2.',
      },
      {
        year: 2019,
        title: 'Fondation de Luminol Academy',
        detail:
          'Enseignement, formation professionnelle et consultations psychologiques.',
      },
    ],
  },
  ar: {
    navigation: 'في هذه الصفحة',
    career: 'المسار المهني',
    training: 'التدريب',
    contact: 'التواصل',
    title: 'محطات بارزة',
    entries: [
      {
        year: 1995,
        title: 'ليسانس في علم النفس العيادي',
        detail: 'جامعة الجزائر.',
      },
      {
        year: 2007,
        title: 'دبلوم دراسات ما بعد التدرّج',
        detail: 'تخصّص علم النفس المرضي.',
      },
      {
        year: 2018,
        title: 'ماستر في علم النفس العيادي',
        detail: 'جامعة البليدة 2.',
      },
      {
        year: 2019,
        title: 'تأسيس أكاديمية لومينول',
        detail: 'التعليم والتدريب المهني والاستشارات النفسية.',
      },
    ],
  },
} as const satisfies Record<
  Locale,
  {
    navigation: string;
    career: string;
    training: string;
    contact: string;
    title: string;
    entries: readonly { year: number; title: string; detail: string }[];
  }
>;
