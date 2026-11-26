import type { Locale } from '@luminol/localization';

export type EditorialFilmAsset = {
  src: string;
  poster: string;
  source: string;
  alt: Record<Locale, string>;
};

export const filmControls = {
  en: {
    play: 'Play video',
    loading: 'Loading video',
    error: 'Video unavailable',
  },
  fr: {
    play: 'Lire la vidéo',
    loading: 'Chargement de la vidéo',
    error: 'Vidéo indisponible',
  },
  ar: {
    play: 'تشغيل الفيديو',
    loading: 'جارٍ تحميل الفيديو',
    error: 'الفيديو غير متاح',
  },
} as const;

export const editorialFilms = {
  library: {
    src: '/media/editorial/psychology-library-pexels-3009667.mp4',
    poster: '/media/editorial/psychology-library-pexels-3009667.webp',
    source:
      'https://www.pexels.com/video/piles-and-layers-of-book-for-reading-placed-in-a-book-shelves-3009667/',
    alt: {
      en: 'Stacks of books on shelves beside a window',
      fr: 'Des piles de livres sur des étagères près d’une fenêtre',
      ar: 'أكوام من الكتب على رفوف قرب نافذة',
    },
  },
  about: {
    src: '/media/editorial/about-classroom-pexels-6671552.mp4',
    poster: '/media/editorial/about-classroom-pexels-6671552.webp',
    source:
      'https://www.pexels.com/video/tracking-shot-of-empty-classroom-6671552/',
    alt: {
      en: 'A slow camera move past desks in an empty classroom',
      fr: 'La caméra longe lentement les tables d’une salle de cours vide',
      ar: 'حركة بطيئة للكاميرا بجانب الطاولات في قاعة دراسية خالية',
    },
  },
} as const satisfies Record<string, EditorialFilmAsset>;
