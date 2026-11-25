import type { Locale } from '@luminol/localization';

/**
 * Atmosphere photographs commissioned for Luminol (AI-assisted). They show
 * no real clients or staff, so they are never named or quoted as such.
 * Provenance stays in data-media-* attributes; each photo is used once.
 */
export type PeoplePhoto = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

export const illustrativePhotoCredit = {
  source: 'luminol-illustrative-photo',
  label: {
    en: 'Illustrative scene',
    fr: 'Scène illustrative',
    ar: 'مشهد توضيحي',
  },
  license: 'Luminol Academy commissioned photography (AI-assisted)',
} as const;

const photo = (
  name: string,
  width: number,
  height: number,
  en: string,
  fr: string,
  ar: string,
): PeoplePhoto => ({
  src: `/media/people/${name}.webp`,
  width,
  height,
  alt: { en, fr, ar },
});

export const peoplePhotos = {
  // Home
  academyLecture: photo(
    'academy-lecture',
    1672,
    941,
    'An instructor explains a diagram on a whiteboard to adult learners',
    'Une formatrice explique un schéma au tableau à des apprenants adultes',
    'مدرّبة تشرح مخططًا على السبورة لمتعلّمين بالغين',
  ),
  liveRelief: photo(
    'live-relief',
    1600,
    900,
    'A young woman steps into the sunlight with a calm, relieved smile',
    'Une jeune femme sort au soleil avec un sourire apaisé',
    'شابة تخرج إلى ضوء الشمس بابتسامة هادئة مرتاحة',
  ),
  // About
  liveCommunity: photo(
    'live-community',
    1600,
    900,
    'Adults of different generations share thoughts in a bright group circle',
    'Des adultes de plusieurs générations échangent en cercle dans une salle lumineuse',
    'بالغون من أجيال مختلفة يتبادلون الأفكار في حلقة داخل قاعة مضيئة',
  ),
  academyRoleplay: photo(
    'academy-roleplay',
    1536,
    1024,
    'Psychology students practise a counselling role-play while an instructor observes',
    'Des étudiants en psychologie s’exercent à un entretien sous le regard d’une formatrice',
    'طلاب علم النفس يتدربون على جلسة إرشاد بلعب الأدوار بإشراف مدرّبة',
  ),
  liveGenerations: photo(
    'live-generations',
    1448,
    1086,
    'Adults of different ages work together on an activity around a table',
    'Des adultes de différents âges participent à une activité autour d’une table',
    'بالغون من أعمار مختلفة يشاركون في نشاط حول طاولة',
  ),
  // Consultations
  therapySession: photo(
    'therapy-session',
    1122,
    1402,
    'A psychologist with a notebook listens attentively during a calm consultation',
    'Une psychologue, carnet en main, écoute attentivement pendant une consultation',
    'أخصائية نفسية تحمل دفترًا وتصغي باهتمام خلال استشارة هادئة',
  ),
  academySupervision: photo(
    'academy-supervision',
    1122,
    1402,
    'An experienced psychologist mentors junior colleagues around case notes',
    'Une psychologue expérimentée accompagne de jeunes collègues autour de leurs notes',
    'أخصائية نفسية ذات خبرة توجّه زملاء جددًا حول ملاحظات الحالات',
  ),
  liveHeroMoment: photo(
    'live-hero-moment',
    1600,
    900,
    'Two friends share tea and an honest conversation on a balcony at sunset',
    'Deux amies partagent un thé et une conversation sincère sur un balcon au coucher du soleil',
    'صديقتان تتشاركان الشاي وحديثًا صادقًا على شرفة عند الغروب',
  ),
  // Contact
  designTherapyRoom: photo(
    'design-therapy-room',
    1600,
    900,
    'A calm, welcoming consultation room with two armchairs at golden hour',
    'Une salle de consultation calme et accueillante avec deux fauteuils',
    'غرفة استشارة هادئة ومرحبة بها مقعدان عند الغروب',
  ),
  designHandsNotebook: photo(
    'design-hands-notebook',
    1448,
    1086,
    'Hands holding an open notebook with a small drawn heart',
    'Des mains tenant un carnet ouvert avec un petit cœur dessiné',
    'يدان تحملان دفترًا مفتوحًا عليه قلب صغير مرسوم',
  ),
  // Home · breathing pause
  homeBreathe: photo(
    'home-breathe',
    1600,
    900,
    'A woman breathes calmly with closed eyes in warm window light',
    'Une femme respire calmement, les yeux fermés, dans une lumière chaude',
    'امرأة تتنفس بهدوء مغمضة العينين في ضوء نافذة دافئ',
  ),
  // Contact
  contactsNextStep: photo(
    'contacts-next-step',
    1600,
    900,
    'A young woman writes a message on her phone by a sunny window overlooking Algiers',
    'Une jeune femme écrit un message sur son téléphone près d’une fenêtre ensoleillée donnant sur Alger',
    'شابة تكتب رسالة على هاتفها قرب نافذة مشمسة تطل على الجزائر العاصمة',
  ),
  contactsExplore: photo(
    'contacts-explore',
    1600,
    900,
    'A desk with a psychology notebook, a dictionary and a laptop showing growth',
    'Un bureau avec un carnet de psychologie, un dictionnaire et un ordinateur montrant une progression',
    'مكتب عليه دفتر لعلم النفس وقاموس وحاسوب يعرض منحنى تقدّم',
  ),
  // Programmes
  programCatalog: photo(
    'program-catalog',
    1600,
    900,
    'Adult learners follow a lecturer explaining a mind map in a bright classroom',
    'Des adultes suivent une formatrice qui explique une carte mentale dans une salle lumineuse',
    'متعلمون بالغون يتابعون محاضِرة تشرح خريطة ذهنية في قاعة مضيئة',
  ),
  // Certificates
  certificatePhoto: photo(
    'certificate-photo',
    1600,
    900,
    'A smiling graduate holds up her certificate with a gold seal',
    'Une diplômée souriante montre son certificat au sceau doré',
    'متخرجة مبتسمة ترفع شهادتها ذات الختم الذهبي',
  ),
  // 404
  page404: photo(
    'page-404',
    1600,
    900,
    'A young man with a map smiles as he finds his way in an old Algiers street',
    'Un jeune homme, carte en main, sourit en retrouvant son chemin dans une ruelle d’Alger',
    'شاب يحمل خريطة يبتسم وهو يجد طريقه في زقاق قديم بالجزائر العاصمة',
  ),
  // Programmes
  designBookshelf: photo(
    'design-bookshelf',
    1600,
    761,
    'A warm academy library with shelves of psychology books',
    'Une bibliothèque chaleureuse avec des rayons de livres de psychologie',
    'مكتبة أكاديمية دافئة برفوف كتب علم النفس',
  ),
  academyActWorkshop: photo(
    'academy-act-workshop',
    1600,
    900,
    'Participants practise a mindfulness exercise during an ACT training workshop',
    'Des participants pratiquent un exercice de pleine conscience lors d’un atelier ACT',
    'مشاركون يمارسون تمرين يقظة ذهنية خلال ورشة تدريبية في العلاج بالتقبل والالتزام',
  ),
  // Workshop
  workshopParents: photo(
    'workshop-parents',
    1600,
    900,
    'A psychologist leads a calm workshop for mothers and fathers',
    'Une psychologue anime un atelier serein pour des mères et des pères',
    'أخصائية نفسية تدير ورشة هادئة للأمهات والآباء',
  ),
  workshopHomeSupport: photo(
    'workshop-home-support',
    1536,
    1024,
    'A mother listens gently to her teenage son at home',
    'Une mère écoute doucement son fils adolescent à la maison',
    'أم تصغي بلطف إلى ابنها المراهق في المنزل',
  ),
  // School heroes
  therapyFamily: photo(
    'therapy-family',
    1086,
    1448,
    'Three people work through a worksheet together at a table',
    'Trois personnes remplissent une fiche ensemble autour d’une table',
    'ثلاثة أشخاص يعملون معًا على ورقة تمرين حول طاولة',
  ),
  languagesClass: photo(
    'languages-class',
    1122,
    1402,
    'Adult learners practise speaking in pairs during a language class',
    'Des adultes s’exercent à parler en binôme pendant un cours de langue',
    'متعلمون بالغون يتدربون على التحدث في أزواج خلال درس لغة',
  ),
  trainingWorkshop: photo(
    'training-workshop',
    1122,
    1402,
    'A facilitator coaches a small group during a professional skills workshop',
    'Une animatrice accompagne un petit groupe lors d’un atelier de compétences',
    'ميسّرة تدرّب مجموعة صغيرة خلال ورشة مهارات مهنية',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** One distinct photo per default programme card, per school, in order. */
export const programmePhotos: Record<
  'psychology' | 'languages' | 'training',
  PeoplePhoto[]
> = {
  psychology: [
    photo(
      'therapy-online',
      1600,
      900,
      'A psychologist holds an online consultation from a calm office',
      'Une psychologue mène une consultation en ligne depuis un bureau serein',
      'أخصائية نفسية تجري استشارة عبر الإنترنت من مكتب هادئ',
    ),
    photo(
      'therapy-child-play',
      1536,
      1024,
      'A psychologist plays and draws with a young child while a parent watches',
      'Une psychologue joue et dessine avec un enfant sous le regard d’un parent',
      'أخصائية نفسية تلعب وترسم مع طفل صغير بينما يراقب أحد الوالدين',
    ),
    photo(
      'therapy-art',
      1122,
      1402,
      'An art therapy session with watercolours and a psychologist taking notes',
      'Une séance d’art-thérapie à l’aquarelle avec une psychologue qui prend des notes',
      'جلسة علاج بالفن بالألوان المائية مع أخصائية نفسية تدوّن ملاحظاتها',
    ),
    photo(
      'therapy-group',
      1600,
      900,
      'A supportive group session led by a psychologist',
      'Une séance de groupe bienveillante animée par une psychologue',
      'جلسة دعم جماعية تديرها أخصائية نفسية',
    ),
  ],
  languages: [
    photo(
      'languages-speaking-club',
      1600,
      900,
      'Learners discuss around a table at a language speaking club',
      'Des apprenants échangent autour d’une table lors d’un club de conversation',
      'متعلمون يتحاورون حول طاولة في نادي محادثة',
    ),
    photo(
      'academy-notes',
      1536,
      1024,
      'Two adults discuss an exercise using an illustrated card',
      'Deux adultes discutent d’un exercice à partir d’une carte illustrée',
      'شخصان بالغان يناقشان تمرينًا باستخدام بطاقة مصوّرة',
    ),
    photo(
      'live-learning-together',
      1536,
      1024,
      'Two learners discuss their notes across a table',
      'Deux apprenants échangent autour de leurs notes à une table',
      'متعلّمان يتحاوران حول ملاحظاتهما على طاولة',
    ),
    photo(
      'live-confident-speaker',
      1122,
      1402,
      'A young woman speaks confidently to a small group',
      'Une jeune femme s’exprime avec assurance devant un petit groupe',
      'شابة تتحدث بثقة أمام مجموعة صغيرة',
    ),
  ],
  training: [
    photo(
      'live-leader-coaching',
      1536,
      1024,
      'A facilitator guides a small group exercise beside a whiteboard',
      'Une animatrice guide un exercice en petit groupe près d’un tableau',
      'ميسّرة تدير تمرينًا لمجموعة صغيرة قرب السبورة',
    ),
    photo(
      'training-coaching',
      1536,
      1024,
      'Two people talk face to face while others sit in the background',
      'Deux personnes échangent face à face, tandis que d’autres sont assises à l’arrière-plan',
      'شخصان يتحاوران وجهًا لوجه بينما يجلس آخرون في الخلفية',
    ),
    photo(
      'academy-online-course',
      1536,
      1024,
      'Two learners review a lesson on a laptop together',
      'Deux apprenants étudient une leçon ensemble sur un ordinateur portable',
      'متعلّمان يراجعان درسًا معًا على حاسوب محمول',
    ),
    photo(
      'live-team-win',
      1536,
      1024,
      'A team works together around a table covered with notes and worksheets',
      'Une équipe travaille autour d’une table couverte de notes et de fiches',
      'فريق يعمل معًا حول طاولة عليها ملاحظات وأوراق عمل',
    ),
  ],
};

/** Contact "Explore before you enquire": one living photo per school. */
export const pathPhotos: Record<
  'psychology' | 'languages' | 'training',
  PeoplePhoto
> = {
  psychology: photo(
    'path-psychology',
    1600,
    900,
    'A psychologist and a client talk calmly in a bright consultation room',
    'Une psychologue et un client échangent calmement dans un cabinet lumineux',
    'أخصائية نفسية وعميل يتحدثان بهدوء في غرفة استشارة مضيئة',
  ),
  languages: photo(
    'path-languages',
    1600,
    900,
    'Two learners laugh while practising a language on a video call',
    'Deux apprenants rient en pratiquant une langue lors d’un appel vidéo',
    'متعلمان يضحكان أثناء التدرّب على لغة في مكالمة فيديو',
  ),
  training: photo(
    'path-training',
    1600,
    900,
    'Professionals plan a project together around a meeting table',
    'Des professionnels planifient un projet autour d’une table de réunion',
    'مهنيون يخططون لمشروع معًا حول طاولة اجتماع',
  ),
};

/** Consultations page. */
export const consultationPhotos = {
  welcome: photo(
    'first-consultation-welcome',
    2400,
    1000,
    'Two women talk in armchairs in a consultation room',
    'Deux femmes discutent dans des fauteuils dans un cabinet de consultation',
    'امرأتان تتحاوران على مقعدين في غرفة استشارة',
  ),
  firstMeeting: photo(
    'cons-first-meeting',
    1448,
    1086,
    'A psychologist listens to a client in a consultation room',
    'Une psychologue écoute un client dans un cabinet de consultation',
    'أخصائية نفسية تصغي إلى عميل في غرفة الاستشارة',
  ),
  online: photo(
    'cons-online',
    1600,
    900,
    'A woman follows an online consultation from home with headphones',
    'Une femme suit une consultation en ligne depuis chez elle, casque sur les oreilles',
    'امرأة تتابع استشارة عبر الإنترنت من منزلها مرتدية سماعات',
  ),
  family: photo(
    'cons-family',
    1586,
    992,
    'A couple speaks with a counsellor in a consultation room',
    'Un couple échange avec une conseillère dans un cabinet de consultation',
    'زوجان يتحاوران مع مرشدة في غرفة الاستشارة',
  ),
  learning: photo(
    'cons-learning',
    1586,
    992,
    'A small group sits together for a guided discussion',
    'Un petit groupe se réunit pour une discussion guidée',
    'مجموعة صغيرة تجتمع في نقاش يديره ميسّر',
  ),
  journal: photo(
    'cons-journal',
    1600,
    900,
    'A young woman writes in her journal by a sunny window',
    'Une jeune femme écrit dans son carnet près d’une fenêtre ensoleillée',
    'شابة تكتب في دفتر يومياتها قرب نافذة مشمسة',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** About page gallery. */
export const aboutPhotos = {
  event: photo(
    'about-event',
    1600,
    900,
    'An audience listens to a speaker at a Luminol workshop',
    'Un public écoute un intervenant lors d’un atelier Luminol',
    'جمهور يستمع إلى متحدث في ورشة للومينول',
  ),
  graduate: photo(
    'about-graduate',
    1600,
    900,
    'A learner receives her certificate with a smile',
    'Une apprenante reçoit son certificat avec le sourire',
    'متعلمة تتسلّم شهادتها بابتسامة',
  ),
  online: photo(
    'about-online',
    2022,
    778,
    'A learner takes notes beside an open laptop at a desk',
    'Une apprenante prend des notes à côté d’un ordinateur portable ouvert',
    'متعلّمة تدوّن ملاحظات بجانب حاسوب محمول مفتوح',
  ),
  family: photo(
    'about-family',
    1600,
    900,
    'A psychologist and a child draw together at a small table',
    'Une psychologue et un enfant dessinent ensemble à une petite table',
    'أخصائية نفسية وطفل يرسمان معًا على طاولة صغيرة',
  ),
  listening: photo(
    'about-listening',
    1600,
    900,
    'A woman listens thoughtfully during an evening video call',
    'Une femme écoute attentivement lors d’un appel vidéo en soirée',
    'امرأة تصغي باهتمام خلال مكالمة فيديو مسائية',
  ),
  audience: photo(
    'about-audience',
    1600,
    900,
    'Participants follow a talk in a warm auditorium',
    'Des participants suivent une conférence dans un auditorium chaleureux',
    'مشاركون يتابعون محاضرة في قاعة دافئة',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** Distinct moments: one per page section, no repeats. */
export const momentPhotos = {
  artTherapyHands: photo(
    'art-therapy-hands',
    1600,
    900,
    'A child and an adult paint together with watercolours',
    'Un enfant et un adulte peignent ensemble à l’aquarelle',
    'طفل وشخص بالغ يرسمان معًا بالألوان المائية',
  ),
  fatherTeenWalk: photo(
    'father-teen-walk',
    1536,
    1024,
    'A father and his teenage daughter talk while walking in an Algiers street',
    'Un père et sa fille adolescente discutent en marchant dans une rue d’Alger',
    'أب وابنته المراهقة يتحدثان أثناء السير في شارع بالجزائر العاصمة',
  ),
  mediterraneanCalm: photo(
    'mediterranean-calm',
    1600,
    800,
    'A woman walks calmly along the Mediterranean shore at sunrise',
    'Une femme marche sereinement au bord de la Méditerranée au lever du soleil',
    'امرأة تمشي بهدوء على شاطئ المتوسط عند شروق الشمس',
  ),
  onlineCourseFlatlay: photo(
    'online-course-flatlay',
    1536,
    1024,
    'A desk at night with a video lesson, handwritten notes and mint tea',
    'Un bureau le soir avec une leçon vidéo, des notes manuscrites et un thé à la menthe',
    'مكتب ليلًا عليه درس مرئي وملاحظات مكتوبة بخط اليد وشاي بالنعناع',
  ),
  psychologyBooksMacro: photo(
    'psychology-books-macro',
    1600,
    900,
    'Fingers running along the spines of old psychology books',
    'Des doigts effleurent le dos de vieux livres de psychologie',
    'أصابع تمرّ على كعوب كتب علم نفس قديمة',
  ),
  publicSpeakingStage: photo(
    'public-speaking-stage',
    1600,
    900,
    'A young man speaks confidently on a small stage under a spotlight',
    'Un jeune homme s’exprime avec assurance sur une petite scène sous un projecteur',
    'شاب يتحدث بثقة على منصة صغيرة تحت ضوء كاشف',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** "Our approach" steps 1–4 and the ACT programme page. */
export const approachPhotos = {
  share: photo(
    'approach-01-share-goal',
    1600,
    900,
    'Hands typing a message on a phone beside a glass of mint tea',
    'Des mains écrivent un message sur un téléphone à côté d’un thé à la menthe',
    'يدان تكتبان رسالة على الهاتف بجانب كأس شاي بالنعناع',
  ),
  listen: photo(
    'approach-02-team-listens',
    1672,
    941,
    'A woman takes notes while speaking on the phone at a desk',
    'Une femme prend des notes au bureau pendant un appel',
    'امرأة تدوّن ملاحظات على مكتب أثناء مكالمة هاتفية',
  ),
  pathway: photo(
    'approach-03-clear-path',
    1536,
    1024,
    'Two people discuss a set of printed options across a table',
    'Deux personnes discutent d’options présentées sur des fiches',
    'شخصان يناقشان خيارات مطبوعة على أوراق أمامهما',
  ),
  practice: photo(
    'approach-04-practical-learning',
    1600,
    900,
    'Adults practise a role-play exercise in pairs during a training session',
    'Des adultes s’exercent en binôme à un jeu de rôle pendant une formation',
    'بالغون يتدربون على تمرين لعب أدوار في أزواج خلال جلسة تدريبية',
  ),
} as const satisfies Record<string, PeoplePhoto>;

export const actPhotos = {
  cover: photo(
    'act-cover',
    1672,
    941,
    'Participants discuss cards spread across a workshop table',
    'Des participants discutent de cartes disposées sur une table d’atelier',
    'مشاركون يناقشون بطاقات موزّعة على طاولة في ورشة عمل',
  ),
  values: photo(
    'act-values',
    1672,
    941,
    'A person draws a compass in an open notebook',
    'Une personne dessine une boussole dans un carnet ouvert',
    'شخص يرسم بوصلة في دفتر مفتوح',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** Events, blog and school audience photos. */
export const extraPhotos = {
  languageOnline: photo(
    'language-online-lesson',
    1600,
    900,
    'A learner follows an online language lesson with a notebook of words',
    'Une apprenante suit un cours de langue en ligne avec un carnet de vocabulaire',
    'متعلمة تتابع درس لغة عبر الإنترنت مع دفتر مفردات',
  ),
  professionalTraining: photo(
    'professional-training',
    1600,
    900,
    'A trainer presents a simple diagram on a flipchart to an engaged team',
    'Une formatrice présente un schéma sur un tableau à une équipe attentive',
    'مدرّبة تعرض مخططًا بسيطًا على لوح ورقي أمام فريق منتبه',
  ),
  anxiety: photo(
    'anxiety-article',
    1672,
    941,
    'A man looks out over the city through an open window',
    'Un homme regarde la ville par une fenêtre ouverte',
    'رجل ينظر إلى المدينة من نافذة مفتوحة',
  ),
  parenting: photo(
    'parenting-article',
    1672,
    941,
    'A father and his teenage son prepare food side by side',
    'Un père et son fils adolescent préparent à manger côte à côte',
    'أب وابنه المراهق يحضّران الطعام جنبًا إلى جنب',
  ),
  certificates: photo(
    'certificates-flatlay',
    1600,
    900,
    'A certificate with a gold seal and a fountain pen on a wooden desk',
    'Un certificat au sceau doré et un stylo plume sur un bureau en bois',
    'شهادة بختم ذهبي وقلم حبر على مكتب خشبي',
  ),
  programSearch: photo(
    'program-search-table',
    1600,
    900,
    'Seen from above, learners plan their studies around a wooden table with notebooks and a laptop',
    'Vue du dessus, des apprenants planifient leurs études autour d’une table en bois avec carnets et ordinateur',
    'من الأعلى: متعلمون يخططون لدراستهم حول طاولة خشبية مع دفاتر وحاسوب',
  ),
  languagesCafe: photo(
    'languages-cafe-motion',
    1122,
    1402,
    'Two learners practise a conversation using a picture card',
    'Deux apprenants s’exercent à la conversation avec une carte illustrée',
    'متعلّمان يتدرّبان على المحادثة باستخدام بطاقة مصوّرة',
  ),
  childHands: photo(
    'child-anxiety-hands',
    1600,
    900,
    'A small child’s hand holds an adult’s finger — a first gesture of trust',
    'La petite main d’un enfant serre le doigt d’un adulte — un premier geste de confiance',
    'يد طفل صغيرة تمسك بإصبع شخص بالغ — أول إشارة ثقة',
  ),
  sleepNight: photo(
    'sleep-night',
    1672,
    941,
    'A lamp lights a book and a phone on a bedside table',
    'Une lampe éclaire un livre et un téléphone sur une table de chevet',
    'مصباح يضيء كتابًا وهاتفًا على طاولة بجوار السرير',
  ),
  aboutCommunity: photo(
    'about-community',
    1536,
    1024,
    'Learners of every age gather in the academy courtyard with their certificates, laughing together under the olive trees',
    'Des apprenants de tous âges réunis dans la cour de l’académie avec leurs certificats, riant ensemble sous les oliviers',
    'متعلّمون من مختلف الأعمار يجتمعون في فناء الأكاديمية بشهاداتهم ويضحكون معًا تحت أشجار الزيتون',
  ),
  homeDiscoverProgrammes: photo(
    'home-discover-programmes',
    1122,
    1402,
    'A group works with notebooks and a laptop around a table',
    'Un groupe travaille avec des carnets et un ordinateur autour d’une table',
    'مجموعة تعمل حول طاولة باستخدام دفاتر وحاسوب محمول',
  ),
  hubPsychology: photo(
    'hub-psychology',
    1024,
    1536,
    'A facilitator speaks with a small group seated around a table',
    'Une animatrice échange avec un petit groupe assis autour d’une table',
    'ميسّرة تتحاور مع مجموعة صغيرة تجلس حول طاولة',
  ),
  hubLanguages: photo(
    'hub-languages',
    1024,
    1536,
    'An instructor helps learners with their work at a classroom table',
    'Un formateur aide des apprenants à travailler autour d’une table en classe',
    'مدرّب يساعد المتعلّمين في تمارينهم حول طاولة في الصف',
  ),
  hubTraining: photo(
    'hub-training',
    1024,
    1536,
    'A trainer speaks to a small group at a meeting table',
    'Un formateur s’adresse à un petit groupe autour d’une table de réunion',
    'مدرّب يتحدث إلى مجموعة صغيرة حول طاولة اجتماعات',
  ),
  certificateSeal: photo(
    'certificate-seal',
    1672,
    941,
    'An open certificate folder lies on a wooden desk by a window',
    'Un porte-certificat ouvert est posé sur un bureau en bois près d’une fenêtre',
    'ملف شهادة مفتوح على مكتب خشبي قرب نافذة',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** Home "Our schools": one living photo per school. */
export const homeSchoolPhotos: Record<
  'psychology' | 'languages' | 'training',
  PeoplePhoto
> = {
  psychology: photo(
    'therapy-cbt-worksheet',
    1122,
    1402,
    'A small group sits in a circle and listens to a facilitator',
    'Un petit groupe assis en cercle écoute un animateur',
    'مجموعة صغيرة تجلس في حلقة وتصغي إلى الميسّر',
  ),
  languages: extraPhotos.languagesCafe,
  training: extraPhotos.homeDiscoverProgrammes,
};
