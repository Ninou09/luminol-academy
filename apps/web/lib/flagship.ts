import type { SchoolSlug } from './schools';

export type EditorialImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

export const editorialImages = {
  hero: {
    src: 'https://images.pexels.com/photos/20184571/pexels-photo-20184571/free-photo-of-people-during-course.jpeg',
    alt: 'مجموعة متنوعة من البالغين يشاركون باهتمام في ورشة تعليمية داخلية.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl: 'https://www.pexels.com/photo/people-during-course-20184571/',
  },
  psychology: {
    src: 'https://images.pexels.com/photos/7176296/pexels-photo-7176296.jpeg',
    alt: 'امرأتان تخوضان حوارًا هادئًا ومدروسًا في جلسة دعم.',
    credit: 'SHVETS production / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/female-talking-with-psychologist-during-session-7176296/',
  },
  languages: {
    src: 'https://images.pexels.com/photos/6683485/pexels-photo-6683485.jpeg',
    alt: 'متعلمات بالغات يتبادلن الحديث داخل قاعة دراسية حديثة.',
    credit: 'Andy Barbour / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-conversation-inside-the-classroom-6683485/',
  },
  training: {
    src: 'https://images.pexels.com/photos/18999455/pexels-photo-18999455/free-photo-of-people-during-presentation.jpeg',
    alt: 'مجموعة متنوعة من البالغين تتابع عرضًا مهنيًا داخل فضاء عمل حديث.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/people-during-presentation-18999455/',
  },
  learning: {
    src: 'https://images.pexels.com/photos/6502730/pexels-photo-6502730.jpeg',
    alt: 'مدرّسة ومتعلّم يتفاعلان مباشرة حول مواد دراسية في جلسة تعليم موجّهة.',
    credit: 'Thirdman / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/a-female-teacher-tutoring-her-male-student-6502730/',
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
