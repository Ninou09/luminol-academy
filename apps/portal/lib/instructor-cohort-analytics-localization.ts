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
  attendance: string;
  attendanceRate: string;
  attendanceRecords: string;
  attendedRecords: string;
  absentRecords: string;
  excusedRecords: string;
  attendanceBody: string;
  percent: string;
  sourceTitle: string;
  sourceBody: string;
};

const COPY: Record<Locale, InstructorCohortAnalyticsCopy> = {
  en: {
    eyebrow: 'Instructor analytics',
    title: 'Cohort learning overview',
    intro:
      'Privacy-protected aggregates for this exact assigned cohort, derived from existing enrolment, learning, certificate, attendance and governed review records.',
    back: 'Back to cohort',
    privacyTitle: 'Privacy boundary',
    privacyBody:
      'These aggregates never expose learner identity, assessment answers or scores, psychology content, enquiries, finance or payment data, private certificate metadata, learner-authored text, raw search queries, session identifiers, attendance-recorder identity or IP addresses. Learners and instructors are never ranked.',
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
    attendance: 'Attendance aggregate',
    attendanceRate: 'Recorded attendance rate',
    attendanceRecords: 'Attendance records',
    attendedRecords: 'Present or late records',
    absentRecords: 'Absent records',
    excusedRecords: 'Excused records',
    attendanceBody:
      'The attendance rate uses first-party attendance states for currently eligible cohort memberships only. Present and late count as attended; absent and excused remain separate aggregate counts.',
    percent: 'Rate',
    sourceTitle: 'Metric definitions',
    sourceBody:
      'Completion uses cohort enrolment status, recent activity uses first-party learning records, certificate completion uses active certificates for the cohort programme, review workload counts existing placement attempts already marked as requiring review, and attendance uses only persisted first-party attendance states for the exact cohort.',
  },
  fr: {
    eyebrow: 'Analytique formateur',
    title: 'Vue d’ensemble du groupe',
    intro:
      'Agrégats protégés pour ce groupe exactement attribué, dérivés des inscriptions, activités d’apprentissage, certificats, présences et évaluations déjà gouvernées.',
    back: 'Retour au groupe',
    privacyTitle: 'Limite de confidentialité',
    privacyBody:
      'Ces agrégats n’exposent jamais l’identité des apprenants, les réponses ou scores d’évaluation, le contenu psychologique, les demandes, les données financières ou de paiement, les métadonnées privées des certificats, les textes rédigés par les apprenants, les recherches brutes, les identifiants de séance, l’identité de la personne ayant enregistré la présence ou les adresses IP. Aucun classement des apprenants ou formateurs n’est produit.',
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
    attendance: 'Agrégat de présence',
    attendanceRate: 'Taux de présence enregistré',
    attendanceRecords: 'Enregistrements de présence',
    attendedRecords: 'Présent ou en retard',
    absentRecords: 'Absences',
    excusedRecords: 'Absences excusées',
    attendanceBody:
      'Le taux de présence utilise uniquement les états de présence internes des appartenances actuellement éligibles. Présent et en retard comptent comme participation ; absent et excusé restent des comptes agrégés séparés.',
    percent: 'Taux',
    sourceTitle: 'Définition des indicateurs',
    sourceBody:
      'L’achèvement utilise le statut d’inscription au groupe, l’activité récente utilise les traces d’apprentissage de première partie, les certificats utilisent les certificats actifs du programme, la charge de révision compte uniquement les tentatives déjà marquées à réviser et la présence utilise uniquement les états persistés de première partie pour le groupe exact.',
  },
  ar: {
    eyebrow: 'تحليلات المدرّس',
    title: 'نظرة تحليلية على المجموعة',
    intro:
      'مؤشرات مجمّعة ومحميّة لهذه المجموعة المسندة تحديدًا، ومشتقة من سجلات التسجيل والتعلّم والشهادات والحضور والمراجعات المعتمدة الموجودة أصلًا.',
    back: 'العودة إلى المجموعة',
    privacyTitle: 'حدود الخصوصية',
    privacyBody:
      'لا تكشف هذه المؤشرات هوية المتعلمين أو إجابات أو درجات التقييم أو المحتوى النفسي أو الاستفسارات أو البيانات المالية وبيانات الدفع أو البيانات الخاصة للشهادات أو النصوص التي يكتبها المتعلمون أو عبارات البحث الخام أو معرّفات الجلسات أو هوية من سجّل الحضور أو عناوين IP. ولا يتم ترتيب المتعلمين أو المدرّسين.',
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
    attendance: 'مؤشر الحضور المجمّع',
    attendanceRate: 'نسبة الحضور المسجل',
    attendanceRecords: 'سجلات الحضور',
    attendedRecords: 'حاضر أو متأخر',
    absentRecords: 'سجلات الغياب',
    excusedRecords: 'سجلات الغياب بعذر',
    attendanceBody:
      'تعتمد نسبة الحضور فقط على حالات الحضور المسجلة داخل المنصة لعضويات المجموعة المؤهلة حاليًا. ويُحسب الحاضر والمتأخر ضمن الحضور، بينما يبقى الغياب والغياب بعذر كأعداد مجمّعة منفصلة.',
    percent: 'النسبة',
    sourceTitle: 'تعريف المؤشرات',
    sourceBody:
      'يعتمد الإكمال على حالة التسجيل في المجموعة، ويعتمد النشاط الحديث على سجلات التعلّم المباشرة، وتعتمد الشهادات على الشهادات النشطة، ويحسب عبء المراجعة المحاولات المحددة للمراجعة، بينما يعتمد الحضور فقط على حالات الحضور المحفوظة داخل المنصة لهذه المجموعة تحديدًا.',
  },
};

export function getInstructorCohortAnalyticsCopy(locale: Locale) {
  return COPY[locale];
}
