import type { Locale } from '@luminol/localization';

export const founderPath = '/about/founder';
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
      'Kheddaoui Fettouma founded Luminol Academy in 2019 to bring psychological consultations, education and professional training together. She brings 31 years of experience to her work with individuals, couples and families.',
    years: 'Years of experience',
    website: 'Visit her personal website',
    career: 'Clinical practice and teaching',
    careerBody:
      'She worked as a psychologist at the cancer centre of Frantz Fanon Hospital in Blida, then practised in a private clinic. She taught at the University of Blida and supervised field placements for psychology students at the universities of Algiers and Blida.',
    education: 'Education',
    qualifications: [
      'Degree in clinical psychology, University of Algiers, 1995',
      'Postgraduate diploma in psychopathology, 2007',
      'Master’s in clinical psychology, University of Blida 2, 2018',
    ],
    contact: 'Contact Kheddaoui Fettouma',
  },
  fr: {
    name: 'Kheddaoui Fettouma',
    role: 'Fondatrice de Luminol Academy · Psychologue clinicienne',
    intro:
      'Kheddaoui Fettouma a fondé Luminol Academy en 2019 pour réunir consultations psychologiques, enseignement et formation professionnelle. Elle s’appuie sur 31 ans d’expérience pour accompagner les personnes, les couples et les familles.',
    years: 'Ans d’expérience',
    website: 'Visiter son site personnel',
    career: 'Pratique clinique et enseignement',
    careerBody:
      'Elle a exercé comme psychologue au centre anticancer de l’hôpital Frantz Fanon de Blida, puis en cabinet privé. Elle a enseigné à l’université de Blida et supervisé les stages de terrain d’étudiants en psychologie aux universités d’Alger et de Blida.',
    education: 'Formation universitaire',
    qualifications: [
      'Licence en psychologie clinique, université d’Alger, 1995',
      'Diplôme de post-graduation en psychopathologie, 2007',
      'Master en psychologie clinique, université de Blida 2, 2018',
    ],
    contact: 'Contacter Kheddaoui Fettouma',
  },
  ar: {
    name: 'خداوي فطومة',
    role: 'مؤسّسة أكاديمية لومينول · أخصائية نفسية عيادية',
    intro:
      'أسّست خداوي فطومة أكاديمية لومينول عام 2019 لتجمع بين الاستشارات النفسية والتعليم والتدريب المهني. وتستند في عملها مع الأفراد والأزواج والأسر إلى 31 عامًا من الخبرة.',
    years: 'عامًا من الخبرة',
    website: 'زيارة موقعها الشخصي',
    career: 'الممارسة العيادية والتدريس',
    careerBody:
      'عملت أخصائية نفسية في مركز مكافحة السرطان بمستشفى فرانس فانون في البليدة، ثم مارست العلاج النفسي في عيادة خاصة. درّست في جامعة البليدة وأشرفت على التدريب الميداني لطلبة علم النفس في جامعتي الجزائر والبليدة.',
    education: 'المؤهلات الأكاديمية',
    qualifications: [
      'ليسانس في علم النفس العيادي، جامعة الجزائر، 1995',
      'دبلوم دراسات ما بعد التدرّج في علم النفس المرضي، 2007',
      'ماستر في علم النفس العيادي، جامعة البليدة 2، 2018',
    ],
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
    education: string;
    qualifications: readonly string[];
    contact: string;
  }
>;
