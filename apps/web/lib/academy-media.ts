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
    src: '/media/cinematic/books.webp',
    sourceUrl: 'https://www.pexels.com/photo/159711/',
    credit: 'Pexels · Pixabay',
    crop: 'center-center',
    alt: {
      en: 'Shelves filled with books in a warm library',
      fr: 'Des étagères remplies de livres dans une bibliothèque chaleureuse',
      ar: 'رفوف مليئة بالكتب في مكتبة دافئة',
    },
  },
  training: {
    src: '/media/cinematic/hero-poster.webp',
    sourceUrl:
      'https://www.pexels.com/video/a-sunlight-shines-through-trees-4867892/',
    credit: 'Pexels · Martina Tomšič',
    crop: 'center-center',
    alt: {
      en: 'Warm sunlight filtering through coastal trees',
      fr: 'Une lumière dorée traverse des arbres côtiers',
      ar: 'ضوء ذهبي يتسلل بين أشجار ساحلية',
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
