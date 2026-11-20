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
    credits: 'Photo & video credits',
  },
  fr: {
    pause: 'Mettre la vidéo en pause',
    play: 'Lire la vidéo d’arrière-plan',
    discover: 'Découvrir l’académie',
    location: 'Algérie · International',
    credits: 'Crédits photo et vidéo',
  },
  ar: {
    pause: 'إيقاف فيديو الخلفية مؤقتاً',
    play: 'تشغيل فيديو الخلفية',
    discover: 'اكتشف الأكاديمية',
    location: 'الجزائر · حول العالم',
    credits: 'مصادر الصور والفيديو',
  },
};

export type BrandArtwork = 'heroDesktop' | 'heroMobile' | 'darkTexture' | 'orb';

type BrandArtworkAsset = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

/** Commissioned abstract 3D artwork: no people, places or real records. */
export const brandArtworkCredit = {
  source: 'luminol-commissioned-3d',
  license: 'Luminol Academy commissioned artwork (AI-assisted)',
  label: {
    en: 'Abstract 3D artwork · Luminol Academy',
    fr: 'Illustrations 3D abstraites · Luminol Academy',
    ar: 'أعمال فنية ثلاثية الأبعاد · أكاديمية لومينول',
  } satisfies Record<Locale, string>,
} as const;

export const brandArtwork: Record<BrandArtwork, BrandArtworkAsset> = {
  heroDesktop: {
    src: '/media/brand/hero-desktop.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'A glass sphere filled with flowing luminous cyan light',
      fr: 'Une sphère de verre remplie d’une lumière cyan fluide',
      ar: 'كرة زجاجية مملوءة بضوء سماوي متدفق',
    },
  },
  heroMobile: {
    src: '/media/brand/hero-mobile.webp',
    width: 941,
    height: 1672,
    alt: {
      en: 'A glass sphere filled with flowing luminous cyan light',
      fr: 'Une sphère de verre remplie d’une lumière cyan fluide',
      ar: 'كرة زجاجية مملوءة بضوء سماوي متدفق',
    },
  },
  darkTexture: {
    src: '/media/brand/dark-texture.webp',
    width: 1672,
    height: 941,
    alt: { en: '', fr: '', ar: '' },
  },
  orb: {
    src: '/media/brand/programme-card.webp',
    width: 1448,
    height: 1086,
    alt: {
      en: 'A small glowing glass orb resting on a deep blue surface',
      fr: 'Un petit orbe de verre lumineux posé sur une surface bleu nuit',
      ar: 'كرة زجاجية صغيرة متوهجة على سطح أزرق داكن',
    },
  },
};

export const schoolArtwork: Record<AcademySchool, BrandArtworkAsset> = {
  psychology: {
    src: '/media/brand/school-psychology.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Soft teal ribbons wrapping gently around a glowing core of light',
      fr: 'Des rubans sarcelle enveloppent doucement un cœur de lumière',
      ar: 'أشرطة خضراء مزرقة تلتف بلطف حول نواة مضيئة',
    },
  },
  languages: {
    src: '/media/brand/school-languages.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Floating glass forms connected by a glowing sound wave',
      fr: 'Des formes de verre reliées par une onde sonore lumineuse',
      ar: 'أشكال زجاجية عائمة تربطها موجة صوتية مضيئة',
    },
  },
  training: {
    src: '/media/brand/school-training.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Glass and bronze steps rising toward a warm light',
      fr: 'Des marches de verre et de bronze montent vers une lumière chaude',
      ar: 'درجات من الزجاج والبرونز تصعد نحو ضوء دافئ',
    },
  },
};

