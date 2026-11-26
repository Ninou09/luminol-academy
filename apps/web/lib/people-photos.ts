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

export const editorialPhotos = {
  afterClass: photo(
    'moments-after-class',
    1672,
    941,
    'Two learners discuss a diagram after class',
    'Deux participants discutent d’un schéma après le cours',
    'متعلّمان يناقشان مخططًا بعد الدرس',
  ),
  seminar: photo(
    'moments-seminar',
    1672,
    941,
    'A trainer listens to a participant across a seminar table',
    'Une formatrice écoute une participante autour d’une table de séminaire',
    'مدرّبة تصغي إلى مشاركة حول طاولة التدريب',
  ),
  homework: photo(
    'events-homework',
    1536,
    1024,
    'Adults arrange illustrated cards to plan homework',
    'Des adultes disposent des cartes illustrées pour organiser les devoirs',
    'بالغون يرتّبون بطاقات مصوّرة لتخطيط الواجبات',
  ),
  clinical: photo(
    'library-clinical-wide',
    2172,
    724,
    'Two adults discuss a hand-drawn diagram beside a classroom whiteboard',
    'Deux adultes échangent devant un schéma dessiné au tableau',
    'شخصان بالغان يناقشان مخططًا مرسومًا على السبورة',
  ),
  family: photo(
    'library-family-wide',
    2172,
    724,
    'Adults work together with illustrated activity cards at a table',
    'Des adultes travaillent ensemble avec des cartes d’activités illustrées',
    'أشخاص بالغون يعملون معًا باستخدام بطاقات أنشطة مصوّرة على طاولة',
  ),
  languageClass: photo(
    'languages-speaking-class',
    1448,
    1086,
    'Two adult learners practise conversation using a picture card',
    'Deux adultes s’exercent à la conversation à partir d’une carte illustrée',
    'متعلّمان بالغان يتدرّبان على المحادثة باستخدام بطاقة مصوّرة',
  ),
  teamWorkshop: photo(
    'professional-team-workshop',
    1448,
    1086,
    'Three adults plan a project with coloured notes on a table',
    'Trois adultes préparent un projet à l’aide de notes colorées',
    'ثلاثة أشخاص بالغين يخطّطون لمشروع باستخدام ملاحظات ملوّنة على طاولة',
  ),
  workshopRoom: photo(
    'events-workshop-room',
    1774,
    887,
    'Adults settle into a sunlit room before a workshop',
    'Des adultes s’installent dans une salle lumineuse avant un atelier',
    'أشخاص بالغون يستقرّون في قاعة مضيئة قبل بدء ورشة',
  ),
  workday: photo(
    'about-academy-workday',
    1672,
    941,
    'Two adults arrange papers and chairs before a class',
    'Deux adultes préparent des documents et des chaises avant un cours',
    'شخصان بالغان يجهّزان الأوراق والكراسي قبل بدء الدرس',
  ),
  library: photo(
    'library-hero',
    1586,
    992,
    'A psychologist studies a learning diagram at a library table',
    'Une psychologue étudie un schéma dans une bibliothèque',
    'أخصائية نفسية تتأمل مخططًا تعليميًا في المكتبة',
  ),
  reception: photo(
    'contact-reception',
    1536,
    1024,
    'A receptionist listens to a visitor across a desk',
    'Une chargée d’accueil écoute un visiteur à son bureau',
    'موظفة استقبال تصغي إلى زائر عبر المكتب',
  ),
} as const;

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
    'live-community-blida',
    1536,
    1024,
    'A teacher explains a diagram to a class beside the Luminol Academy sign',
    'Un formateur explique un schéma à un groupe près de l’enseigne de Luminol Academy',
    'مدرّب يشرح مخططًا لمجموعة قرب لافتة أكاديمية لومينول',
  ),
  academyRoleplay: photo(
    'academy-roleplay-blida',
    1536,
    1024,
    'Two participants practise active listening while a trainer observes',
    'Deux participants pratiquent l’écoute active sous le regard d’une formatrice',
    'مشاركان يتدرّبان على الإصغاء النشط بإشراف مدرّبة',
  ),
  liveGenerations: photo(
    'live-generations',
    1536,
    1024,
    'Three generations of a family laugh together around tea',
    'Trois générations d’une famille rient ensemble autour d’un thé',
    'ثلاثة أجيال من عائلة واحدة يضحكون معًا حول الشاي',
  ),
  // Consultations
  therapySession: photo(
    'therapy-session-blida',
    1448,
    1086,
    'A man gestures as he speaks to a psychologist seated across from him',
    'Un homme fait un geste en parlant à une psychologue assise en face de lui',
    'رجل يشير بيديه وهو يتحدث إلى أخصائية نفسية تجلس قبالته',
  ),
  academySupervision: photo(
    'academy-supervision-blida',
    1448,
    1086,
    'Three colleagues review a diagram during a peer supervision session',
    'Trois collègues examinent un schéma pendant une séance de supervision',
    'ثلاثة زملاء يراجعون مخططًا في جلسة إشراف بين الأقران',
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
    1536,
    1024,
    'A psychologist sketches a family map while parents and a teenager talk',
    'Une psychologue dessine une carte familiale pendant que parents et adolescent échangent',
    'أخصائية نفسية ترسم خريطة الأسرة بينما يتحدث الوالدان والمراهق',
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
      1122,
      1402,
      'A learner fills her notebook with colourful study notes',
      'Une apprenante remplit son carnet de notes colorées',
      'متعلمة تملأ دفترها بملاحظات دراسية ملوّنة',
    ),
    photo(
      'live-learning-together',
      1122,
      1402,
      'A mentor and a student smile over shared notes',
      'Une mentore et une étudiante sourient en partageant leurs notes',
      'مرشدة وطالبة تبتسمان فوق ملاحظات مشتركة',
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
      1122,
      1402,
      'An experienced coach mentors a young professional over coffee',
      'Un coach expérimenté accompagne une jeune professionnelle autour d’un café',
      'مدرب خبير يوجّه شابة مهنية أثناء احتساء القهوة',
    ),
    photo(
      'training-coaching',
      1536,
      1024,
      'A one-to-one coaching session with a goal ladder in a notebook',
      'Une séance de coaching individuelle avec une échelle d’objectifs dans un carnet',
      'جلسة تدريب فردية مع سلّم أهداف في دفتر',
    ),
    photo(
      'academy-online-course',
      1600,
      900,
      'A learner follows an online course and takes notes at home',
      'Une apprenante suit un cours en ligne et prend des notes chez elle',
      'متعلمة تتابع دورة عبر الإنترنت وتدوّن ملاحظاتها في المنزل',
    ),
    photo(
      'live-team-win',
      1600,
      900,
      'A team celebrates a successful idea in a bright office',
      'Une équipe célèbre une idée réussie dans un bureau lumineux',
      'فريق يحتفل بفكرة ناجحة في مكتب مضيء',
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
    'first-consultation-welcome-blida',
    1774,
    887,
    'A woman holds the door open and welcomes a visitor to the consultation room',
    'Une femme tient la porte ouverte et accueille une visiteuse dans le cabinet',
    'امرأة تفتح الباب وترحّب بزائرة في غرفة الاستشارة',
  ),
  firstMeeting: photo(
    'cons-first-meeting-blida',
    1448,
    1086,
    'A psychologist listens to a client beneath the Luminol Academy sign',
    'Une psychologue écoute un client sous l’enseigne de Luminol Academy',
    'أخصائية نفسية تصغي إلى مراجع تحت لافتة أكاديمية لومينول',
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
    'cons-family-blida',
    1448,
    1086,
    'A couple speaks with a counsellor in a consultation room',
    'Un couple échange avec une conseillère dans un cabinet',
    'زوجان يتحاوران مع مستشارة في غرفة استشارة',
  ),
  learning: photo(
    'cons-learning-blida',
    1448,
    1086,
    'A teenager chooses an illustrated card during a family consultation',
    'Un adolescent choisit une carte illustrée pendant une consultation familiale',
    'مراهق يختار بطاقة مصوّرة خلال استشارة أسرية',
  ),
  journal: photo(
    'cons-journal-blida',
    1448,
    1086,
    'A woman checks her phone and takes notes at a desk by a window',
    'Une femme consulte son téléphone et prend des notes près d’une fenêtre',
    'امرأة تنظر في هاتفها وتدوّن ملاحظات قرب نافذة',
  ),
} as const satisfies Record<string, PeoplePhoto>;

