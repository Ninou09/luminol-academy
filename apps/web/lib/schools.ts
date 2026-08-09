import type { Locale } from '@luminol/localization';

export type SchoolSlug = 'psychology' | 'languages' | 'training';

export type SchoolDefinition = {
  slug: SchoolSlug;
  number: string;
  name: string;
  eyebrow: string;
  headline: string;
  introduction: string;
  promise: string;
  visualWords: readonly string[];
  programs: readonly { title: string; description: string }[];
  approach: readonly { title: string; description: string }[];
  audiences: readonly string[];
  note: string;
};

const englishSchools: Record<SchoolSlug, SchoolDefinition> = {
  psychology: {
    slug: 'psychology',
    number: '01',
    name: 'Psychology',
    eyebrow: 'Wellbeing · Awareness · Personal development',
    headline: 'Understand what you feel. Build what helps you thrive.',
    introduction:
      'Luminol Psychology creates a thoughtful space for emotional awareness, supportive guidance and meaningful personal development across different stages of life.',
    promise:
      'Scientific thinking, human warmth and practical tools—brought together with care.',
    visualWords: ['Awareness', 'Balance', 'Connection'],
    programs: [
      {
        title: 'Individual support',
        description:
          'Structured conversations and practical guidance for people navigating stress, change, confidence and emotional growth.',
      },
      {
        title: 'Child and family guidance',
        description:
          'Educational support that helps parents and families better understand development, communication and everyday challenges.',
      },
      {
        title: 'Coaching programs',
        description:
          'Goal-oriented development for habits, self-awareness, relationships and the next meaningful chapter.',
      },
      {
        title: 'Workshops',
        description:
          'Accessible group learning around emotional intelligence, stress management, parenting and self-development.',
      },
    ],
    approach: [
      {
        title: 'Listen deeply',
        description:
          'Begin with the person, their context and what meaningful progress looks like for them.',
      },
      {
        title: 'Create clarity',
        description:
          'Turn complex experiences into understandable patterns, language and practical direction.',
      },
      {
        title: 'Build forward',
        description:
          'Translate insight into supportive actions that can be practiced in everyday life.',
      },
    ],
    audiences: ['Individuals', 'Parents and families', 'Young people', 'Teams'],
    note: 'Luminol Psychology programs are educational and supportive. They do not replace emergency, psychiatric or medical care. Appropriate professional referral should always be used when a person needs a different level of support.',
  },
  languages: {
    slug: 'languages',
    number: '02',
    name: 'Languages',
    eyebrow: 'Language · Culture · Confident communication',
    headline: 'Find your voice. Use it with confidence.',
    introduction:
      'Luminol Languages turns language knowledge into real communication through structured learning, thoughtful practice and meaningful cultural connection.',
    promise:
      'Clear pathways from foundations to fluency, designed around how people actually communicate.',
    visualWords: ['Learn', 'Express', 'Connect'],
    programs: [
      {
        title: 'English programs',
        description:
          'Progressive learning for foundations, academic goals, confident conversation and professional communication.',
      },
      {
        title: 'French programs',
        description:
          'Structured language development that balances grammar, comprehension, pronunciation and expression.',
      },
      {
        title: 'Fluency pathways',
        description:
          'Focused practice for learners ready to move from knowing the language to using it naturally.',
      },
      {
        title: 'Communication skills',
        description:
          'Practical speaking, presentation and workplace communication for real personal and professional situations.',
      },
    ],
    approach: [
      {
        title: 'Know your level',
        description:
          'Start from a clear understanding of current ability, goals and the situations where the language matters.',
      },
      {
        title: 'Practice meaningfully',
        description:
          'Learn through useful language, guided feedback and communication—not memorization alone.',
      },
      {
        title: 'Use your voice',
        description:
          'Build the confidence and flexibility to communicate beyond the classroom.',
      },
    ],
    audiences: [
      'Young learners',
      'University students',
      'Professionals',
      'Organizations',
    ],
    note: 'Program levels, schedules and language options are confirmed during enrolment so every learner enters the most appropriate pathway.',
  },
  training: {
    slug: 'training',
    number: '03',
    name: 'Professional Training',
    eyebrow: 'Capability · Leadership · Career growth',
    headline: 'Develop the skills that move work forward.',
    introduction:
      'Luminol Professional Training helps individuals and organizations turn ambition into capability through practical, relevant and thoughtfully designed learning.',
    promise:
      'Professional development that respects your time and connects directly to how work gets done.',
    visualWords: ['Lead', 'Create', 'Advance'],
    programs: [
      {
        title: 'Leadership',
        description:
          'Develop self-awareness, sound decision-making and the communication needed to guide people well.',
      },
      {
        title: 'Professional communication',
        description:
          'Strengthen presentations, collaboration, feedback and confident communication across the workplace.',
      },
      {
        title: 'Productivity and digital skills',
        description:
          'Build practical systems and modern capabilities for focused, effective and adaptable work.',
      },
      {
        title: 'Corporate workshops',
        description:
          'Purpose-built learning experiences aligned with team needs, organizational context and desired outcomes.',
      },
    ],
    approach: [
      {
        title: 'Define the outcome',
        description:
          'Clarify the capability, behavior or workplace result the learning experience needs to support.',
      },
      {
        title: 'Learn by doing',
        description:
          'Use practical examples, active exercises and feedback that connect learning to real work.',
      },
      {
        title: 'Apply with confidence',
        description:
          'Leave with useful tools, clearer decisions and an actionable way forward.',
      },
    ],
    audiences: [
      'Early-career professionals',
      'Managers',
      'Teams',
      'Organizations',
    ],
    note: 'Corporate programs can be adapted to the audience, format and business objective after a focused needs conversation.',
  },
};

