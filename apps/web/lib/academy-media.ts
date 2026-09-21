import type { Locale } from '@luminol/localization';

export type AcademySchool = 'psychology' | 'languages' | 'training';

type AcademyMediaAsset = {
  src: string;
  sourceUrl: string;
  credit: string;
  crop: string;
  alt: Record<Locale, string>;
};

export const academyMedia: Record<AcademySchool, AcademyMediaAsset> = {
  psychology: {
    src: '/media/editorial/conversation.jpg',
    sourceUrl: 'https://unsplash.com/photos/LQ1t-8Ms5PY',
    credit: 'Unsplash · Christina @ wocintechchat.com',
    crop: 'center-center',
    alt: {
      en: 'Two women having a conversation beside a sunlit window',
      fr: 'Deux femmes échangent près d’une fenêtre lumineuse',
      ar: 'امرأتان تتحاوران بجانب نافذة مضيئة',
    },
  },
  languages: {
    src: '/media/editorial/students.jpg',
    sourceUrl: 'https://unsplash.com/photos/omeaHbEFlN4',
    credit: 'Unsplash · Alexis Brown',
    crop: 'center-center',
    alt: {
      en: 'Students reading and writing together around a wooden table',
      fr: 'Des étudiants lisent et prennent des notes autour d’une table',
      ar: 'طلاب يقرؤون ويدوّنون ملاحظاتهم معًا حول طاولة خشبية',
    },
  },
  training: {
    src: '/media/editorial/team.jpg',
    sourceUrl: 'https://unsplash.com/photos/vdXMSiX-n6M',
    credit: 'Unsplash · Mimi Thian',
    crop: 'center-center',
    alt: {
      en: 'A small team collaborating around a laptop in a bright workspace',
      fr: 'Une équipe collabore autour d’un ordinateur dans un espace lumineux',
      ar: 'فريق صغير يتعاون حول حاسوب محمول في مساحة مضيئة',
    },
  },
};

export const cinematicCopy: Record<
  Locale,
  {
    pause: string;
    play: string;
    discover: string;
    location: string;
    credits: string;
  }
> = {
  en: {
    pause: 'Pause background video',
    play: 'Play background video',
    discover: 'Discover the academy',
    location: 'Algeria · Worldwide',
    credits: 'Illustrative photography & film',
  },
  fr: {
    pause: 'Mettre la vidéo en pause',
    play: 'Lire la vidéo d’arrière-plan',
    discover: 'Découvrir l’académie',
    location: 'Algérie · International',
    credits: 'Photographies et film d’illustration',
  },
  ar: {
    pause: 'إيقاف فيديو الخلفية مؤقتاً',
    play: 'تشغيل فيديو الخلفية',
    discover: 'اكتشف الأكاديمية',
    location: 'الجزائر · حول العالم',
    credits: 'صور وفيلم توضيحي — المصادر والحقوق',
  },
};