/** Commissioned abstract psychology artwork for inner pages (no real people). */
export const psychologyArtwork = {
  innerWorld: {
    src: '/media/brand/inner-world.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'A glass head in profile holding a calm sunrise over still water',
      fr: 'Une tête de verre de profil abritant un lever de soleil apaisé sur une eau calme',
      ar: 'رأس زجاجي جانبي يحتضن شروقًا هادئًا فوق ماء ساكن',
    },
  },
  humanConnection: {
    src: '/media/brand/human-connection.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Two translucent figures connected by a gentle thread of light',
      fr: 'Deux silhouettes translucides reliées par un fil de lumière',
      ar: 'شكلان شفافان يربطهما خيط لطيف من النور',
    },
  },
  quietLake: {
    src: '/media/brand/quiet-lake.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'A glass sphere floating above a still turquoise lake at dawn',
      fr: 'Une sphère de verre flotte au-dessus d’un lac turquoise immobile à l’aube',
      ar: 'كرة زجاجية تطفو فوق بحيرة فيروزية ساكنة عند الفجر',
    },
  },
  untangledKnot: {
    src: '/media/brand/untangled-knot.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'A tangled knot of threads unravelling into one clear line of light',
      fr: 'Un nœud de fils emmêlés qui se dénoue en une ligne de lumière claire',
      ar: 'عقدة خيوط متشابكة تنحلّ إلى خط واحد واضح من النور',
    },
  },
  neuronTree: {
    src: '/media/brand/neuron-tree.webp',
    width: 1254,
    height: 1254,
    alt: {
      en: 'A luminous tree of neurons growing from a glass sphere',
      fr: 'Un arbre lumineux de neurones qui pousse d’une sphère de verre',
      ar: 'شجرة مضيئة من الخلايا العصبية تنمو من كرة زجاجية',
    },
  },
  contactConversation: {
    src: '/media/brand/contact-conversation.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'Two glass figures talking on a hill at dawn beside a glowing lantern',
      fr: 'Deux silhouettes de verre discutent sur une colline à l’aube près d’une lanterne',
      ar: 'شكلان زجاجيان يتحدثان على تلة عند الفجر بجانب فانوس مضيء',
    },
  },
  familyAfterTrauma: {
    src: '/media/brand/family-after-trauma.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'A translucent family held together inside a gentle circle of light',
      fr: 'Une famille translucide réunie dans un doux cercle de lumière',
      ar: 'عائلة شفافة متماسكة داخل دائرة لطيفة من النور',
    },
  },
  lostPath: {
    src: '/media/brand/lost-404.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'A small glowing sphere resting on a luminous path through soft fog',
      fr: 'Une petite sphère lumineuse posée sur un chemin de lumière dans la brume',
      ar: 'كرة صغيرة مضيئة على درب من النور وسط ضباب خفيف',
    },
  },
  languageSchool: {
    src: '/media/brand/language-school.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Two glass speech bubbles connected by a ribbon of light',
      fr: 'Deux bulles de dialogue en verre reliées par un ruban de lumière',
      ar: 'فقاعتا حوار زجاجيتان يربطهما شريط من النور',
    },
  },
} as const satisfies Record<string, BrandArtworkAsset>;

/** Commissioned luminous-glass scenes (stylised figures, no real people). */
export type CommissionedScene = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

export const commissionedScenes = {
  aboutHero: {
    src: '/media/brand/about-hero.webp',
    width: 1122,
    height: 1402,
    alt: {
      en: 'Glass figures of different ages walking together along a path of light',
      fr: 'Des silhouettes de verre de tous âges avancent ensemble sur un chemin de lumière',
      ar: 'أشكال زجاجية من أعمار مختلفة تسير معًا على درب من النور',
    },
  },
  schoolHero: {
    psychology: {
      src: '/media/brand/school-hero-psychology.webp',
      width: 1122,
      height: 1402,
      alt: {
        en: 'Two glass figures in armchairs facing each other around a glowing sphere',
        fr: 'Deux silhouettes de verre face à face autour d’une sphère lumineuse',
        ar: 'شكلان زجاجيان متقابلان في مقعدين حول كرة مضيئة',
      },
    },
    languages: {
      src: '/media/brand/school-hero-languages.webp',
      width: 1122,
      height: 1402,
      alt: {
        en: 'Glass figures around a glowing table with ribbons of conversation',
        fr: 'Des silhouettes de verre autour d’une table lumineuse, reliées par la conversation',
        ar: 'أشكال زجاجية حول طاولة مضيئة تربطها أشرطة من الحوار',
      },
    },
    training: {
      src: '/media/brand/school-hero-training.webp',
      width: 1122,
      height: 1402,
      alt: {
        en: 'A team of glass figures building a glowing staircase toward a star',
        fr: 'Une équipe de silhouettes de verre construit un escalier lumineux vers une étoile',
        ar: 'فريق من أشكال زجاجية يبني درجًا مضيئًا نحو نجمة',
      },
    },
  },
  inset: {
    psychology: {
      src: '/media/brand/inset-psychology.webp',
      width: 900,
      height: 675,
      alt: {
        en: 'Two small glass figures in conversation around a glowing sphere',
        fr: 'Deux petites silhouettes de verre en conversation autour d’une sphère',
        ar: 'شكلان زجاجيان صغيران يتحاوران حول كرة مضيئة',
      },
    },
    languages: {
      src: '/media/brand/inset-languages.webp',
      width: 900,
      height: 675,
      alt: {
        en: 'Small glass figures around a table under floating speech bubbles',
        fr: 'De petites silhouettes de verre autour d’une table sous des bulles de dialogue',
        ar: 'أشكال زجاجية صغيرة حول طاولة تحت فقاعات حوار',
      },
    },
    training: {
      src: '/media/brand/inset-training.webp',
      width: 900,
      height: 675,
      alt: {
        en: 'Small glass figures building glowing golden steps together',
        fr: 'De petites silhouettes de verre construisent ensemble des marches dorées',
        ar: 'أشكال زجاجية صغيرة تبني معًا درجات ذهبية مضيئة',
      },
    },
  },
  contactConversation: {
    src: '/media/brand/contact-conversation.webp',
    width: 1672,
    height: 941,
    alt: {
      en: 'Two glass figures talking on a hill at dawn beside a glowing lantern',
      fr: 'Deux silhouettes de verre discutent sur une colline à l’aube près d’une lanterne',
      ar: 'شكلان زجاجيان يتحدثان على تلة عند الفجر بجانب فانوس مضيء',
    },
  },
} as const;