const frenchSchools: Record<SchoolSlug, SchoolDefinition> = {
  psychology: {
    slug: 'psychology',
    number: '01',
    name: 'Psychologie',
    eyebrow: 'Bien-être · Conscience de soi · Développement personnel',
    headline:
      'Comprenez ce que vous ressentez. Construisez ce qui vous aide à avancer.',
    introduction:
      'Luminol Psychologie crée un espace réfléchi pour développer la conscience émotionnelle, bénéficier d’un accompagnement bienveillant et progresser personnellement à différentes étapes de la vie.',
    promise:
      'Rigueur scientifique, chaleur humaine et outils pratiques réunis avec attention.',
    visualWords: ['Conscience', 'Équilibre', 'Lien'],
    programs: [
      {
        title: 'Accompagnement individuel',
        description:
          'Des échanges structurés et des outils pratiques pour traverser le stress, le changement, le manque de confiance et les étapes de croissance émotionnelle.',
      },
      {
        title: 'Accompagnement enfant et famille',
        description:
          'Un soutien éducatif pour aider les parents et les familles à mieux comprendre le développement, la communication et les difficultés du quotidien.',
      },
      {
        title: 'Programmes de coaching',
        description:
          'Un développement orienté objectifs autour des habitudes, de la connaissance de soi, des relations et des prochaines étapes importantes.',
      },
      {
        title: 'Ateliers',
        description:
          'Des apprentissages collectifs accessibles autour de l’intelligence émotionnelle, de la gestion du stress, de la parentalité et du développement personnel.',
      },
    ],
    approach: [
      {
        title: 'Écouter en profondeur',
        description:
          'Commencer par la personne, son contexte et ce qu’un progrès utile signifie réellement pour elle.',
      },
      {
        title: 'Créer de la clarté',
        description:
          'Transformer les expériences complexes en repères compréhensibles, en mots et en directions concrètes.',
      },
      {
        title: 'Construire la suite',
        description:
          'Traduire la compréhension en actions soutenantes qui peuvent être pratiquées au quotidien.',
      },
    ],
    audiences: ['Individus', 'Parents et familles', 'Jeunes', 'Équipes'],
    note: 'Les programmes de Luminol Psychologie sont éducatifs et soutenants. Ils ne remplacent pas les soins d’urgence, psychiatriques ou médicaux. Une orientation professionnelle adaptée doit toujours être utilisée lorsqu’une personne a besoin d’un autre niveau de prise en charge.',
  },
  languages: {
    slug: 'languages',
    number: '02',
    name: 'Langues',
    eyebrow: 'Langue · Culture · Communication confiante',
    headline: 'Trouvez votre voix. Utilisez-la avec confiance.',
    introduction:
      'Luminol Langues transforme les connaissances linguistiques en communication réelle grâce à un apprentissage structuré, une pratique réfléchie et une connexion culturelle vivante.',
    promise:
      'Des parcours clairs des bases jusqu’à l’aisance, conçus autour de la manière dont les gens communiquent réellement.',
    visualWords: ['Apprendre', 'S’exprimer', 'Connecter'],
    programs: [
      {
        title: 'Programmes d’anglais',
        description:
          'Un apprentissage progressif pour les bases, les objectifs académiques, la conversation et la communication professionnelle.',
      },
      {
        title: 'Programmes de français',
        description:
          'Un développement structuré qui équilibre grammaire, compréhension, prononciation et expression.',
      },
      {
        title: 'Parcours d’aisance',
        description:
          'Une pratique ciblée pour passer de la connaissance de la langue à son utilisation naturelle.',
      },
      {
        title: 'Compétences de communication',
        description:
          'Prise de parole, présentation et communication professionnelle pour des situations personnelles et professionnelles réelles.',
      },
    ],
    approach: [
      {
        title: 'Connaître votre niveau',
        description:
          'Partir d’une compréhension claire de votre niveau actuel, de vos objectifs et des situations où la langue compte.',
      },
      {
        title: 'Pratiquer avec sens',
        description:
          'Apprendre par une langue utile, du feedback guidé et de la communication, pas par la mémorisation seule.',
      },
      {
        title: 'Utiliser votre voix',
        description:
          'Développer la confiance et la flexibilité nécessaires pour communiquer au-delà de la salle de cours.',
      },
    ],
    audiences: [
      'Jeunes apprenants',
      'Étudiants universitaires',
      'Professionnels',
      'Organisations',
    ],
    note: 'Les niveaux, horaires et langues d’enseignement sont confirmés lors de l’inscription afin que chaque apprenant rejoigne le parcours le plus adapté.',
  },
  training: {
    slug: 'training',
    number: '03',
    name: 'Formation professionnelle',
    eyebrow: 'Compétences · Leadership · Évolution de carrière',
    headline: 'Développez les compétences qui font avancer le travail.',
    introduction:
      'Luminol Formation Professionnelle aide les individus et les organisations à transformer l’ambition en capacité grâce à des apprentissages pratiques, pertinents et soigneusement conçus.',
    promise:
      'Un développement professionnel qui respecte votre temps et se connecte directement à la réalité du travail.',
    visualWords: ['Diriger', 'Créer', 'Avancer'],
    programs: [
      {
        title: 'Leadership',
        description:
          'Développer la connaissance de soi, la prise de décision et la communication nécessaires pour bien guider les personnes.',
      },
      {
        title: 'Communication professionnelle',
        description:
          'Renforcer les présentations, la collaboration, le feedback et la communication confiante au travail.',
      },
      {
        title: 'Productivité et compétences numériques',
        description:
          'Construire des systèmes pratiques et des capacités modernes pour un travail concentré, efficace et adaptable.',
      },
      {
        title: 'Ateliers en entreprise',
        description:
          'Des expériences d’apprentissage conçues autour des besoins de l’équipe, du contexte de l’organisation et des résultats recherchés.',
      },
    ],
    approach: [
      {
        title: 'Définir le résultat',
        description:
          'Clarifier la capacité, le comportement ou le résultat professionnel que l’apprentissage doit soutenir.',
      },
      {
        title: 'Apprendre en faisant',
        description:
          'Utiliser des exemples pratiques, des exercices actifs et du feedback directement reliés au travail réel.',
      },
      {
        title: 'Appliquer avec confiance',
        description:
          'Repartir avec des outils utiles, des décisions plus claires et une manière concrète d’avancer.',
      },
    ],
    audiences: [
      'Professionnels en début de carrière',
      'Managers',
      'Équipes',
      'Organisations',
    ],
    note: 'Les programmes d’entreprise peuvent être adaptés au public, au format et à l’objectif professionnel après un échange ciblé sur les besoins.',
  },
};

