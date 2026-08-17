import type { Locale } from '@luminol/localization';

export type CohortOperationsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  createTitle: string;
  cohortName: string;
  programme: string;
  startsAt: string;
  endsAt: string;
  create: string;
  operationalTitle: string;
  upcoming: string;
  past: string;
  unscheduled: string;
  noUpcoming: string;
  noPast: string;
  noUnscheduled: string;
  cohortsTitle: string;
  status: string;
  schedule: string;
  noSchedule: string;
  instructors: string;
  learners: string;
  assignInstructor: string;
  reassignInstructor: string;
  endAssignment: string;
  instructor: string;
  role: string;
  addOrMoveLearner: string;
  removeLearner: string;
  learner: string;
  joined: string;
  transition: string;
  update: string;
  current: string;
  none: string;
  boundedNotice: string;
  historyNotice: string;
};

const COPY: Record<Locale, CohortOperationsCopy> = {
  en: {
    eyebrow: 'Milestone 18 · Delivery operations',
    title: 'Cohorts and instructor delivery',
    intro:
      'Academy-authorized operations for cohort schedules, instructor assignment history and learner cohort placement. Enrolment remains the learning source of truth.',
    back: 'Back to administration',
    createTitle: 'Create planned cohort',
    cohortName: 'Cohort name',
    programme: 'Programme',
    startsAt: 'Starts',
    endsAt: 'Ends',
    create: 'Create cohort',
    operationalTitle: 'Delivery overview',
    upcoming: 'Upcoming',
    past: 'Past / closed',
    unscheduled: 'Unscheduled',
    noUpcoming: 'No upcoming cohorts in the bounded view.',
    noPast: 'No past or closed cohorts in the bounded view.',
    noUnscheduled: 'No unscheduled cohorts in the bounded view.',
    cohortsTitle: 'Cohort operations',
    status: 'Status',
    schedule: 'Schedule',
    noSchedule: 'Schedule not set',
    instructors: 'Active instructors',
    learners: 'Active cohort learners',
    assignInstructor: 'Assign instructor',
    reassignInstructor: 'Replace assignment',
    endAssignment: 'End assignment',
    instructor: 'Instructor',
    role: 'Role',
    addOrMoveLearner: 'Place / move learner',
    removeLearner: 'Remove from cohort',
    learner: 'Learner enrolment',
    joined: 'Joined',
    transition: 'Move status to',
    update: 'Update',
    current: 'Current',
    none: 'None',
    boundedNotice:
      'Operational lists are deliberately bounded. Use exact cohort records rather than ranking instructors or learners.',
    historyNotice:
      'Reassignment and learner movement end the previous persisted relationship and create a new one; enrolment and course completion records are not rewritten.',
  },
  fr: {
    eyebrow: 'Jalon 18 · Opérations de prestation',
    title: 'Groupes et prestation des formateurs',
    intro:
      'Opérations autorisées par l’académie pour les calendriers des groupes, l’historique des affectations des formateurs et le placement des apprenants. L’inscription reste la source de vérité pédagogique.',
    back: 'Retour à l’administration',
    createTitle: 'Créer un groupe planifié',
    cohortName: 'Nom du groupe',
    programme: 'Programme',
    startsAt: 'Début',
    endsAt: 'Fin',
    create: 'Créer le groupe',
    operationalTitle: 'Vue de la prestation',
    upcoming: 'À venir',
    past: 'Passés / clôturés',
    unscheduled: 'Sans calendrier',
    noUpcoming: 'Aucun groupe à venir dans la vue limitée.',
    noPast: 'Aucun groupe passé ou clôturé dans la vue limitée.',
    noUnscheduled: 'Aucun groupe sans calendrier dans la vue limitée.',
    cohortsTitle: 'Opérations des groupes',
    status: 'Statut',
    schedule: 'Calendrier',
    noSchedule: 'Calendrier non défini',
    instructors: 'Formateurs actifs',
    learners: 'Apprenants actifs du groupe',
    assignInstructor: 'Affecter un formateur',
    reassignInstructor: 'Remplacer l’affectation',
    endAssignment: 'Terminer l’affectation',
    instructor: 'Formateur',
    role: 'Rôle',
    addOrMoveLearner: 'Placer / déplacer un apprenant',
    removeLearner: 'Retirer du groupe',
    learner: 'Inscription apprenant',
    joined: 'Ajouté',
    transition: 'Passer le statut à',
    update: 'Mettre à jour',
    current: 'Actuel',
    none: 'Aucun',
    boundedNotice:
      'Les listes opérationnelles sont volontairement limitées. Utilisez les enregistrements exacts des groupes sans classer les formateurs ni les apprenants.',
    historyNotice:
      'Le remplacement d’un formateur ou le déplacement d’un apprenant clôt la relation persistée précédente et en crée une nouvelle ; les inscriptions et achèvements de cours ne sont pas réécrits.',
  },
  ar: {
    eyebrow: 'المرحلة 18 · عمليات تقديم البرامج',
    title: 'المجموعات وإدارة تقديم المدرّسين',
    intro:
      'عمليات مخوّلة من إدارة الأكاديمية لجداول المجموعات وسجل إسناد المدرّسين ووضع المتعلمين داخل المجموعات. يبقى التسجيل هو مصدر الحقيقة للتعلّم.',
    back: 'العودة إلى الإدارة',
    createTitle: 'إنشاء مجموعة مخططة',
    cohortName: 'اسم المجموعة',
    programme: 'البرنامج',
    startsAt: 'البداية',
    endsAt: 'النهاية',
    create: 'إنشاء المجموعة',
    operationalTitle: 'نظرة على التقديم',
    upcoming: 'قادمة',
    past: 'سابقة / مغلقة',
    unscheduled: 'دون جدول',
    noUpcoming: 'لا توجد مجموعات قادمة ضمن العرض المحدود.',
    noPast: 'لا توجد مجموعات سابقة أو مغلقة ضمن العرض المحدود.',
    noUnscheduled: 'لا توجد مجموعات بلا جدول ضمن العرض المحدود.',
    cohortsTitle: 'عمليات المجموعات',
    status: 'الحالة',
    schedule: 'الجدول',
    noSchedule: 'لم يُحدد الجدول',
    instructors: 'المدرّسون النشطون',
    learners: 'متعلمو المجموعة النشطون',
    assignInstructor: 'إسناد مدرّس',
    reassignInstructor: 'استبدال الإسناد',
    endAssignment: 'إنهاء الإسناد',
    instructor: 'المدرّس',
    role: 'الدور',
    addOrMoveLearner: 'إضافة / نقل متعلم',
    removeLearner: 'إزالة من المجموعة',
    learner: 'تسجيل المتعلم',
    joined: 'تاريخ الانضمام',
    transition: 'نقل الحالة إلى',
    update: 'تحديث',
    current: 'الحالي',
    none: 'لا يوجد',
    boundedNotice:
      'قوائم العمليات محدودة عمدًا. استخدم سجلات المجموعات الدقيقة من دون ترتيب المدرّسين أو المتعلمين.',
    historyNotice:
      'استبدال المدرّس أو نقل المتعلم ينهي العلاقة المحفوظة السابقة وينشئ علاقة جديدة؛ ولا يعيد كتابة سجلات التسجيل أو إكمال المقرر.',
  },
};

export function getCohortOperationsCopy(locale: Locale) {
  return COPY[locale];
}
