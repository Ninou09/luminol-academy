import type { Locale } from '@luminol/localization';

export type StockAsset =
  | 'reflection'
  | 'consultation'
  | 'english'
  | 'french'
  | 'online'
  | 'speaking'
  | 'community';

type StockMedia = {
  src: string;
  width: number;
  height: number;
  sourceUrl: string;
  creator: string;
  license: string;
  licenseUrl: string;
  position: string;
  crop: string;
  alt: Record<Locale, string>;
  kind: 'stock';
  publicationApproved: true;
};

/** Reviewed illustrative stock. Full provenance and crop intent: public/media/stock/manifest.json. */
export const stockMedia = {
  reflection: {
    src: '/media/stock/reflection.webp',
    width: 1125,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/woman-writing-in-notebook-4240576/',
    creator: 'Ivan S',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '50% 38%',
    crop: 'Keep the notebook, writing hand and upper body together. Prefer 3:2 or 4:3; do not use a tight face crop. The laptop has a visible manufacturer logo in the lower part; a slightly higher crop deemphasizes it.',
    alt: {
      en: 'Stock photograph of an adult writing in a notebook at a wooden desk with a laptop and books.',
      fr: 'Photo de banque d’images montrant une adulte qui écrit dans un carnet, à un bureau en bois avec un ordinateur et des livres.',
      ar: 'صورة من مكتبة صور لشخص بالغ يكتب في دفتر على مكتب خشبي بجانب حاسوب وكتب.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  consultation: {
    src: '/media/stock/consultation.webp',
    width: 1154,
    height: 750,
    sourceUrl: 'https://www.pexels.com/photo/two-men-talking-together-5336957/',
    creator: 'Tima Miroshnichenko',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '58% 52%',
    crop: 'Keep both seated adults and their conversational relationship visible. Prefer 3:2 or 16:9; avoid a narrow portrait crop. Do not label either person as having a diagnosis or as a Luminol clinician/client.',
    alt: {
      en: 'Stock photograph of two adults seated opposite each other in a room, one holding a notebook.',
      fr: 'Photo de banque d’images montrant deux adultes assis face à face dans une pièce, dont l’un tient un carnet.',
      ar: 'صورة من مكتبة صور لشخصين بالغين يجلسان متقابلين في غرفة، ويحمل أحدهما دفترًا.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  english: {
    src: '/media/stock/english.webp',
    width: 1125,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/woman-teaching-english-in-class-5427868/',
    creator: 'Tima Miroshnichenko',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '53% 45%',
    crop: 'Retain the instructor, seated learner and the English heading on the whiteboard. Best at 3:2. The board uses alphabet magnets and elementary phrases; appropriate to foundational English, not advanced professional language claims.',
    alt: {
      en: 'Stock photograph of a teacher beside a whiteboard marked English, facing a seated learner.',
      fr: 'Photo de banque d’images montrant une enseignante près d’un tableau portant le mot « English », face à une apprenante assise.',
      ar: 'صورة من مكتبة صور لمعلّمة بجوار لوحة كُتبت عليها كلمة «English»، أمام متعلّمة جالسة.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  french: {
    src: '/media/stock/french.webp',
    width: 500,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/a-woman-is-standing-in-front-of-a-book-stand-28345117/',
    creator: 'Céline |',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '49% 52%',
    crop: 'Portrait source. Preserve bookstall and browsing person; use 2:3 or 4:5 if possible. For landscape programme cards, focal 49% 52% keeps the books and person but loses most of the distant cathedral. Label as cultural inspiration, not a Luminol campus or organized trip.',
    alt: {
      en: 'Stock photograph of a person browsing a riverside bookstall in Paris, with Notre-Dame in the background.',
      fr: 'Photo de banque d’images montrant une personne qui regarde les livres d’un bouquiniste à Paris, avec Notre-Dame en arrière-plan.',
      ar: 'صورة من مكتبة صور لشخص يتصفّح كتبًا لدى بائع على ضفة النهر في باريس، وتظهر كاتدرائية نوتردام في الخلفية.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  online: {
    src: '/media/stock/online.webp',
    width: 1125,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/a-person-holding-a-digital-tablet-4443160/',
    creator: 'Polina Tankilevitch',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '42% 52%',
    crop: 'Keep the tablet, stylus and headphones. Use 3:2 or 4:3. The tablet visibly reads courses; the laptop screen is background detail.',
    alt: {
      en: 'Stock photograph of a person wearing headphones using a stylus on a tablet beside a laptop and an open notebook.',
      fr: 'Photo de banque d’images montrant une personne avec un casque qui utilise un stylet sur une tablette, près d’un ordinateur et d’un carnet ouvert.',
      ar: 'صورة من مكتبة صور لشخص يرتدي سماعات ويستخدم قلمًا على جهاز لوحي بجانب حاسوب ودفتر مفتوح.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  speaking: {
    src: '/media/stock/speaking.webp',
    width: 1123,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/a-woman-holding-a-microphone-8761515/',
    creator: 'Pavel Danilyuk',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '27% 44%',
    crop: 'Speaker is on the left; keep face, microphone and gesturing hand. Use 3:2 or 4:3. Do not centre a portrait crop on the background attendee.',
    alt: {
      en: 'Stock photograph of a woman speaking into a microphone beside a lectern, with an attendee in the background.',
      fr: 'Photo de banque d’images montrant une femme qui parle dans un microphone près d’un pupitre, avec une participante en arrière-plan.',
      ar: 'صورة من مكتبة صور لامرأة تتحدث في ميكروفون بجوار منصّة للعرض، وتظهر إحدى الحاضرات في الخلفية.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
  community: {
    src: '/media/stock/community.webp',
    width: 1125,
    height: 750,
    sourceUrl:
      'https://www.pexels.com/photo/young-adults-studying-outdoors-on-a-laptop-27175732/',
    creator: 'Helena Lopes',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    position: '48% 46%',
    crop: 'Keep both adults, the laptop and the picnic blanket visible. Use 3:2 or 4:3. The photograph shows informal outdoor device use; do not claim a specific course or campus.',
    alt: {
      en: 'Stock photograph of two adults sitting on a picnic blanket outdoors, one using a laptop and the other holding a phone.',
      fr: 'Photo de banque d’images montrant deux adultes sur une couverture à l’extérieur, l’une utilisant un ordinateur et l’autre tenant un téléphone.',
      ar: 'صورة من مكتبة صور لشخصين بالغين يجلسان على بطانية في الهواء الطلق، يستخدم أحدهما حاسوبًا ويحمل الآخر هاتفًا.',
    },
    kind: 'stock',
    publicationApproved: true,
  },
} as const satisfies Record<StockAsset, StockMedia>;
