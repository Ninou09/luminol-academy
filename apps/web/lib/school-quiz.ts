import type { Locale } from '@luminol/localization';

export type QuizSchool = 'psychology' | 'languages' | 'training';

export type QuizCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  progress: string;
  back: string;
  restart: string;
  resultEyebrow: string;
  resultTitle: string;
  resultBody: string;
  openSchool: string;
  talk: string;
  questions: readonly {
    question: string;
    options: readonly { label: string; school: QuizSchool }[];
  }[];
};

/** A light orientation quiz: it suggests a starting school, never a diagnosis. */
export const schoolQuiz: Record<Locale, QuizCopy> = {
  en: {
    eyebrow: 'Find your school',
    title: 'Which Luminol school fits you?',
    intro:
      'Four quick questions. It is only a starting point — the team will help you choose.',
    progress: 'Question',
    back: 'Back',
    restart: 'Start again',
    resultEyebrow: 'Your best starting point',
    resultTitle: 'Luminol',
    resultBody:
      'This is a gentle suggestion, not a diagnosis. Explore the school or tell the team about your goal.',
    openSchool: 'Explore this school',
    talk: 'Talk to the team',
    questions: [
      {
        question: 'What would you most like to change right now?',
        options: [
          { label: 'How I feel and cope day to day', school: 'psychology' },
          {
            label: 'How I speak and understand a language',
            school: 'languages',
          },
          { label: 'My skills and confidence at work', school: 'training' },
        ],
      },
      {
        question: 'Which sentence sounds most like you?',
        options: [
          {
            label: 'I want to understand myself or my family better',
            school: 'psychology',
          },
          {
            label: 'I want to speak with confidence in another language',
            school: 'languages',
          },
          {
            label: 'I want to lead, present or organise my work better',
            school: 'training',
          },
        ],
      },
      {
        question: 'Who is this for?',
        options: [
          { label: 'Me, my child or my family', school: 'psychology' },
          { label: 'Me, as a language learner', school: 'languages' },
          { label: 'Me or my team at work', school: 'training' },
        ],
      },
      {
        question: 'What would success look like?',
        options: [
          {
            label: 'Feeling calmer, clearer and supported',
            school: 'psychology',
          },
          {
            label: 'Holding a real conversation with ease',
            school: 'languages',
          },
          { label: 'A stronger role, project or team', school: 'training' },
        ],
      },
    ],
  },
  fr: {
    eyebrow: 'Trouvez votre école',
    title: 'Quelle école Luminol vous correspond ?',
    intro:
      'Quatre questions rapides. Ce n’est qu’un point de départ — l’équipe vous aidera à choisir.',
    progress: 'Question',
    back: 'Retour',
    restart: 'Recommencer',
    resultEyebrow: 'Votre meilleur point de départ',
    resultTitle: 'Luminol',
    resultBody:
      'Il s’agit d’une suggestion, pas d’un diagnostic. Découvrez l’école ou parlez de votre objectif à l’équipe.',
    openSchool: 'Découvrir cette école',
    talk: 'Parler à l’équipe',
    questions: [
      {
        question: 'Qu’aimeriez-vous le plus changer en ce moment ?',
        options: [
          {
            label: 'Ma façon de me sentir et de faire face au quotidien',
            school: 'psychology',
          },
          {
            label: 'Ma façon de parler et de comprendre une langue',
            school: 'languages',
          },
          {
            label: 'Mes compétences et mon assurance au travail',
            school: 'training',
          },
        ],
      },
      {
        question: 'Quelle phrase vous ressemble le plus ?',
        options: [
          {
            label: 'Je veux mieux me comprendre ou comprendre ma famille',
            school: 'psychology',
          },
          {
            label: 'Je veux parler avec assurance dans une autre langue',
            school: 'languages',
          },
          {
            label: 'Je veux mieux diriger, présenter ou organiser mon travail',
            school: 'training',
          },
        ],
      },
      {
        question: 'Pour qui est-ce ?',
        options: [
          { label: 'Pour moi, mon enfant ou ma famille', school: 'psychology' },
          { label: 'Pour moi, en tant qu’apprenant', school: 'languages' },
          { label: 'Pour moi ou mon équipe au travail', school: 'training' },
        ],
      },
      {
        question: 'À quoi ressemblerait la réussite ?',
        options: [
          {
            label: 'Me sentir plus calme, plus clair et soutenu',
            school: 'psychology',
          },
          {
            label: 'Tenir une vraie conversation avec aisance',
            school: 'languages',
          },
          {
            label: 'Un rôle, un projet ou une équipe plus solides',
            school: 'training',
          },
        ],
      },
    ],
  },
  ar: {
    eyebrow: 'اعثر على مدرستك',
    title: 'أي مدرسة في لومينول تناسبك؟',
    intro:
      'أربعة أسئلة سريعة. إنها مجرد نقطة انطلاق، وسيساعدك الفريق على الاختيار.',
    progress: 'السؤال',
    back: 'رجوع',
    restart: 'ابدأ من جديد',
    resultEyebrow: 'أفضل نقطة انطلاق لك',
    resultTitle: 'لومينول',
    resultBody:
      'هذا اقتراح لطيف وليس تشخيصًا. استكشف المدرسة أو أخبر الفريق بهدفك.',
    openSchool: 'استكشف هذه المدرسة',
    talk: 'تحدّث مع الفريق',
    questions: [
      {
        question: 'ما الذي تودّ تغييره أكثر الآن؟',
        options: [
          { label: 'شعوري وطريقة تعاملي مع يومي', school: 'psychology' },
          { label: 'طريقة تحدّثي وفهمي للغة', school: 'languages' },
          { label: 'مهاراتي وثقتي في العمل', school: 'training' },
        ],
      },
      {
        question: 'أي جملة تشبهك أكثر؟',
        options: [
          {
            label: 'أريد أن أفهم نفسي أو عائلتي بشكل أفضل',
            school: 'psychology',
          },
          { label: 'أريد أن أتحدث بثقة بلغة أخرى', school: 'languages' },
          {
            label: 'أريد أن أقود أو أقدّم أو أنظّم عملي بشكل أفضل',
            school: 'training',
          },
        ],
      },
      {
        question: 'لمن هذا؟',
        options: [
          { label: 'لي أو لطفلي أو لعائلتي', school: 'psychology' },
          { label: 'لي كمتعلم لغة', school: 'languages' },
          { label: 'لي أو لفريقي في العمل', school: 'training' },
        ],
      },
      {
        question: 'كيف سيبدو النجاح؟',
        options: [
          { label: 'أن أشعر بهدوء ووضوح ودعم أكبر', school: 'psychology' },
          { label: 'أن أخوض محادثة حقيقية بسهولة', school: 'languages' },
          { label: 'دور أو مشروع أو فريق أقوى', school: 'training' },
        ],
      },
    ],
  },
};
