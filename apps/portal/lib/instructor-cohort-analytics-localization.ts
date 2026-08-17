import type { Locale } from '@luminol/localization';

export type InstructorCohortAnalyticsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  privacyTitle: string;
  privacyBody: string;
  suppressedTitle: string;
  suppressedBody: (minimumGroupSize: number) => string;
  participantCount: string;
  completion: string;
  completedEnrollments: string;
  recentActivity: string;
  recentActivityBody: (days: number) => string;
  activeCertificates: string;
  reviewWorkload: string;
  reviewRequiredAttempts: string;
  percent: string;
  sourceTitle: string;
  sourceBody: string;
};

const COPY: Record<Locale, InstructorCohortAnalyticsCopy> = {
  en: {
    eyebrow: 'Instructor analytics',
    title: 'Cohort learning overview',
    intro:
      'Privacy-protected aggregates for this exact assigned cohort, derived from existing enrolment, learning, certificate and governed review records.',
    back: 'Back to cohort',
    privacyTitle: 'Privacy boundary',
    privacyBody:
      'These aggregates never expose learner identity, assessment answers or scores, psychology content, enquiries, finance or payment data, private certificate metadata, learner-authored text, raw search queries, session identifiers or IP addresses. Learners and instructors are never ranked.',
    suppressedTitle: 'Aggregate protected',
    suppressedBody: (minimumGroupSize) =>
      `Detailed cohort analytics remain hidden until at least ${minimumGroupSize} eligible learners are present. The exact small-group size is not displayed.`,
    participantCount: 'Eligible learners',
    completion: 'Programme completion',
    completedEnrollments: 'Completed enrolments',
    recentActivity: 'Recent learning activity',
    recentActivityBody: (days) =>
      `Learners with learning activity during the last ${days} days.`,
    activeCertificates: 'Active certificates',
    reviewWorkload: 'Governed review workload',
    reviewRequiredAttempts: 'Attempts requiring review',
    percent: 'Rate',
    sourceTitle: 'Metric definitions',
    sourceBody:
      'Completion uses cohort enrolment status, recent activity uses first-party learning records, certificate completion uses active certificates for the cohort programme, and review workload counts existing placement attempts already marked as requiring review.',
  },
  fr: {
    eyebrow: 'Analytique formateur',
    title: 'Vue d’ensemble du groupe',
    intro:
      'Agrégats protégés pour ce groupe exactement attribué, dérivés des inscriptions, activités d’apprentissage, certificats et évaluations déjà gouvernées.',
    back: 'Retour au groupe',
    privacyTitle: 'Limite de confidentialité',
    privacyBody:
      'Ces agrégats n’exposent jamais l’identité des apprenants, les réponses ou scores d’évaluation, le contenu psychologique, les demandes, les données financières ou de paiement, les métadonnées privées des certificats, les textes rédigés par les apprenants, les recherches brutes, les identifiants de session ou les adresses IP. Aucun classement des apprenants ou formateurs n’est produit.',
    suppressedTitle: 'Agrégat protégé',
    suppressedBody: (minimumGroupSize) =>
      `Les statistiques détaillées restent masquées jusqu’à la présence d’au moins ${minimumGroupSize} apprenants éligibles. La taille exacte d’un petit groupe n’est pas affichée.`,
    participantCount: 'Apprenants éligibles',
    completion: 'Achèvement du programme',
    completedEnrollments: 'Inscriptions terminées',
    recentActivity: 'Activité d’apprentissage récente',
    recentActivityBody: (days) =>
      `Apprenants ayant une activité d’apprentissage pendant les ${days} derniers jours.`,
    activeCertificates: 'Certificats actifs',
    reviewWorkload: 'Charge de révision gouvernée',
    reviewRequiredAttempts: 'Tentatives à réviser',
    percent: 'Taux',
    sourceTitle: 'Définition des indicateurs',
    sourceBody:
      'L’achèvement utilise le statut d’inscription au groupe, l’activité récente utilise les traces d’apprentissage de première partie, les certificats utilisent les certificats actifs du programme et la charge de révision compte uniquement les tentatives de placement déjà marquées comme nécessitant une révision.',
  },
  ar: {
    eyebrow: 'تحليلات المدرّس',
    title: 'نظرة تحليلية على المجموعة',
    intro:
      'مؤشرات مجمّعة ومحميّة لهذه المجموعة المسندة تحديدًا، ومشتقة من سجلات التسجيل والتعلّم والشهادات والمراجعات المعتمدة الموجودة أصلًا.',
    back: 'العودة إلى المجموعة',
    privacyTitle: 'حدود الخصوصية',
    privacyBody:
      'لا تكشف هذه المؤشرات هوية المتعلمين أو إجابات أو درجات التقييم أو المحتوى النفسي أو الاستفسارات أو البيانات المالية وبيانات الدفع أو البيانات الخاصة للشهادات أو النصوص التي يكتبها المتعلمون أو عبارات البحث الخام أو معرّفات الجلسات أو عناوين IP. ولا يتم ترتيب المتعلمين أو المدرّسين.',
    suppressedTitle: 'المؤشرات محمية',
    suppressedBody: (minimumGroupSize) =>
      `تبقى تحليلات المجموعة التفصيلية مخفية حتى يوجد ما لا يقل عن ${minimumGroupSize} متعلمين مؤهلين. ولا يُعرض العدد الدقيق للمجموعة الصغيرة.`,
    participantCount: 'المتعلمون المؤهلون',
    completion: 'إكمال البرنامج',
    completedEnrollments: 'التسجيلات المكتملة',
    recentActivity: 'نشاط التعلّم الحديث',
    recentActivityBody: (days) =>
      `المتعلمون الذين لديهم نشاط تعلّم خلال آخر ${days} يومًا.`,
    activeCertificates: 'الشهادات النشطة',
    reviewWorkload: 'عبء المراجعة المعتمد',
    reviewRequiredAttempts: 'المحاولات التي تحتاج إلى مراجعة',
    percent: 'النسبة',
    sourceTitle: 'تعريف المؤشرات',
    sourceBody:
      'يعتمد الإكمال على حالة تسجيل المتعلم في المجموعة، ويعتمد النشاط الحديث على سجلات التعلّم المباشرة، وتعتمد الشهادات على الشهادات النشطة الخاصة ببرنامج المجموعة، بينما يحسب عبء المراجعة فقط محاولات تحديد المستوى المسجلة مسبقًا على أنها تحتاج إلى مراجعة.',
  },
};

export function getInstructorCohortAnalyticsCopy(locale: Locale) {
  return COPY[locale];
}
