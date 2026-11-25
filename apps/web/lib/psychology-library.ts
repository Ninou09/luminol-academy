import type { Locale } from '@luminol/localization';

type Translation = readonly [en: string, fr: string, ar: string];
type Pathway = {
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

function selectText([en, fr, ar]: Translation): Record<Locale, string> {
  return { en, fr, ar };
}

function pathway(
  slug: string,
  title: Translation,
  summary: Translation,
): Pathway {
  return { slug, title: selectText(title), summary: selectText(summary) };
}

export const founderProgrammeSource =
  'https://luminolacademy.nl/programs-and-services';

export const clinicalPathways = [
  pathway(
    'cbt-techniques-course',
    [
      'Cognitive behavioural therapy techniques',
      'Techniques de thérapie cognitivo-comportementale',
      'فنيات العلاج المعرفي السلوكي',
    ],
    [
      'Explore automatic thoughts and beliefs, case formulation, assessment interviews and session planning.',
      'Pensées automatiques et croyances, formulation de cas, entretiens d’évaluation et planification des séances.',
      'الأفكار التلقائية والمعتقدات، وصياغة الحالة، والمقابلات التشخيصية، وتخطيط الجلسات.',
    ],
  ),
  pathway(
    'eft-training-course',
    [
      'Emotional Freedom Technique (EFT)',
      'Technique de libération émotionnelle (EFT)',
      'تقنية تحرير المشاعر السلبية (EFT)',
    ],
    [
      'Review the EFT protocol, how it differs from TFT, and the individual and group practice described in the syllabus.',
      'Étude du protocole EFT, de ses différences avec la TFT et des exercices individuels et collectifs du programme.',
      'التعرّف على بروتوكول EFT والفرق بينه وبين TFT، مع تدريبات فردية وجماعية واردة في المنهج.',
    ],
  ),
  pathway(
    'marriage-counseling-course',
    ['Couples counselling', 'Conseil conjugal', 'الإرشاد الزواجي'],
    [
      'Study relationship dynamics, communication assessment and how to plan and follow up on couples support.',
      'Dynamique du couple, évaluation de la communication, élaboration et suivi de l’accompagnement conjugal.',
      'ديناميات العلاقة الزوجية، وتقييم التواصل، وإعداد خطة التكفّل ومتابعتها.',
    ],
  ),
  pathway(
    'family-counselor-course',
    ['Family counselling', 'Conseil familial', 'الإرشاد الأسري'],
    [
      'Study couples, parental and family relationships through solution-focused strategies and family interviews.',
      'Relations conjugales, parentales et familiales, avec des stratégies centrées sur les solutions et des entretiens familiaux.',
      'العلاقات الزوجية والوالدية والأسرية، واستراتيجيات إيجاد الحلول وتسيير المقابلات الأسرية.',
    ],
  ),
  pathway(
    'schema-therapy-course',
    ['Schema therapy', 'Thérapie des schémas', 'العلاج بالمخططات المعرفية'],
    [
      'Study Jeffrey Young’s schema therapy model as a framework for understanding clinical cases.',
      'Découvrir le modèle de Jeffrey Young pour approfondir la compréhension des situations cliniques.',
      'دراسة نموذج جيفري يونغ في العلاج بالمخططات لفهم الحالات النفسية.',
    ],
  ),
  pathway(
    'learning-difficulties-course',
    [
      'Learning difficulties: assessment and support',
      'Difficultés d’apprentissage : évaluation et accompagnement',
      'صعوبات التعلم: التشخيص والتكفّل',
    ],
    [
      'Review assessment tools for writing, arithmetic and attention, and how findings can inform support plans.',
      'Outils d’évaluation de l’écriture, du calcul et de l’attention pour élaborer un plan d’accompagnement.',
      'مقاييس الكتابة والحساب والانتباه وكيفية توظيف النتائج في برامج التكفّل.',
    ],
  ),
  pathway(
    'child-psychology-diagnosis-intervention',
    [
      'Child psychology: assessment and intervention',
      'Psychologie de l’enfant : évaluation et intervention',
      'علم نفس الطفل: التشخيص وبرامج التكفّل',
    ],
    [
      'Explore emotional and behavioural development, psychological assessment and planning support for children.',
      'Développement émotionnel et comportemental, évaluation psychologique et conception de l’accompagnement de l’enfant.',
      'النمو الانفعالي والسلوكي، والتقييم النفسي، وإعداد برامج التكفّل بالطفل.',
    ],
  ),
  pathway(
    'act-therapy-techniques-course',
    [
      'Acceptance and Commitment Therapy (ACT)',
      'Thérapie d’acceptation et d’engagement (ACT)',
      'العلاج بالتقبّل والالتزام (ACT)',
    ],
    [
      'Explore psychological flexibility, case formulation and the choice of ACT techniques.',
      'Flexibilité psychologique, formulation de cas et choix des techniques ACT.',
      'المرونة النفسية وصياغة الحالة واختيار فنيات العلاج بالتقبّل والالتزام.',
    ],
  ),
] as const;

export const familyPathways = [
  pathway(
    'effective-parenting-program',
    [
      'Effective parenting, step by step',
      'Parentalité efficace, pas à pas',
      'التنشئة الفعّالة خطوة بخطوة',
    ],
    [
      'Review children’s developmental needs by age and ways to strengthen everyday communication.',
      'Besoins de l’enfant selon son âge et pistes pour améliorer la communication au quotidien.',
      'احتياجات الطفل حسب المرحلة العمرية وطرق تعزيز التواصل معه في الحياة اليومية.',
    ],
  ),
  pathway(
    'learning-difficulties-parents-teachers',
    [
      'Learning difficulties for parents and teachers',
      'Difficultés d’apprentissage pour parents et enseignants',
      'صعوبات التعلم للأولياء والمعلمين',
    ],
    [
      'Understand learning difficulties and explore educational support at home and in the classroom.',
      'Comprendre les difficultés d’apprentissage et explorer des pistes de soutien à la maison et en classe.',
      'فهم صعوبات التعلم واستكشاف أساليب الدعم التربوي في البيت والقسم.',
    ],
  ),
] as const;
