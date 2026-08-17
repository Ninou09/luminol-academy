import type { Locale } from '@luminol/localization';

export type InstructorWorkspaceCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  assignedCohorts: string;
  activeCohorts: string;
  plannedCohorts: string;
  role: string;
  status: string;
  course: string;
  schedule: string;
  unscheduled: string;
  starts: string;
  ends: string;
  noCohorts: string;
  roles: Record<'LEAD' | 'ASSISTANT' | 'REVIEWER', string>;
  statuses: Record<'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED', string>;
  privacyTitle: string;
  privacyBody: string;
};

const INSTRUCTOR_WORKSPACE_COPY: Record<Locale, InstructorWorkspaceCopy> = {
  en: {
    nav: 'Instructor',
    eyebrow: 'Teaching workspace',
    title: 'Instructor cohorts',
    intro:
      'Only cohorts explicitly assigned to your synchronized account appear here. Course and cohort access is resolved server-side from persisted assignments.',
    assignedCohorts: 'Assigned cohorts',
    activeCohorts: 'Active cohorts',
    plannedCohorts: 'Planned cohorts',
    role: 'Assignment role',
    status: 'Cohort status',
    course: 'Programme',
    schedule: 'Schedule',
    unscheduled: 'Schedule not set',
    starts: 'Starts',
    ends: 'Ends',
    noCohorts: 'No active instructor cohort assignments are available.',
    roles: {
      LEAD: 'Lead instructor',
      ASSISTANT: 'Assistant instructor',
      REVIEWER: 'Reviewer',
    },
    statuses: {
      PLANNED: 'Planned',
      ACTIVE: 'Active',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
    privacyTitle: 'Instructor access boundary',
    privacyBody:
      'This workspace does not grant academy administration or organization-manager authority. It does not expose psychology content or notes, enquiry messages, personal finance or payment data, private certificate metadata, raw learner-authored text, raw search queries, session identifiers, IP addresses, or unrelated organization data. Access to a cohort exists only while an exact persisted instructor assignment is active.',
  },
  fr: {
    nav: 'Formateur',
    eyebrow: "Espace d'enseignement",
    title: 'Groupes du formateur',
    intro:
      'Seuls les groupes explicitement attribués à votre compte synchronisé apparaissent ici. L’accès au programme et au groupe est résolu côté serveur à partir des affectations persistées.',
    assignedCohorts: 'Groupes attribués',
    activeCohorts: 'Groupes actifs',
    plannedCohorts: 'Groupes planifiés',
    role: "Rôle d'affectation",
    status: 'Statut du groupe',
    course: 'Programme',
    schedule: 'Calendrier',
    unscheduled: 'Calendrier non défini',
    starts: 'Début',
    ends: 'Fin',
    noCohorts: "Aucune affectation active de groupe n'est disponible.",
    roles: {
      LEAD: 'Formateur principal',
      ASSISTANT: 'Formateur assistant',
      REVIEWER: 'Évaluateur',
    },
    statuses: {
      PLANNED: 'Planifié',
      ACTIVE: 'Actif',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
    },
    privacyTitle: "Limite d'accès du formateur",
    privacyBody:
      "Cet espace n'accorde aucun droit d'administration de l'académie ni de gestion d'organisation. Il n'expose pas le contenu ou les notes psychologiques, les messages de demande, les données financières ou de paiement personnelles, les métadonnées privées des certificats, les textes bruts rédigés par les apprenants, les recherches brutes, les identifiants de session, les adresses IP ou les données d'organisations sans rapport. L'accès à un groupe existe uniquement tant qu'une affectation persistée exacte du formateur est active.",
  },
  ar: {
    nav: 'المدرّس',
    eyebrow: 'مساحة التدريس',
    title: 'مجموعات المدرّس',
    intro:
      'تظهر هنا فقط المجموعات المسندة صراحةً إلى حسابك المتزامن. تُحسم صلاحية الوصول إلى البرنامج والمجموعة على الخادم اعتمادًا على الإسنادات المحفوظة.',
    assignedCohorts: 'المجموعات المسندة',
    activeCohorts: 'المجموعات النشطة',
    plannedCohorts: 'المجموعات المخططة',
    role: 'دور الإسناد',
    status: 'حالة المجموعة',
    course: 'البرنامج',
    schedule: 'الجدول',
    unscheduled: 'لم يُحدد الجدول بعد',
    starts: 'البداية',
    ends: 'النهاية',
    noCohorts: 'لا توجد حاليًا إسنادات نشطة لمجموعات تدريس.',
    roles: {
      LEAD: 'المدرّس الرئيسي',
      ASSISTANT: 'المدرّس المساعد',
      REVIEWER: 'المراجع',
    },
    statuses: {
      PLANNED: 'مخطط',
      ACTIVE: 'نشط',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغى',
    },
    privacyTitle: 'حدود صلاحية المدرّس',
    privacyBody:
      'لا تمنح هذه المساحة صلاحيات إدارة الأكاديمية أو إدارة المؤسسات. ولا تعرض المحتوى أو الملاحظات النفسية أو رسائل الاستفسارات أو البيانات المالية أو تفاصيل الدفع الشخصية أو البيانات الخاصة للشهادات أو النصوص الخام التي يكتبها المتعلمون أو عبارات البحث الخام أو معرّفات الجلسات أو عناوين IP أو بيانات مؤسسات غير مرتبطة. لا توجد صلاحية الوصول إلى أي مجموعة إلا أثناء وجود إسناد دقيق ومحفوظ ونشط للمدرّس.',
  },
};

export function getInstructorWorkspaceCopy(
  locale: Locale,
): InstructorWorkspaceCopy {
  return INSTRUCTOR_WORKSPACE_COPY[locale];
}
