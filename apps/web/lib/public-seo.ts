import type { Locale } from '@luminol/localization';

export type SearchCopy = {
  title: string;
  description: string;
  heading?: string;
};

// Each route answers a distinct search intent in the language of its readers.
export const publicSearch = {
  '/': {
    en: {
      title: 'Psychology, Languages and Training in Blida',
      description:
        'Luminol Academy in Blida, Algeria offers psychology consultations, language courses and professional training. Explore the three schools and choose your next step.',
      heading: 'Psychology, languages and professional training in Blida',
    },
    fr: {
      title: 'Psychologie, langues et formation à Blida',
      description:
        'À Blida, Luminol Academy propose des consultations psychologiques, des cours de langues et des formations professionnelles. Découvrez les trois écoles.',
      heading: 'Psychologie, langues et formation professionnelle à Blida',
    },
    ar: {
      title: 'علم النفس واللغات والتكوين المهني في البليدة',
      description:
        'تقدّم أكاديمية لومينول في البليدة استشارات نفسية ودروس لغات وتكوينًا مهنيًا. تعرّف على مدارس الأكاديمية واختر المسار المناسب لك.',
      heading: 'علم النفس واللغات والتكوين المهني في البليدة',
    },
  },
  '/consultations': {
    en: {
      title: 'Psychology Consultations in Blida and Online',
      description:
        'Request a psychology consultation in Blida or online. Luminol supports individuals, couples and families and contacts you to discuss the next step.',
    },
    fr: {
      title: 'Consultations psychologiques à Blida et en ligne',
      description:
        'Demandez une consultation psychologique à Blida ou en ligne pour vous, votre couple ou votre famille. L’équipe vous contacte pour préciser la suite.',
    },
    ar: {
      title: 'استشارات نفسية في البليدة وعن بُعد',
      description:
        'اطلب استشارة نفسية في البليدة أو عن بُعد للفرد أو للزوجين أو للأسرة. يتواصل معك فريق لومينول لتحديد الخطوة المناسبة.',
    },
  },
  '/schools': {
    en: {
      title: 'Schools of Psychology, Languages and Training',
      description:
        'Compare Luminol Academy’s three schools. Explore psychology support and learning, language study and professional development.',
      heading:
        'Three schools for psychology, languages and professional training',
    },
    fr: {
      title: 'Écoles de psychologie, langues et formation',
      description:
        'Comparez les trois écoles de Luminol Academy et explorez l’accompagnement psychologique, les cours de langues et le développement professionnel.',
      heading:
        'Trois écoles de psychologie, de langues et de formation professionnelle',
    },
    ar: {
      title: 'مدارس علم النفس واللغات والتكوين المهني',
      description:
        'تعرّف على مدارس أكاديمية لومينول الثلاث وقارن بين مسارات علم النفس وتعلّم اللغات والتطوير المهني.',
      heading: 'مدارس لومينول لعلم النفس واللغات والتكوين المهني',
    },
  },
  '/schools/psychology': {
    en: {
      title: 'Psychology School in Blida',
      description:
        'Explore Luminol’s Psychology School in Blida, with pathways for individuals, couples, families and people studying or working in psychology.',
      heading: 'Psychology School in Blida',
    },
    fr: {
      title: 'École de psychologie à Blida',
      description:
        'Découvrez l’école de psychologie de Luminol à Blida, ses parcours pour les particuliers et les familles et ses ressources pour les étudiants et praticiens.',
      heading: 'École de psychologie à Blida',
    },
    ar: {
      title: 'مدرسة علم النفس في البليدة',
      description:
        'تعرّف على مدرسة علم النفس في لومينول بالبليدة ومساراتها للأفراد والأسر ومواردها لطلبة علم النفس والممارسين.',
      heading: 'مدرسة علم النفس في البليدة',
    },
  },
  '/schools/languages': {
    en: {
      title: 'Language Courses in Blida',
      description:
        'Explore Luminol’s language courses in Blida. Find out how the school assesses your level and helps you practise speaking in everyday situations.',
      heading: 'Language courses in Blida',
    },
    fr: {
      title: 'Cours de langues à Blida',
      description:
        'Découvrez les cours de langues de Luminol à Blida. Faites le point sur votre niveau et pratiquez la conversation en situation réelle.',
      heading: 'Cours de langues à Blida',
    },
    ar: {
      title: 'دروس اللغات في البليدة',
      description:
        'اكتشف دروس اللغات في لومينول بالبليدة، وكيفية تحديد مستواك والتدرّب على المحادثة في مواقف الحياة اليومية.',
      heading: 'دروس اللغات في البليدة',
    },
  },
  '/schools/training': {
    en: {
      title: 'Professional Training in Blida',
      description:
        'Explore professional training at Luminol in Blida for individuals and teams. Learn how workshops develop communication and practical workplace skills.',
      heading: 'Professional training in Blida',
    },
    fr: {
      title: 'Formation professionnelle à Blida',
      description:
        'Explorez les formations professionnelles de Luminol à Blida pour les particuliers et les équipes, avec des ateliers axés sur la communication et la pratique.',
      heading: 'Formation professionnelle à Blida',
    },
    ar: {
      title: 'التكوين المهني في البليدة',
      description:
        'اكتشف التكوين المهني في لومينول بالبليدة للأفراد والفرق، وورشًا لتطوير مهارات التواصل والعمل التطبيقي.',
      heading: 'التكوين المهني في البليدة',
    },
  },
  '/programmes': {
    en: {
      title: 'Course and Training Catalogue',
      description:
        'Browse current Luminol Academy courses in psychology, languages and professional development. Check each programme’s format and availability.',
      heading: 'Explore courses and training at Luminol',
    },
    fr: {
      title: 'Catalogue des cours et formations',
      description:
        'Consultez les cours et formations de Luminol Academy en psychologie, langues et développement professionnel. Vérifiez le format et la disponibilité.',
      heading: 'Cours et formations à Luminol',
    },
    ar: {
      title: 'دليل الدورات والبرامج التدريبية',
      description:
        'تصفّح دورات أكاديمية لومينول في علم النفس واللغات والتطوير المهني. اطّلع على صيغة كل برنامج ومدى توفره.',
      heading: 'دورات وبرامج أكاديمية لومينول',
    },
  },
  '/events': {
    en: {
      title: 'Workshops and Psychology Events',
      description:
        'See recent Luminol Academy psychology sessions and the calendar for upcoming workshops. Check the status of proposed dates before registering.',
    },
    fr: {
      title: 'Ateliers et événements de psychologie',
      description:
        'Retrouvez les rencontres de psychologie de Luminol Academy et le calendrier des prochains ateliers. Vérifiez le statut des dates proposées.',
    },
    ar: {
      title: 'الورش والفعاليات في علم النفس',
      description:
        'تصفّح لقاءات أكاديمية لومينول السابقة في علم النفس وتقويم الورش القادمة. اطّلع على حالة المواعيد المقترحة قبل التسجيل.',
    },
  },
  '/psy-library': {
    en: {
      title: 'Psychology Library and Clinical Resources',
      description:
        'Find psychology reading guides, clinical approaches and family support resources based on the teaching of clinical psychologist Kheddaoui Fettouma.',
    },
    fr: {
      title: 'Bibliothèque de psychologie et ressources cliniques',
      description:
        'Retrouvez des lectures, des approches cliniques et des ressources pour les familles issues de l’enseignement de la psychologue Kheddaoui Fettouma.',
    },
    ar: {
      title: 'مكتبة علم النفس والموارد العيادية',
      description:
        'تصفّح قراءات وموارد حول المقاربات العيادية ودعم الأسرة مستندة إلى موضوعات تكوين الأخصائية النفسانية العيادية خداوي فطومة.',
    },
  },
  '/journal': {
    en: {
      title: 'Psychology, Wellbeing and Learning Journal',
      description:
        'Explore the Luminol Journal for short readings on sleep, anxiety, family communication, learning and professional development.',
      heading: 'Journal of psychology, wellbeing and learning',
    },
    fr: {
      title: 'Journal de psychologie, bien-être et apprentissage',
      description:
        'Explorez le Journal Luminol et ses lectures sur le sommeil, l’anxiété, la communication en famille, l’apprentissage et la formation.',
      heading: 'Journal de psychologie, de bien-être et d’apprentissage',
    },
    ar: {
      title: 'مجلة علم النفس والرفاه والتعلّم',
      description:
        'تصفّح مجلة لومينول للقراءة حول النوم والقلق والتواصل الأسري والتعلّم والتطوير المهني.',
      heading: 'مجلة لومينول لعلم النفس والرفاه والتعلّم',
    },
  },
  '/about': {
    en: {
      title: 'About Luminol Academy in Blida',
      description:
        'Meet the team behind Luminol Academy in Blida and learn how its mission brings together psychology, languages and professional training.',
      heading: 'About Luminol Academy',
    },
    fr: {
      title: 'À propos de Luminol Academy à Blida',
      description:
        'Découvrez l’équipe et la mission de Luminol Academy à Blida, une académie qui réunit psychologie, langues et formation professionnelle.',
      heading: 'À propos de Luminol Academy',
    },
    ar: {
      title: 'عن أكاديمية لومينول في البليدة',
      description:
        'تعرّف على فريق أكاديمية لومينول في البليدة ورسالتها التي تجمع بين علم النفس واللغات والتكوين المهني.',
      heading: 'عن أكاديمية لومينول',
    },
  },
  '/about/founder': {
    en: {
      title: 'Kheddaoui Fettouma, Clinical Psychologist',
      description:
        'Meet Kheddaoui Fettouma, clinical psychologist and founder of Luminol Academy in Blida, with more than 31 years of experience.',
    },
    fr: {
      title: 'Kheddaoui Fettouma, psychologue clinicienne',
      description:
        'Découvrez le parcours de Kheddaoui Fettouma, psychologue clinicienne et fondatrice de Luminol Academy à Blida, avec plus de 31 ans d’expérience.',
    },
    ar: {
      title: 'خداوي فطومة، أخصائية نفسانية عيادية',
      description:
        'تعرّف على مسيرة خداوي فطومة، الأخصائية النفسانية العيادية ومؤسسة أكاديمية لومينول في البليدة، بخبرة تزيد على 31 عامًا.',
    },
  },
  '/approach': {
    en: {
      title: 'Our Approach to Consultation and Learning',
      description:
        'Find out how Luminol understands your goals and guides you towards a psychology consultation, language course or professional training pathway.',
      heading: 'Our approach to consultation and learning',
    },
    fr: {
      title: 'Notre approche de l’accompagnement et de la formation',
      description:
        'Découvrez comment Luminol clarifie votre objectif et vous oriente vers une consultation en psychologie, un cours de langues ou une formation.',
      heading: 'Notre approche de l’accompagnement et de la formation',
    },
    ar: {
      title: 'منهجنا في الاستشارة والتعلّم',
      description:
        'اعرف كيف يساعدك فريق لومينول على تحديد هدفك واختيار مسار مناسب في الاستشارة النفسية أو اللغات أو التكوين المهني.',
      heading: 'منهج لومينول في الاستشارة والتعلّم',
    },
  },
  '/contact': {
    en: {
      title: 'Contact and Enquiries in Blida',
      description:
        'Find Luminol Academy’s address, hours, phone and WhatsApp in Blida. Send a request about consultations, language courses or professional training.',
    },
    fr: {
      title: 'Contact et demandes à Blida',
      description:
        'Retrouvez l’adresse, les horaires, le téléphone et le WhatsApp de Luminol Academy à Blida. Envoyez une demande de consultation ou de formation.',
    },
    ar: {
      title: 'التواصل وطلبات الاستفسار في البليدة',
      description:
        'اطّلع على عنوان أكاديمية لومينول في البليدة وساعات العمل والهاتف وواتساب. أرسل طلبًا بشأن الاستشارات أو دورات اللغات أو التكوين.',
    },
  },
  '/privacy': {
    en: {
      title: 'Privacy Policy and Enquiry Data',
      description:
        'Read the Luminol Academy privacy policy and see how information submitted through the enquiry form is stored and used.',
    },
    fr: {
      title: 'Confidentialité et données des demandes',
      description:
        'Consultez la politique de confidentialité de Luminol Academy et découvrez comment sont traitées les informations envoyées par formulaire.',
    },
    ar: {
      title: 'سياسة الخصوصية وبيانات الاستفسارات',
      description:
        'اقرأ سياسة الخصوصية لأكاديمية لومينول وكيفية حفظ المعلومات المرسلة عبر نماذج الاستفسار واستخدامها.',
    },
  },
} satisfies Record<string, Record<Locale, SearchCopy>>;
