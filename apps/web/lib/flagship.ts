import { academyMedia } from './academy-media';
import type { SchoolSlug } from './schools';

export type EditorialImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

export type EditorialGalleryImage = EditorialImage & {
  caption: string;
};

export type EditorialVideo = {
  id: string;
  src: string;
  eyebrow: string;
  title: string;
  description: string;
  credit: string;
  creditUrl: string;
  poster: EditorialImage;
};

export const editorialImages = {
  hero: {
    src: academyMedia.training.src,
    alt: academyMedia.training.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  psychology: {
    src: academyMedia.psychology.src,
    alt: academyMedia.psychology.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  languages: {
    src: academyMedia.languages.src,
    alt: academyMedia.languages.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  training: {
    src: academyMedia.training.src,
    alt: academyMedia.training.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  learning: {
    src: academyMedia.classroom.src,
    alt: academyMedia.classroom.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
} satisfies Record<string, EditorialImage>;

export const editorialVideos = [
  {
    id: 'active-learning',
    src: 'https://videos.pexels.com/video-files/6671805/6671805-uhd_3840_2160_24fps.mp4',
    eyebrow: 'التعلّم النشط',
    title: 'المعرفة تصبح أقوى عندما تتحول إلى حوار.',
    description:
      'لقطة تحريرية توضح بيئة تعليمية قائمة على الشرح، التفاعل والأسئلة بدل المشاهدة السلبية فقط.',
    credit: 'Andy Barbour / Pexels',
    creditUrl:
      'https://www.pexels.com/video/video-of-a-teacher-teaching-students-6671805/',
    poster: editorialImages.hero,
  },
  {
    id: 'human-support',
    src: 'https://videos.pexels.com/video-files/5697627/5697627-uhd_3840_2160_24fps.mp4',
    eyebrow: 'الحضور الإنساني',
    title: 'الإنصات جزء من التصميم، وليس مجرد رسالة مكتوبة.',
    description:
      'لقطة تحريرية لحوار داعم تعبّر عن الهدوء، التركيز والاحترام الذي نريد أن تنقله تجربة قسم علم النفس.',
    credit: 'Alex Green / Pexels',
    creditUrl: 'https://www.pexels.com/video/therapist-consulting-5697627/',
    poster: editorialImages.psychology,
  },
] satisfies readonly EditorialVideo[];

export const editorialGallery = [
  {
    src: 'https://images.pexels.com/photos/6238013/pexels-photo-6238013.jpeg',
    alt: 'مجموعة طلاب متنوعين يتعاونون حول طاولة في قاعة دراسية مضيئة.',
    caption: 'تعاون ومشاركة',
    credit: 'Monstera Production / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/positive-diverse-students-studying-in-modern-classroom-6238013/',
  },
  {
    src: 'https://images.pexels.com/photos/8419252/pexels-photo-8419252.jpeg',
    alt: 'طالبان يتبادلان الحديث داخل قاعة دراسية حديثة ومضيئة.',
    caption: 'لغة تُستخدم فعليًا',
    credit: 'Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-a-conversation-in-a-classroom-8419252/',
  },
  {
    src: 'https://images.pexels.com/photos/7176052/pexels-photo-7176052.jpeg',
    alt: 'مختصة تتحدث مع شخص في جلسة دعم هادئة داخل فضاء مريح.',
    caption: 'إنصات ووضوح',
    credit: 'SHVETS production / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/a-patient-talking-to-a-therapist-7176052/',
  },
  {
    src: 'https://images.pexels.com/photos/18999540/pexels-photo-18999540/free-photo-of-people-during-training-course.jpeg',
    alt: 'مجموعة متنوعة تحضر ورشة تدريبية وتتابع متحدثًا داخل فضاء مهني.',
    caption: 'تكوين مرتبط بالواقع',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/people-during-training-course-18999540/',
  },
  {
    src: 'https://images.pexels.com/photos/7234414/pexels-photo-7234414.jpeg',
    alt: 'مهنيون متنوعون يتابعون عرضًا تقديميًا داخل قاعة حديثة.',
    caption: 'خبرة تُشارك',
    credit: 'Pavel Danilyuk / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/group-of-people-watching-a-speaker-doing-a-presentation-7234414/',
  },
  {
    src: 'https://images.pexels.com/photos/6683485/pexels-photo-6683485.jpeg',
    alt: 'متعلمات يتبادلن الحديث في نشاط تعليمي داخل قاعة دراسية.',
    caption: 'ثقة في التواصل',
    credit: 'Andy Barbour / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-conversation-inside-the-classroom-6683485/',
  },
] satisfies readonly EditorialGalleryImage[];

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