const arabicSchools: Record<SchoolSlug, SchoolDefinition> = {
  psychology: {
    slug: 'psychology',
    number: '01',
    name: 'علم النفس',
    eyebrow: 'توازن نفسي · وعي · تطوير شخصي',
    headline: 'افهم ما تشعر به. وابنِ ما يساعدك على الازدهار.',
    introduction:
      'توفّر لومينول لعلم النفس مساحة مدروسة لتنمية الوعي العاطفي والحصول على توجيه داعم وتحقيق تطور شخصي ذي معنى عبر مراحل الحياة المختلفة.',
    promise: 'تفكير علمي ودفء إنساني وأدوات عملية، مجتمعة بعناية.',
    visualWords: ['وعي', 'توازن', 'تواصل'],
    programs: [
      {
        title: 'دعم فردي',
        description:
          'حوارات منظّمة وتوجيه عملي للأشخاص الذين يواجهون الضغط أو التغيير أو تحديات الثقة أو النمو العاطفي.',
      },
      {
        title: 'إرشاد الطفل والعائلة',
        description:
          'دعم تربوي يساعد الأولياء والعائلات على فهم التطور والتواصل والتحديات اليومية بصورة أفضل.',
      },
      {
        title: 'برامج الكوتشينغ',
        description:
          'تطوير موجّه نحو الأهداف للعادات والوعي بالذات والعلاقات والاستعداد للفصل القادم.',
      },
      {
        title: 'ورشات',
        description:
          'تعلّم جماعي متاح حول الذكاء العاطفي وإدارة الضغط والأبوة والأمومة وتطوير الذات.',
      },
    ],
    approach: [
      {
        title: 'الاستماع بعمق',
        description:
          'نبدأ من الشخص وسياقه وما يعنيه التقدّم الحقيقي بالنسبة إليه.',
      },
      {
        title: 'صناعة الوضوح',
        description:
          'نحوّل التجارب المعقدة إلى أنماط مفهومة ولغة واضحة واتجاه عملي.',
      },
      {
        title: 'البناء إلى الأمام',
        description:
          'نحوّل الفهم إلى خطوات داعمة يمكن ممارستها في الحياة اليومية.',
      },
    ],
    audiences: ['الأفراد', 'الأولياء والعائلات', 'الشباب', 'الفرق'],
    note: 'برامج لومينول في علم النفس تعليمية وداعمة ولا تعوّض الرعاية الاستعجالية أو النفسية الطبية أو العلاج الطبي. يجب استخدام الإحالة المهنية المناسبة عندما يحتاج الشخص إلى مستوى مختلف من الرعاية.',
  },
  languages: {
    slug: 'languages',
    number: '02',
    name: 'اللغات',
    eyebrow: 'لغة · ثقافة · تواصل واثق',
    headline: 'اعثر على صوتك. واستخدمه بثقة.',
    introduction:
      'تحوّل لومينول للغات المعرفة اللغوية إلى تواصل حقيقي من خلال تعلّم منظّم وممارسة هادفة واتصال ثقافي ذي معنى.',
    promise:
      'مسارات واضحة من الأساسيات إلى الطلاقة، مبنية حول الطريقة التي يتواصل بها الناس فعلًا.',
    visualWords: ['تعلّم', 'عبّر', 'تواصل'],
    programs: [
      {
        title: 'برامج الإنجليزية',
        description:
          'تعلّم تدريجي للأساسيات والأهداف الأكاديمية والمحادثة الواثقة والتواصل المهني.',
      },
      {
        title: 'برامج الفرنسية',
        description:
          'تطوير لغوي منظّم يوازن بين القواعد والفهم والنطق والتعبير.',
      },
      {
        title: 'مسارات الطلاقة',
        description:
          'ممارسة مركّزة للمتعلمين المستعدين للانتقال من معرفة اللغة إلى استخدامها بصورة طبيعية.',
      },
      {
        title: 'مهارات التواصل',
        description:
          'مهارات عملية في الحديث والعرض والتواصل المهني لمواقف شخصية وعملية حقيقية.',
      },
    ],
    approach: [
      {
        title: 'اعرف مستواك',
        description:
          'ابدأ بفهم واضح لقدرتك الحالية وأهدافك والمواقف التي تحتاج فيها اللغة.',
      },
      {
        title: 'تدرّب بهدف',
        description:
          'تعلّم من خلال لغة مفيدة وملاحظات موجّهة وتواصل حقيقي، لا بالحفظ وحده.',
      },
      {
        title: 'استخدم صوتك',
        description: 'ابنِ الثقة والمرونة للتواصل خارج قاعة الدرس.',
      },
    ],
    audiences: ['المتعلمون الصغار', 'طلبة الجامعة', 'المهنيون', 'المؤسسات'],
    note: 'يتم تأكيد المستوى والجدول ولغة التقديم أثناء التسجيل حتى يدخل كل متعلم المسار الأنسب له.',
  },
  training: {
    slug: 'training',
    number: '03',
    name: 'التكوين المهني',
    eyebrow: 'قدرات · قيادة · تطور مهني',
    headline: 'طوّر المهارات التي تدفع العمل إلى الأمام.',
    introduction:
      'تساعد لومينول للتكوين المهني الأفراد والمؤسسات على تحويل الطموح إلى قدرة من خلال تعلّم عملي وملائم ومصمم بعناية.',
    promise: 'تطوير مهني يحترم وقتك ويرتبط مباشرة بكيفية إنجاز العمل.',
    visualWords: ['قُد', 'ابتكر', 'تقدّم'],
    programs: [
      {
        title: 'القيادة',
        description:
          'طوّر الوعي بالذات واتخاذ القرار والتواصل الضروري لقيادة الأشخاص بصورة جيدة.',
      },
      {
        title: 'التواصل المهني',
        description:
          'عزّز العروض والتعاون والتغذية الراجعة والتواصل الواثق داخل بيئة العمل.',
      },
      {
        title: 'الإنتاجية والمهارات الرقمية',
        description:
          'ابنِ أنظمة عملية وقدرات حديثة لعمل مركّز وفعّال وقابل للتكيف.',
      },
      {
        title: 'ورشات المؤسسات',
        description:
          'تجارب تعلم مصممة حسب احتياجات الفريق وسياق المؤسسة والنتائج المطلوبة.',
      },
    ],
    approach: [
      {
        title: 'حدّد النتيجة',
        description:
          'وضّح القدرة أو السلوك أو نتيجة العمل التي يجب أن تدعمها تجربة التعلّم.',
      },
      {
        title: 'تعلّم بالممارسة',
        description:
          'استخدم أمثلة عملية وتمارين نشطة وملاحظات تربط التعلّم بالعمل الحقيقي.',
      },
      {
        title: 'طبّق بثقة',
        description: 'اخرج بأدوات مفيدة وقرارات أوضح وطريقة عملية للتقدم.',
      },
    ],
    audiences: ['المهنيون في بداية المسار', 'المسيرون', 'الفرق', 'المؤسسات'],
    note: 'يمكن تكييف برامج المؤسسات حسب الجمهور والصيغة والهدف المهني بعد محادثة مركّزة لفهم الاحتياج.',
  },
};

export const schools = englishSchools;

const schoolsByLocale: Record<Locale, Record<SchoolSlug, SchoolDefinition>> = {
  en: englishSchools,
  fr: frenchSchools,
  ar: arabicSchools,
};

export function getSchools(
  locale: Locale,
): Record<SchoolSlug, SchoolDefinition> {
  return schoolsByLocale[locale];
}

export function getSchool(locale: Locale, slug: SchoolSlug): SchoolDefinition {
  return schoolsByLocale[locale][slug];
}

export function isSchoolSlug(value: string): value is SchoolSlug {
  return Object.prototype.hasOwnProperty.call(englishSchools, value);
}
