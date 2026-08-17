import type { Locale } from '@luminol/localization';

export type InstructorCohortCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  roster: string;
  learners: string;
  course: string;
  assignmentRole: string;
  cohortStatus: string;
  schedule: string;
  starts: string;
  ends: string;
  unscheduled: string;
  learner: string;
  learnerFallback: string;
  joined: string;
  enrollmentStatus: string;
  completedLessons: string;
  inProgressLessons: string;
  latestActivity: string;
  noActivity: string;
  noLearners: string;
  roles: Record<'LEAD' | 'ASSISTANT' | 'REVIEWER', string>;
  cohortStatuses: Record<
    'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    string
  >;
  enrollmentStatuses: Record<
    'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    string
  >;
  privacyTitle: string;
  privacyBody: string;
};

const INSTRUCTOR_COHORT_COPY: Record<Locale, InstructorCohortCopy> = {
  en: {
    eyebrow: 'Assigned cohort',
    title: 'Cohort teaching view',
    intro:
      'This view contains only learners with an active membership in this exact assigned cohort and the minimum learning-status information needed for teaching.',
    back: 'Back to instructor cohorts',
    roster: 'Teaching roster',
    learners: 'Learners',
    course: 'Programme',
    assignmentRole: 'Your role',
    cohortStatus: 'Cohort status',
    schedule: 'Schedule',
    starts: 'Starts',
    ends: 'Ends',
    unscheduled: 'Schedule not set',
    learner: 'Learner',
    learnerFallback: 'Learner',
    joined: 'Joined cohort',
    enrollmentStatus: 'Enrolment status',
    completedLessons: 'Completed lessons',
    inProgressLessons: 'Lessons in progress',
    latestActivity: 'Latest learning activity',
    noActivity: 'No learning activity recorded',
    noLearners: 'No active learner memberships are currently assigned to this cohort.',
    roles: {
      LEAD: 'Lead instructor',
      ASSISTANT: 'Assistant instructor',
      REVIEWER: 'Reviewer',
    },
    cohortStatuses: {
      PLANNED: 'Planned',
      ACTIVE: 'Active',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
    enrollmentStatuses: {
      PENDING: 'Pending',
      ACTIVE: 'Active',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
    privacyTitle: 'Teaching-data boundary',
    privacyBody:
      'Learners are shown in cohort-join order, never ranked by performance. This view does not expose email addresses, assessment answers or scores, psychology content or notes, enquiry messages, personal finance or payment data, private certificate metadata, learner-authored text, raw search queries, session identifiers, IP addresses, or unrelated organization data.',
  },
  fr: {
    eyebrow: 'Groupe attribué',
    title: "Vue d'enseignement du groupe",
    intro:
      "Cette vue contient uniquement les apprenants ayant une appartenance active à ce groupe précisément attribué et les informations minimales d'état d'apprentissage nécessaires à l'enseignement.",
    back: 'Retour aux groupes du formateur',
    roster: "Liste d'enseignement",
    learners: 'Apprenants',
    course: 'Programme',
    assignmentRole: 'Votre rôle',
    cohortStatus: 'Statut du groupe',
    schedule: 'Calendrier',
    starts: 'Début',
    ends: 'Fin',
    unscheduled: 'Calendrier non défini',
    learner: 'Apprenant',
    learnerFallback: 'Apprenant',
    joined: 'Ajouté au groupe',
    enrollmentStatus: "Statut d'inscription",
    completedLessons: 'Leçons terminées',
    inProgressLessons: 'Leçons en cours',
    latestActivity: "Dernière activité d'apprentissage",
    noActivity: "Aucune activité d'apprentissage enregistrée",
    noLearners: "Aucune appartenance active d'apprenant n'est actuellement attribuée à ce groupe.",
    roles: {
      LEAD: 'Formateur principal',
      ASSISTANT: 'Formateur assistant',
      REVIEWER: 'Évaluateur',
    },
    cohortStatuses: {
      PLANNED: 'Planifié',
      ACTIVE: 'Actif',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
    },
    enrollmentStatuses: {
      PENDING: 'En attente',
      ACTIVE: 'Active',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    },
    privacyTitle: "Limite des données d'enseignement",
    privacyBody:
      "Les apprenants sont affichés dans l'ordre d'arrivée dans le groupe et ne sont jamais classés selon leurs performances. Cette vue n'expose pas les adresses e-mail, les réponses ou scores d'évaluation, le contenu ou les notes psychologiques, les messages de demande, les données financières ou de paiement personnelles, les métadonnées privées des certificats, les textes rédigés par les apprenants, les recherches brutes, les identifiants de session, les adresses IP ou les données d'organisations sans rapport.",
  },
  ar: {
    eyebrow: 'مجموعة مسندة',
    title: 'عرض التدريس للمجموعة',
    intro:
      'يعرض هذا القسم فقط المتعلمين ذوي العضوية النشطة في هذه المجموعة المسندة تحديدًا، مع الحد الأدنى من معلومات حالة التعلّم اللازمة للتدريس.',
    back: 'العودة إلى مجموعات المدرّس',
    roster: 'قائمة التدريس',
    learners: 'المتعلمون',
    course: 'البرنامج',
    assignmentRole: 'دورك',
    cohortStatus: 'حالة المجموعة',
    schedule: 'الجدول',
    starts: 'البداية',
    ends: 'النهاية',
    unscheduled: 'لم يُحدد الجدول بعد',
    learner: 'المتعلم',
    learnerFallback: 'متعلم',
    joined: 'تاريخ الانضمام للمجموعة',
    enrollmentStatus: 'حالة التسجيل',
    completedLessons: 'الدروس المكتملة',
    inProgressLessons: 'الدروس قيد التقدم',
    latestActivity: 'آخر نشاط تعلّم',
    noActivity: 'لا يوجد نشاط تعلّم مسجل',
    noLearners: 'لا توجد حاليًا عضويات نشطة لمتعلمين في هذه المجموعة.',
    roles: {
      LEAD: 'المدرّس الرئيسي',
      ASSISTANT: 'المدرّس المساعد',
      REVIEWER: 'المراجع',
    },
    cohortStatuses: {
      PLANNED: 'مخطط',
      ACTIVE: 'نشط',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغى',
    },
    enrollmentStatuses: {
      PENDING: 'قيد الانتظار',
      ACTIVE: 'نشط',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغى',
    },
    privacyTitle: 'حدود بيانات التدريس',
    privacyBody:
      'يظهر المتعلمون حسب ترتيب الانضمام إلى المجموعة، ولا يتم ترتيبهم أبدًا حسب الأداء. لا يعرض هذا القسم عناوين البريد الإلكتروني أو إجابات التقييم ودرجاته أو المحتوى أو الملاحظات النفسية أو رسائل الاستفسارات أو البيانات المالية أو تفاصيل الدفع الشخصية أو البيانات الخاصة للشهادات أو النصوص التي يكتبها المتعلمون أو عبارات البحث الخام أو معرّفات الجلسات أو عناوين IP أو بيانات مؤسسات غير مرتبطة.',
  },
};

export function getInstructorCohortCopy(locale: Locale): InstructorCohortCopy {
  return INSTRUCTOR_COHORT_COPY[locale];
}
