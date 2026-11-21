import type { Locale } from '@luminol/localization';

export type ApproachStep = {
  key: string;
  label: string;
  title: string;
  body: string;
  points: readonly string[];
};

export type ApproachCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  scrollHint: string;
  steps: readonly ApproachStep[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaQuiz: string;
  ctaContact: string;
};

/**
 * "Our approach": the real journey of a Luminol enquiry, described only with
 * facts already used on the site (enquiry flow, formats, languages,
 * attendance certificate). No durations, prices or promises are invented.
 */
export const approachCopy: Record<Locale, ApproachCopy> = {
  en: {
    title: 'Our approach',
    description:
      'How a first message becomes a clear pathway at Luminol Academy, step by step.',
    eyebrow: 'Our approach',
    heroTitle: 'From a first message to progress you can feel.',
    heroBody:
      'Every Luminol journey follows the same five careful steps, whether you come for psychological support, a language or professional growth.',
    scrollHint: 'Scroll to walk the path',
    steps: [
      {
        key: 'share',
        label: 'Step 01',
        title: 'You share your goal',
        body: 'Write through the form, WhatsApp or a call. A few words are enough — you do not need to know which school or programme fits yet.',
        points: ['Form, WhatsApp or phone', 'Arabic, French or English'],
      },
      {
        key: 'listen',
        label: 'Step 02',
        title: 'The team listens',
        body: 'Your request is securely recorded and reviewed by the team, who look at your goal, your area of interest and your preferred contact method.',
        points: ['Securely recorded', 'Reviewed by people, not bots'],
      },
      {
        key: 'pathway',
        label: 'Step 03',
        title: 'A clear pathway',
        body: 'Luminol follows up with the most suitable next step: a consultation, a programme, a workshop or guidance toward the right school.',
        points: [
          'Psychology, languages or training',
          'Format and timing discussed',
        ],
      },
      {
        key: 'practice',
        label: 'Step 04',
        title: 'Learning in practice',
        body: 'Sessions and programmes combine scientific thinking, human warmth and practical tools — so what you learn can be used in everyday life.',
        points: ['Practical tools', 'A supportive, respectful setting'],
      },
      {
        key: 'progress',
        label: 'Step 05',
        title: 'Progress you can feel',
        body: 'Programmes can end with an attendance certificate issued by Luminol Academy, and the team helps you choose what comes next.',
        points: [
          'Attendance certificate for programmes',
          'Your next chapter, together',
        ],
      },
    ],
    ctaEyebrow: 'Your first step',
    ctaTitle: 'Not sure where to begin?',
    ctaBody:
      'Answer four quick questions to see which school fits you, or write to the team directly.',
    ctaQuiz: 'Find my school',
    ctaContact: 'Write to Luminol',
  },
  fr: {
    title: 'Notre approche',
    description:
      'Comment un premier message devient un parcours clair chez Luminol Academy, étape par étape.',
    eyebrow: 'Notre approche',
    heroTitle: 'D’un premier message à des progrès concrets.',
    heroBody:
      'Chaque parcours Luminol suit les mêmes cinq étapes attentives, que vous veniez pour un soutien psychologique, une langue ou une évolution professionnelle.',
    scrollHint: 'Faites défiler pour suivre le chemin',
    steps: [
      {
        key: 'share',
        label: 'Étape 01',
        title: 'Vous partagez votre objectif',
        body: 'Écrivez via le formulaire, WhatsApp ou par téléphone. Quelques mots suffisent — inutile de savoir déjà quelle école ou quel programme choisir.',
        points: [
          'Formulaire, WhatsApp ou téléphone',
          'Arabe, français ou anglais',
        ],
      },
      {
        key: 'listen',
        label: 'Étape 02',
        title: 'L’équipe écoute',
        body: 'Votre demande est enregistrée en toute sécurité puis étudiée par l’équipe : votre objectif, votre domaine d’intérêt et votre moyen de contact préféré.',
        points: ['Enregistrée en sécurité', 'Étudiée par des personnes'],
      },
      {
        key: 'pathway',
        label: 'Étape 03',
        title: 'Un parcours clair',
        body: 'Luminol vous recontacte avec la prochaine étape la plus adaptée : une consultation, un programme, un atelier ou une orientation vers la bonne école.',
        points: [
          'Psychologie, langues ou formation',
          'Format et calendrier discutés',
        ],
      },
      {
        key: 'practice',
        label: 'Étape 04',
        title: 'Apprendre en pratique',
        body: 'Séances et programmes associent rigueur scientifique, chaleur humaine et outils concrets — pour que ce que vous apprenez serve au quotidien.',
        points: ['Outils concrets', 'Un cadre bienveillant et respectueux'],
      },
      {
        key: 'progress',
        label: 'Étape 05',
        title: 'Des progrès concrets',
        body: 'Les programmes peuvent se conclure par une attestation de participation délivrée par Luminol Academy, et l’équipe vous aide à choisir la suite.',
        points: [
          'Attestation de participation',
          'Votre prochain chapitre, ensemble',
        ],
      },
    ],
    ctaEyebrow: 'Votre premier pas',
    ctaTitle: 'Vous ne savez pas par où commencer ?',
    ctaBody:
      'Répondez à quatre questions rapides pour découvrir l’école qui vous correspond, ou écrivez directement à l’équipe.',
    ctaQuiz: 'Trouver mon école',
    ctaContact: 'Écrire à Luminol',
  },
  ar: {
    title: 'منهجنا',
    description:
      'كيف تتحول الرسالة الأولى إلى مسار واضح في أكاديمية لومينول، خطوة بخطوة.',
    eyebrow: 'منهجنا',
    heroTitle: 'من رسالة أولى إلى تقدّم تشعر به.',
    heroBody:
      'تتبع كل رحلة في لومينول الخطوات الخمس نفسها بعناية، سواء جئت من أجل دعم نفسي أو تعلّم لغة أو تطوّر مهني.',
    scrollHint: 'مرّر لتسير في الطريق',
    steps: [
      {
        key: 'share',
        label: 'الخطوة 01',
        title: 'تشاركنا هدفك',
        body: 'اكتب عبر الاستمارة أو واتساب أو اتصل بنا. تكفي كلمات قليلة، ولا تحتاج إلى معرفة المدرسة أو البرنامج المناسب مسبقًا.',
        points: [
          'الاستمارة أو واتساب أو الهاتف',
          'بالعربية أو الفرنسية أو الإنجليزية',
        ],
      },
      {
        key: 'listen',
        label: 'الخطوة 02',
        title: 'الفريق يصغي',
        body: 'يُسجَّل طلبك بأمان ويراجعه الفريق: هدفك ومجال اهتمامك ووسيلة التواصل التي تفضّلها.',
        points: ['تسجيل آمن', 'مراجعة يقوم بها أشخاص'],
      },
      {
        key: 'pathway',
        label: 'الخطوة 03',
        title: 'مسار واضح',
        body: 'تتواصل معك لومينول بالخطوة التالية الأنسب: استشارة أو برنامج أو ورشة أو توجيه نحو المدرسة المناسبة.',
        points: ['علم النفس أو اللغات أو التدريب', 'مناقشة الصيغة والتوقيت'],
      },
      {
        key: 'practice',
        label: 'الخطوة 04',
        title: 'تعلّم بالممارسة',
        body: 'تجمع الجلسات والبرامج بين التفكير العلمي والدفء الإنساني والأدوات العملية، ليصبح ما تتعلمه مفيدًا في حياتك اليومية.',
        points: ['أدوات عملية', 'بيئة داعمة ومحترمة'],
      },
      {
        key: 'progress',
        label: 'الخطوة 05',
        title: 'تقدّم تشعر به',
        body: 'قد تُختتم البرامج بشهادة حضور تصدرها أكاديمية لومينول، ويساعدك الفريق على اختيار خطوتك التالية.',
        points: ['شهادة حضور للبرامج', 'فصلك التالي، معًا'],
      },
    ],
    ctaEyebrow: 'خطوتك الأولى',
    ctaTitle: 'لا تعرف من أين تبدأ؟',
    ctaBody:
      'أجب عن أربعة أسئلة سريعة لتعرف المدرسة الأنسب لك، أو اكتب إلى الفريق مباشرة.',
    ctaQuiz: 'اعثر على مدرستي',
    ctaContact: 'اكتب إلى لومينول',
  },
};
