import type { SchoolSlug } from './schools';

export type EditorialImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=82&w=2200`;

export const editorialImages = {
  hero: {
    src: unsplash('photo-1758270705696-ec9caffc73dd'),
    alt: 'متعلمون بالغون يشاركون في نقاش تفاعلي داخل قاعة دراسية.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/teacher-interacting-with-students-in-a-classroom-setting-c6QLJhezaYs',
  },
  psychology: {
    src: unsplash('photo-1758273241086-f3585ef8c2f8'),
    alt: 'مختص يصغي باهتمام خلال جلسة دعم خاصة.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/therapist-listens-to-patient-in-a-counseling-session-tw-mAZXr6H4',
  },
  languages: {
    src: unsplash('photo-1758270705482-cee87ea98738'),
    alt: 'مجموعة متنوعة من المتعلمين البالغين يتحدثون داخل قاعة تعليم.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/students-talking-in-a-lecture-hall-classroom-T9yehHSvLL4',
  },
  training: {
    src: unsplash('photo-1758691737124-05c5bffe46f0'),
    alt: 'فريق مهني متنوع يتعاون حول حاسوب محمول.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/diverse-team-collaborating-around-a-laptop-in-office-yd_RKGH_RH4',
  },
  learning: {
    src: unsplash('photo-1758270703813-2ecf235a6462'),
    alt: 'متعلمون بالغون يصغون ويدوّنون خلال حصة موجّهة.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/students-listen-to-a-lecture-in-a-classroom-8c0ndhIXDzQ',
  },
} satisfies Record<string, EditorialImage>;

export const branchExperience: Record<
  SchoolSlug,
  {
    themeLabel: string;
    image: EditorialImage;
    positioning: string;
    outcomes: readonly string[];
    expertise: readonly string[];
    faq: readonly { question: string; answer: string }[];
  }
> = {
  psychology: {
    themeLabel: 'فهم هادئ وعملي',
    image: editorialImages.psychology,
    positioning:
      'بيئة مدروسة لفهم المشاعر، تقوية العلاقات وبناء خطوات عملية تناسب الشخص وسياقه.',
    outcomes: [
      'لغة أوضح لفهم التجارب الصعبة',
      'أدوات عملية يمكن استخدامها خارج الجلسة',
      'توجيه داعم يتكيف مع الشخص والسياق',
      'حدود واضحة وإحالة مناسبة عند الحاجة إلى رعاية أخرى',
    ],
    expertise: [
      'إنصات إنساني مسؤول',
      'توجيه يراعي المرحلة العمرية',
      'حدود أخلاقية وإحالة مناسبة',
      'تثقيف نفسي عملي',
    ],
    faq: [
      {
        question: 'هل فرع علم النفس خدمة طبية أو خدمة طوارئ؟',
        answer:
          'لا. برامج لومينول تعليمية وداعمة ولا تعوّض الرعاية الطبية أو النفسية أو خدمات الطوارئ. تتم الإحالة عندما يحتاج الشخص إلى مستوى مختلف من الرعاية.',
      },
      {
        question: 'هل يمكن للأولياء طلب توجيه يخص الأطفال أو الأسرة؟',
        answer:
          'نعم. تساعد المحادثة الأولى على فهم السياق الأسري، عمر المتعلم والمسار التربوي أو الداعم الأكثر ملاءمة.',
      },
      {
        question: 'هل تتوفر ورشات جماعية؟',
        answer:
          'يمكن تنظيم ورشات حول الذكاء العاطفي، الضغط، التواصل، التربية والتطور الشخصي. يؤكد الفريق المواضيع والمواعيد المتاحة.',
      },
    ],
  },
  languages: {
    themeLabel: 'تواصل واثق',
    image: editorialImages.languages,
    positioning:
      'تعلّم لغوي مبني على المحادثة، الممارسة المفيدة والتغذية الراجعة التي تبني الثقة خارج القسم.',
    outcomes: [
      'تحديد واضح للمستوى ومسار التقدم',
      'تحسين الاستماع والتحدث والفهم',
      'ممارسة مرتبطة بالمواقف الدراسية والاجتماعية والمهنية',
      'تغذية راجعة تساعد على تواصل أكثر طبيعية',
    ],
    expertise: [
      'تدرج مناسب للمستوى',
      'ممارسة قائمة على المحادثة',
      'النطق والفهم',
      'التواصل الأكاديمي والمهني',
    ],
    faq: [
      {
        question: 'كيف يتم اختيار المستوى المناسب؟',
        answer:
          'يراجع الفريق القدرة الحالية، الهدف واحتياجات التواصل العملية قبل تأكيد المجموعة أو المسار الأنسب.',
      },
      {
        question: 'هل البرامج مخصصة للمبتدئين فقط؟',
        answer:
          'لا. تشمل المسارات الأساسيات، التطوير المستمر، ممارسة الطلاقة والتواصل للأغراض الدراسية أو المهنية.',
      },
      {
        question: 'هل تتوفر صيغ حضورية أو عن بُعد؟',
        answer:
          'تعتمد الصيغة على البرنامج والجدول. يؤكد فريق التواصل الخيارات الحضورية أو عن بُعد أو الهجينة المتاحة حاليًا.',
      },
    ],
  },
  training: {
    themeLabel: 'طموح قابل للتطبيق',
    image: editorialImages.training,
    positioning:
      'تطوير مهني يربط التعلم بالقرار، التواصل، القيادة والمهام اليومية داخل العمل.',
    outcomes: [
      'هدف مهني أو قدرة واضحة',
      'ممارسة نشطة بدل العرض النظري فقط',
      'أدوات وأطر قابلة للاستخدام في العمل',
      'خطة خطوة تالية للفرد أو الفريق',
    ],
    expertise: [
      'القيادة واتخاذ القرار',
      'التواصل المهني',
      'الإنتاجية والمهارات الرقمية',
      'ورشات مؤسسات مبنية على الاحتياج',
    ],
    faq: [
      {
        question: 'هل يمكن تكييف التكوين لمؤسسة؟',
        answer:
          'نعم. تبدأ ورشات المؤسسات بمحادثة مركزة لتحديد الجمهور، الصيغة والنتيجة المهنية المطلوبة.',
      },
      {
        question: 'لمن صُممت البرامج الفردية؟',
        answer:
          'يمكنها دعم حديثي التخرج، المسيرين والأشخاص الذين يطوّرون مهارات التواصل، القيادة أو العمل الحديث.',
      },
      {
        question: 'هل يحصل كل متعلم على شهادة؟',
        answer:
          'تعتمد الشهادة على متطلبات البرنامج ومعايير الإتمام. يؤكد الفريق ذلك قبل التسجيل.',
      },
    ],
  },
};

export const credibilityPrinciples = [
  {
    title: 'تخصص واضح',
    text: 'يحافظ كل فرع على المعايير واللغة والأساليب المناسبة لمجاله.',
  },
  {
    title: 'الإنسان أولًا',
    text: 'تبدأ البرامج من الشخص وسياقه والنتيجة التي تهمه فعلًا.',
  },
  {
    title: 'تعلّم تطبيقي',
    text: 'ترتبط المعرفة بالممارسة الموجّهة والتغذية الراجعة والخطوات المفيدة.',
  },
  {
    title: 'تجربة عربية أصيلة',
    text: 'تم تصميم الموقع والمحتوى والاتجاه الطباعي للعربية من البداية.',
  },
] as const;

export const learningOpportunities = [
  {
    school: 'psychology' as const,
    label: 'علم النفس',
    title: 'دعم وتوجيه وورشات جماعية',
    text: 'اكتشف الدعم الفردي، إرشاد الأسرة، الكوتشينغ والورشات التثقيفية.',
    cta: 'اكتشف برامج علم النفس',
  },
  {
    school: 'languages' as const,
    label: 'اللغات',
    title: 'من الأساسيات إلى الطلاقة',
    text: 'اختر مسارًا مناسبًا لمستواك في الإنجليزية، الفرنسية والتواصل الواقعي.',
    cta: 'اختر برنامج اللغة',
  },
  {
    school: 'training' as const,
    label: 'التكوين المهني',
    title: 'مهارات للأفراد والفرق والمؤسسات',
    text: 'طوّر قدرات عملية في القيادة، التواصل والتعلم المرتبط بالعمل.',
    cta: 'استكشف التكوين المهني',
  },
] as const;
