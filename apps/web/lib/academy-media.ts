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
    src: '/media/cinematic/collaboration.webp',
    sourceUrl: 'https://www.pexels.com/photo/3184306/',
    credit: 'Pexels · fauxels',
    crop: 'center-center',
    alt: {
      en: 'A diverse learning group collaborating around a table',
      fr: 'Un groupe diversifié collabore autour d’une table',
      ar: 'مجموعة تعليمية متنوعة تتعاون حول طاولة',
    },
  },
  languages: {
    src: '/media/cinematic/learning.jpg',
    sourceUrl: 'https://www.pexels.com/photo/1181533/',
    credit: 'Pexels · Christina Morillo',
    crop: 'center-center',
    alt: {
      en: 'Two people exchanging ideas at a whiteboard',
      fr: 'Deux personnes échangent des idées devant un tableau',
      ar: 'شخصان يتبادلان الأفكار أمام لوحة للكتابة',
    },
  },
  training: {
    src: '/media/cinematic/workshop.jpg',
    sourceUrl: 'https://www.pexels.com/photo/3183197/',
    credit: 'Pexels · fauxels',
    crop: 'center-center',
    alt: {
      en: 'An overhead view of a team collaborating and shaking hands',
      fr: 'Vue de dessus d’une équipe qui collabore et se serre la main',
      ar: 'منظر علوي لفريق يتعاون ويتصافح حول طاولة',
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
    credits: 'Visual sources and credits',
  },
  fr: {
    pause: 'Mettre la vidéo en pause',
    play: 'Lire la vidéo d’arrière-plan',
    discover: 'Découvrir l’académie',
    location: 'Algérie · International',
    credits: 'Sources et crédits visuels',
  },
  ar: {
    pause: 'إيقاف فيديو الخلفية مؤقتاً',
    play: 'تشغيل فيديو الخلفية',
    discover: 'اكتشف الأكاديمية',
    location: 'الجزائر · حول العالم',
    credits: 'مصادر وحقوق المواد البصرية',
  },
};
