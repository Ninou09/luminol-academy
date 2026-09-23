import type { Locale } from '@luminol/localization';

export type AcademySchool = 'psychology' | 'languages' | 'training';

type AcademyMediaAsset = {
  src: string;
  sourceUrl: string;
  credit: string;
  crop: string;
  alt: Record<Locale, string>;
  license?: string;
  position?: string;
};

function illustration(
  file: string,
  en: string,
  fr: string,
  ar: string,
  position = '50% 50%',
): AcademyMediaAsset {
  return {
    src: `/media/academy/${file}.webp`,
    sourceUrl: '/media/academy/manifest.json',
    credit: 'Luminol · Editorial illustration',
    license:
      'AI-generated editorial illustration, commissioned by the site owner',
    crop: `cover; focal point ${position}`,
    position,
    alt: { en, fr, ar },
  };
}

/** Owner-requested editorial illustrations; never evidence of actual staff or premises. */
export const academyStoryMedia = {
  classroom: illustration(
    'home-hero-classroom',
    'An instructor leading a class of adult learners',
    'Une enseignante anime un cours pour adultes',
    'مدرّسة تقود درساً للمتعلمين البالغين',
  ),
  parenting: illustration(
    'parenting-guidance-group',
    'Adults sharing perspectives in a facilitated group',
    'Des adultes échangent dans un groupe animé',
    'بالغون يتبادلون وجهات النظر في مجموعة ميسّرة',
  ),
  community: illustration(
    'community-courtyard',
    'Three adult learners sharing a conversation in a sunlit courtyard',
    'Trois adultes échangent dans une cour ensoleillée',
    'ثلاثة متعلمين بالغين يتحاورون في فناء مشمس',
    '70% 48%',
  ),
  study: illustration(
    'students-study',
    'Three learners comparing notes together',
    'Trois apprenants comparent leurs notes',
    'ثلاثة متعلمين يراجعون ملاحظاتهم معاً',
  ),
  psychology: illustration(
    'psychology-workshop',
    'An adult discussion circle with a facilitator',
    'Un cercle de discussion animé pour adultes',
    'حلقة نقاش للبالغين مع ميسّر',
  ),
  languages: illustration(
    'languages-flags-classroom',
    'Language learners with Algerian, French and British flags in the classroom',
    'Des apprenants en langues, avec les drapeaux algérien, français et britannique',
    'متعلمو اللغات في قاعة بها أعلام الجزائر وفرنسا وبريطانيا',
  ),
  training: illustration(
    'communication-presentation',
    'A facilitator leading a presentation and discussion',
    'Une formatrice anime une présentation et un échange',
    'مكوّنة تقدم عرضاً وتقود نقاشاً',
  ),
  detail: illustration(
    'programmes-workshop-generic',
    'Learners working on written exercises during a workshop',
    'Des apprenants travaillent sur des exercices pendant un atelier',
    'متعلمون ينجزون تمارين كتابية خلال ورشة',
  ),
  about: illustration(
    'about-students-portrait',
    'Learners following a discussion in a small classroom',
    'Des apprenants suivent une discussion en petit groupe',
    'متعلمون يتابعون نقاشاً في مجموعة صغيرة',
  ),
  online: illustration(
    'online-learning',
    'An adult learner following an online lesson at home',
    'Une apprenante suit un cours en ligne chez elle',
    'متعلّمة تتابع درساً عبر الإنترنت من منزلها',
  ),
  consultation: illustration(
    'consultations-room',
    'Two chairs arranged for a private conversation',
    'Deux fauteuils aménagés pour un échange confidentiel',
    'مقعدان مرتبان لحوار خاص',
  ),
  contact: illustration(
    'contact-inquiry',
    'Hands writing notes beside a phone',
    'Des mains prennent des notes près d’un téléphone',
    'يدان تدوّنان ملاحظات بجانب هاتف',
  ),
  conversation: illustration(
    'language-practice',
    'A tutor supporting a small-group conversation exercise',
    'Un enseignant accompagne un exercice de conversation',
    'مدرّس يرافق تمرين محادثة في مجموعة صغيرة',
  ),
  workshop: illustration(
    'professional-skills-workshop',
    'Adults collaborating on a practical workshop exercise',
    'Des adultes collaborent dans un atelier pratique',
    'بالغون يتعاونون في تمرين تطبيقي',
  ),
  quiet: illustration(
    'psychology-consultation-room',
    'A quiet room prepared for a supportive conversation',
    'Un espace calme préparé pour un échange',
    'غرفة هادئة مهيأة للحوار',
  ),
} satisfies Record<string, AcademyMediaAsset>;

export type AcademyAssetKey = keyof typeof academyStoryMedia;

export const academyMedia: Record<AcademySchool, AcademyMediaAsset> = {
  psychology: academyStoryMedia.quiet,
  languages: academyStoryMedia.conversation,
  training: academyStoryMedia.workshop,
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
