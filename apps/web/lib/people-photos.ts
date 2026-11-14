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
    1600,
    900,
    'A psychology instructor explains a diagram to engaged adult students',
    'Une formatrice en psychologie explique un schéma à des adultes attentifs',
    'مدرّبة في علم النفس تشرح مخططًا لطلاب بالغين منتبهين',
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
    1536,
    1024,
    'Three generations of a family laugh together around tea',
    'Trois générations d’une famille rient ensemble autour d’un thé',
    'ثلاثة أجيال من عائلة واحدة يضحكون معًا حول الشاي',
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

/** Home "Our schools": one living photo per school. */
export const homeSchoolPhotos: Record<
  'psychology' | 'languages' | 'training',
  PeoplePhoto
> = {
  psychology: photo(
    'therapy-cbt-worksheet',
    1448,
    1086,
    'A psychologist and a client fill in a thought worksheet together over tea',
    'Une psychologue et une cliente remplissent ensemble une fiche de pensées autour d’un thé',
    'أخصائية نفسية وعميلة تملآن معًا ورقة تمرين الأفكار حول الشاي',
  ),
  languages: photo(
    'live-conversation-cafe',
    1600,
    900,
    'Young adults practise conversation together in a cosy café',
    'De jeunes adultes pratiquent la conversation dans un café chaleureux',
    'شباب يتدربون على المحادثة معًا في مقهى دافئ',
  ),
  training: photo(
    'academy-certificate',
    1536,
    1024,
    'A graduate receives her certificate while classmates applaud',
    'Une diplômée reçoit son certificat sous les applaudissements',
    'متخرجة تتسلّم شهادتها وسط تصفيق زملائها',
  ),
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
  firstMeeting: photo(
    'cons-first-meeting',
    1600,
    900,
    'A psychologist welcomes a client to a relaxed first meeting over tea',
    'Une psychologue accueille un client pour un premier rendez-vous détendu autour d’un thé',
    'أخصائية نفسية تستقبل عميلًا في لقاء أول هادئ حول الشاي',
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
    1600,
    900,
    'A mother and her young son draw together in a play therapy room',
    'Une mère et son jeune fils dessinent ensemble dans une salle de thérapie par le jeu',
    'أم وابنها الصغير يرسمان معًا في غرفة العلاج باللعب',
  ),
  learning: photo(
    'cons-learning',
    1600,
    900,
    'A facilitator guides a small group working with sticky notes',
    'Une animatrice guide un petit groupe qui travaille avec des notes adhésives',
    'ميسّرة توجّه مجموعة صغيرة تعمل بالملاحظات اللاصقة',
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
    1600,
    900,
    'A learner joins an online language club from a café',
    'Une apprenante participe à un club de langue en ligne depuis un café',
    'متعلمة تشارك في نادي لغة عبر الإنترنت من مقهى',
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
