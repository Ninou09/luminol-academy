import type { PeoplePhoto } from './people-photos';

export const founderPhotoCredit = {
  source: 'luminol-owner-supplied-generated-founder-photos',
  license: 'Luminol Academy owner-supplied generated imagery',
} as const;

export const founderPhotos = {
  window: {
    src: '/media/people/founder-portrait-window.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Kheddaoui Fettouma seated by the window with a notebook',
      fr: 'Kheddaoui Fettouma assise près de la fenêtre avec un carnet',
      ar: 'خداوي فطومة جالسة قرب النافذة وأمامها دفتر',
    },
  },
  notes: {
    src: '/media/people/founder-course-notes.webp',
    width: 1774,
    height: 887,
    alt: {
      en: 'Kheddaoui Fettouma marking a teaching diagram at her desk',
      fr: 'Kheddaoui Fettouma annotant un schéma pédagogique à son bureau',
      ar: 'خداوي فطومة تدوّن ملاحظات على مخطط تعليمي في مكتبها',
    },
  },
  milestones: {
    src: '/media/people/founder-milestone-materials.webp',
    width: 1536,
    height: 1024,
    alt: {
      en: 'Books, a plum notebook and a brass bookmark in the window light',
      fr: 'Des livres, un carnet prune et un marque-page en laiton près de la fenêtre',
      ar: 'كتب ودفتر بلون البرقوق وعلامة صفحات نحاسية في ضوء النافذة',
    },
  },
  teaching: {
    src: '/media/people/founder-teaching-detail.webp',
    width: 1536,
    height: 1024,
    alt: {
      en: 'Kheddaoui Fettouma explaining a diagram to adult learners',
      fr: 'Kheddaoui Fettouma explique un schéma à un groupe d’adultes',
      ar: 'خداوي فطومة تشرح مخططًا لمجموعة من المتعلمين البالغين',
    },
  },
  wide: {
    src: '/media/people/founder-portrait-horizontal.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'Kheddaoui Fettouma holding a notebook by the bookshelves',
      fr: 'Kheddaoui Fettouma tient un carnet devant la bibliothèque',
      ar: 'خداوي فطومة تحمل دفترًا بجوار رفوف الكتب',
    },
  },
  vertical: {
    src: '/media/people/founder-portrait-vertical.webp',
    width: 752,
    height: 940,
    alt: {
      en: 'Kheddaoui Fettouma holding a notebook by the bookshelves',
      fr: 'Kheddaoui Fettouma tient un carnet devant la bibliothèque',
      ar: 'خداوي فطومة تحمل دفترًا بجوار رفوف الكتب',
    },
  },
  academy: {
    src: '/media/people/founder-academy-portrait.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'Kheddaoui Fettouma standing in a lavender and plum interior',
      fr: 'Kheddaoui Fettouma debout dans un intérieur aux tons lavande et prune',
      ar: 'خداوي فطومة تقف في غرفة بدرجات اللافندر والبرقوق',
    },
  },
} satisfies Record<string, PeoplePhoto>;