/** About page gallery. */
export const aboutPhotos = {
  event: photo(
    'about-event-blida',
    1448,
    1086,
    'A participant asks a question during a workshop in Blida',
    'Une participante pose une question pendant un atelier à Blida',
    'مشاركة تطرح سؤالًا خلال ورشة في البليدة',
  ),
  graduate: photo(
    'about-graduate-blida',
    1672,
    941,
    'A participant receives a Luminol Academy certificate of participation as the audience applauds',
    'Une participante reçoit une attestation de participation de Luminol Academy sous les applaudissements',
    'مشاركة تتسلّم شهادة مشاركة من أكاديمية لومينول فيما يصفّق الحضور',
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
    'about-audience-blida',
    1536,
    1024,
    'Learners pass a worksheet around a shared table',
    'Des apprenants se passent une fiche de travail autour d’une table',
    'متعلّمون يتبادلون ورقة عمل حول طاولة مشتركة',
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
  progress: photo(
    'approach-certificate-photo',
    1672,
    941,
    'A participant holds a Luminol Academy certificate of participation toward the camera',
    'Une participante présente une attestation de participation de Luminol Academy face à l’objectif',
    'مشاركة تعرض شهادة مشاركة من أكاديمية لومينول أمام الكاميرا',
  ),
  share: photo(
    'approach-01-share-goal-blida',
    1448,
    1086,
    'A woman starts a message on her phone at a kitchen table',
    'Une femme commence à écrire un message sur son téléphone à la table de la cuisine',
    'امرأة تبدأ كتابة رسالة على هاتفها عند طاولة المطبخ',
  ),
  listen: photo(
    'approach-02-team-listens-blida',
    1448,
    1086,
    'A receptionist takes notes with a visitor beneath the Luminol Academy sign',
    'Une réceptionniste prend des notes avec une visiteuse sous l’enseigne de Luminol Academy',
    'موظفة استقبال تدوّن ملاحظات مع زائرة تحت لافتة أكاديمية لومينول',
  ),
  pathway: photo(
    'approach-03-clear-path-blida',
    1448,
    1086,
    'Two people compare illustrated programme options at a table',
    'Deux personnes comparent des options de programme illustrées autour d’une table',
    'شخصان يقارنان خيارات برامج معروضة على بطاقات فوق طاولة',
  ),
  practice: photo(
    'approach-04-practical-learning-blida',
    1448,
    1086,
    'Three people discuss a sequence of illustrated cards on a corkboard',
    'Trois personnes discutent d’une série de cartes illustrées sur un tableau en liège',
    'ثلاثة أشخاص يناقشون سلسلة بطاقات مصوّرة على لوحة فلّين',
  ),
} as const satisfies Record<string, PeoplePhoto>;

export const actPhotos = {
  cover: photo(
    'act-cover',
    1600,
    900,
    'A small group practises a mindfulness exercise with eyes closed in a bright room',
    'Un petit groupe pratique un exercice de pleine conscience, les yeux fermés, dans une salle lumineuse',
    'مجموعة صغيرة تمارس تمرين يقظة ذهنية مغمضة العينين في قاعة مضيئة',
  ),
  values: photo(
    'act-values',
    1600,
    900,
    'A woman rests her hand on a notebook with a hand-drawn compass',
    'Une femme pose la main sur un carnet où est dessinée une boussole',
    'امرأة تضع يدها على دفتر رُسمت فيه بوصلة',
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
    'about-community-blida',
    1536,
    1024,
    'Three learners review a cardboard prototype beside sketches on a whiteboard',
    'Trois apprenants examinent un prototype en carton près de croquis au tableau',
    'ثلاثة متعلّمين يراجعون نموذجًا من الورق المقوّى بجوار رسوم على السبورة',
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
