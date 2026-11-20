import type { Locale } from '@luminol/localization';
import type {
  OperationsTaskKindValue,
  OperationsTaskPriorityValue,
  OperationsTaskStatusValue,
} from '@luminol/validation/operations-tasks';

export const operationsTaskFeedbackCodes = [
  'not-found',
  'forbidden',
  'ineligible-assignee',
  'stale',
  'transition',
  'invalid',
] as const;
export type OperationsTaskFeedbackCode =
  (typeof operationsTaskFeedbackCodes)[number];

export function parseOperationsTaskFeedback(
  value: string | string[] | undefined,
): OperationsTaskFeedbackCode | null {
  return typeof value === 'string' &&
    (operationsTaskFeedbackCodes as readonly string[]).includes(value)
    ? (value as OperationsTaskFeedbackCode)
    : null;
}

export type OperationsTasksCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  approvalBoundary: string;
  createTaskTitle: string;
  requestApprovalTitle: string;
  requestApprovalIntro: string;
  titleLabel: string;
  detailsLabel: string;
  assigneeLabel: string;
  dueLabel: string;
  priorityLabel: string;
  createTask: string;
  requestApproval: string;
  openTasksTitle: string;
  noOpenTasks: string;
  approvalsTitle: string;
  noApprovals: string;
  closedTitle: string;
  noClosed: string;
  overdue: string;
  noDueDate: string;
  assignedTo: string;
  requestedBy: string;
  decisionNoteLabel: string;
  decidedBy: string;
  saved: string;
  kind: Record<OperationsTaskKindValue, string>;
  status: Record<OperationsTaskStatusValue, string>;
  priority: Record<OperationsTaskPriorityValue, string>;
  moveTo: Record<OperationsTaskStatusValue, string>;
  feedback: Record<OperationsTaskFeedbackCode, string>;
};

export type TodayCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  appointmentsTitle: string;
  noAppointments: string;
  paymentsTitle: string;
  paymentsToday: (amount: string, count: string) => string;
  followUpsTitle: string;
  followUpsIntro: string;
  noFollowUps: string;
  tasksTitle: string;
  noTasks: string;
  approvalsTitle: string;
  myRequestsTitle: string;
  noApprovals: string;
  openWorkspace: string;
  kpiNewLeads: string;
  kpiConsultations: string;
  kpiDecisions: string;
  kpiMonthRevenue: string;
  kpiReceivedToday: (amount: string) => string;
  upcomingTitle: string;
  noUpcoming: string;
  upcomingFill: (taken: string, capacity: string) => string;
  rulesTitle: string;
  rules: readonly string[];
};

const english: OperationsTasksCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Tasks and approvals',
  intro:
    'Keep daily work in one list. Ask the owner before anything that publishes, messages a group, schedules outreach or spends money.',
  approvalBoundary:
    'Approving here records the decision only. Nothing is posted, sent or paid automatically.',
  createTaskTitle: 'New task',
  requestApprovalTitle: 'Request owner approval',
  requestApprovalIntro:
    'Describe exactly what will happen, e.g. one WhatsApp group post with the final text.',
  titleLabel: 'Title',
  detailsLabel: 'Details',
  assigneeLabel: 'Assigned to',
  dueLabel: 'Due date',
  priorityLabel: 'Priority',
  createTask: 'Add task',
  requestApproval: 'Send request',
  openTasksTitle: 'Open tasks',
  noOpenTasks: 'No open tasks.',
  approvalsTitle: 'Approval requests',
  noApprovals: 'No pending approval requests.',
  closedTitle: 'Recently closed',
  noClosed: 'Nothing closed yet.',
  overdue: 'Overdue',
  noDueDate: 'No due date',
  assignedTo: 'Assigned to',
  requestedBy: 'Requested by',
  decisionNoteLabel: 'Decision note (optional)',
  decidedBy: 'Decided by',
  saved: 'Saved.',
  kind: { TASK: 'Task', APPROVAL: 'Approval request' },
  status: {
    OPEN: 'Open',
    DONE: 'Done',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  },
  priority: { HIGH: 'High', NORMAL: 'Normal', LOW: 'Low' },
  moveTo: {
    OPEN: 'Reopen',
    DONE: 'Mark done',
    APPROVED: 'Approve',
    REJECTED: 'Reject',
    CANCELLED: 'Cancel',
  },
  feedback: {
    'not-found': 'That task is not available in your workspace.',
    forbidden: 'Your role cannot make this change.',
    'ineligible-assignee': 'Choose an active staff member.',
    stale: 'This task changed meanwhile. Review it and try again.',
    transition: 'That change is not allowed for this item.',
    invalid: 'Some fields are missing or invalid. Check the form and retry.',
  },
};

const french: OperationsTasksCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Tâches et validations',
  intro:
    'Regroupez le travail quotidien dans une liste. Demandez l’accord du propriétaire avant toute publication, message de groupe, relance planifiée ou dépense.',
  approvalBoundary:
    'Valider ici enregistre seulement la décision. Rien n’est publié, envoyé ou payé automatiquement.',
  createTaskTitle: 'Nouvelle tâche',
  requestApprovalTitle: 'Demander l’accord du propriétaire',
  requestApprovalIntro:
    'Décrivez précisément ce qui sera fait, ex. un message dans le groupe WhatsApp avec le texte final.',
  titleLabel: 'Titre',
  detailsLabel: 'Détails',
  assigneeLabel: 'Assignée à',
  dueLabel: 'Échéance',
  priorityLabel: 'Priorité',
  createTask: 'Ajouter la tâche',
  requestApproval: 'Envoyer la demande',
  openTasksTitle: 'Tâches ouvertes',
  noOpenTasks: 'Aucune tâche ouverte.',
  approvalsTitle: 'Demandes de validation',
  noApprovals: 'Aucune demande en attente.',
  closedTitle: 'Clôturées récemment',
  noClosed: 'Rien de clôturé pour le moment.',
  overdue: 'En retard',
  noDueDate: 'Sans échéance',
  assignedTo: 'Assignée à',
  requestedBy: 'Demandée par',
  decisionNoteLabel: 'Note de décision (facultatif)',
  decidedBy: 'Décidée par',
  saved: 'Enregistré.',
  kind: { TASK: 'Tâche', APPROVAL: 'Demande de validation' },
  status: {
    OPEN: 'Ouverte',
    DONE: 'Faite',
    APPROVED: 'Approuvée',
    REJECTED: 'Refusée',
    CANCELLED: 'Annulée',
  },
  priority: { HIGH: 'Haute', NORMAL: 'Normale', LOW: 'Basse' },
  moveTo: {
    OPEN: 'Rouvrir',
    DONE: 'Marquer faite',
    APPROVED: 'Approuver',
    REJECTED: 'Refuser',
    CANCELLED: 'Annuler',
  },
  feedback: {
    'not-found': 'Cette tâche n’est pas disponible dans votre espace.',
    forbidden: 'Votre rôle ne permet pas cette modification.',
    'ineligible-assignee': 'Choisissez un membre actif de l’équipe.',
    stale: 'Cette tâche a été modifiée entre-temps. Vérifiez puis réessayez.',
    transition: 'Ce changement n’est pas autorisé.',
    invalid:
      'Certains champs manquent ou sont invalides. Vérifiez le formulaire.',
  },
};

const arabic: OperationsTasksCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'المهام والموافقات',
  intro:
    'اجمع العمل اليومي في قائمة واحدة. اطلب موافقة المالك قبل أي نشر أو رسالة جماعية أو جدولة متابعة أو إنفاق.',
  approvalBoundary:
    'الموافقة هنا تسجّل القرار فقط. لا يُنشر ولا يُرسل ولا يُدفع أي شيء تلقائيًا.',
  createTaskTitle: 'مهمة جديدة',
  requestApprovalTitle: 'طلب موافقة المالك',
  requestApprovalIntro:
    'صف بدقة ما سيحدث، مثل منشور واحد في مجموعة واتساب مع النص النهائي.',
  titleLabel: 'العنوان',
  detailsLabel: 'التفاصيل',
  assigneeLabel: 'مسندة إلى',
  dueLabel: 'تاريخ الاستحقاق',
  priorityLabel: 'الأولوية',
  createTask: 'إضافة المهمة',
  requestApproval: 'إرسال الطلب',
  openTasksTitle: 'المهام المفتوحة',
  noOpenTasks: 'لا مهام مفتوحة.',
  approvalsTitle: 'طلبات الموافقة',
  noApprovals: 'لا طلبات موافقة معلّقة.',
  closedTitle: 'أُغلقت مؤخرًا',
  noClosed: 'لا شيء مغلق بعد.',
  overdue: 'متأخرة',
  noDueDate: 'بدون تاريخ',
  assignedTo: 'مسندة إلى',
  requestedBy: 'طلبها',
  decisionNoteLabel: 'ملاحظة القرار (اختياري)',
  decidedBy: 'قرّرها',
  saved: 'تم الحفظ.',
  kind: { TASK: 'مهمة', APPROVAL: 'طلب موافقة' },
  status: {
    OPEN: 'مفتوحة',
    DONE: 'منجزة',
    APPROVED: 'موافق عليها',
    REJECTED: 'مرفوضة',
    CANCELLED: 'ملغاة',
  },
  priority: { HIGH: 'عالية', NORMAL: 'عادية', LOW: 'منخفضة' },
  moveTo: {
    OPEN: 'إعادة فتح',
    DONE: 'تم الإنجاز',
    APPROVED: 'موافقة',
    REJECTED: 'رفض',
    CANCELLED: 'إلغاء',
  },
  feedback: {
    'not-found': 'هذه المهمة غير متاحة في مساحة عملك.',
    forbidden: 'دورك لا يسمح بهذا التعديل.',
    'ineligible-assignee': 'اختر عضوًا نشطًا في الفريق.',
    stale: 'تم تعديل هذه المهمة في الأثناء. راجعها ثم أعد المحاولة.',
    transition: 'هذا التغيير غير مسموح.',
    invalid: 'بعض الحقول ناقصة أو غير صحيحة. راجع النموذج وأعد المحاولة.',
  },
};

const englishToday: TodayCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Today',
  intro: 'What needs your attention today, limited to your own workspaces.',
  appointmentsTitle: 'Consultations today',
  noAppointments: 'No consultations today.',
  paymentsTitle: 'Payments received today',
  paymentsToday: (amount, count) => `${amount} · ${count} payments`,
  followUpsTitle: 'Follow-ups due',
  followUpsIntro: 'Consented enquiries whose follow-up date has arrived.',
  noFollowUps: 'No follow-ups due.',
  tasksTitle: 'Upcoming tasks',
  noTasks: 'No tasks in the next 7 days.',
  approvalsTitle: 'Waiting for your decision',
  myRequestsTitle: 'Your pending requests',
  noApprovals: 'Nothing pending.',
  openWorkspace: 'Open',
  kpiNewLeads: 'New leads to contact',
  kpiConsultations: 'Consultations in the next 7 days',
  kpiDecisions: 'Decisions waiting',
  kpiMonthRevenue: 'Received this month',
  kpiReceivedToday: (amount) => `Today ${amount}`,
  upcomingTitle: 'Upcoming programmes and events',
  noUpcoming: 'No dated offers coming up.',
  upcomingFill: (taken, capacity) => `${taken} / ${capacity} places`,
  rulesTitle: 'Standing rules',
  rules: [
    'Nothing is published, messaged, scheduled or paid without the owner’s approval; approving records the decision only.',
    'Contact only people who agreed to be contacted.',
    'Notes stay operational — never clinical or personal details.',
    'Prices are shown only once confirmed; nothing is invented.',
  ],
};

const frenchToday: TodayCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Aujourd’hui',
  intro:
    'Ce qui demande votre attention aujourd’hui, limité à vos propres espaces.',
  appointmentsTitle: 'Consultations du jour',
  noAppointments: 'Aucune consultation aujourd’hui.',
  paymentsTitle: 'Encaissé aujourd’hui',
  paymentsToday: (amount, count) => `${amount} · ${count} paiements`,
  followUpsTitle: 'Relances dues',
  followUpsIntro:
    'Demandes avec consentement dont la date de relance est arrivée.',
  noFollowUps: 'Aucune relance due.',
  tasksTitle: 'Tâches proches',
  noTasks: 'Aucune tâche dans les 7 prochains jours.',
  approvalsTitle: 'En attente de votre décision',
  myRequestsTitle: 'Vos demandes en attente',
  noApprovals: 'Rien en attente.',
  openWorkspace: 'Ouvrir',
  kpiNewLeads: 'Nouveaux prospects à contacter',
  kpiConsultations: 'Consultations sous 7 jours',
  kpiDecisions: 'Décisions en attente',
  kpiMonthRevenue: 'Encaissé ce mois',
  kpiReceivedToday: (amount) => `Aujourd’hui ${amount}`,
  upcomingTitle: 'Programmes et événements à venir',
  noUpcoming: 'Aucune offre datée à venir.',
  upcomingFill: (taken, capacity) => `${taken} / ${capacity} places`,
  rulesTitle: 'Règles permanentes',
  rules: [
    'Aucune publication, message, planification ou dépense sans l’accord de la direction ; approuver enregistre seulement la décision.',
    'Contacter uniquement les personnes qui l’ont accepté.',
    'Les notes restent opérationnelles — jamais d’informations cliniques ou personnelles.',
    'Les prix ne s’affichent qu’une fois confirmés ; rien n’est inventé.',
  ],
};

const arabicToday: TodayCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'اليوم',
  intro: 'ما يحتاج انتباهك اليوم، ضمن مساحات عملك فقط.',
  appointmentsTitle: 'استشارات اليوم',
  noAppointments: 'لا استشارات اليوم.',
  paymentsTitle: 'المستلم اليوم',
  paymentsToday: (amount, count) => `${amount} · ${count} دفعات`,
  followUpsTitle: 'متابعات مستحقة',
  followUpsIntro: 'طلبات بموافقة على الاتصال حلّ تاريخ متابعتها.',
  noFollowUps: 'لا متابعات مستحقة.',
  tasksTitle: 'مهام قريبة',
  noTasks: 'لا مهام خلال 7 أيام.',
  approvalsTitle: 'بانتظار قرارك',
  myRequestsTitle: 'طلباتك المعلّقة',
  noApprovals: 'لا شيء معلّق.',
  openWorkspace: 'فتح',
  kpiNewLeads: 'عملاء جدد للتواصل',
  kpiConsultations: 'استشارات خلال 7 أيام',
  kpiDecisions: 'قرارات معلّقة',
  kpiMonthRevenue: 'المستلم هذا الشهر',
  kpiReceivedToday: (amount) => `اليوم ${amount}`,
  upcomingTitle: 'البرامج والفعاليات القادمة',
  noUpcoming: 'لا عروض مؤرّخة قادمة.',
  upcomingFill: (taken, capacity) => `${taken} / ${capacity} مقاعد`,
  rulesTitle: 'قواعد دائمة',
  rules: [
    'لا نشر ولا رسائل ولا جدولة ولا إنفاق دون موافقة الإدارة؛ والموافقة تسجّل القرار فقط.',
    'التواصل فقط مع من وافق على ذلك.',
    'الملاحظات تشغيلية فقط — دون معلومات سريرية أو شخصية.',
    'لا تظهر الأسعار إلا بعد تأكيدها؛ لا شيء مختلق.',
  ],
};

const taskCopies: Record<Locale, OperationsTasksCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};
const todayCopies: Record<Locale, TodayCopy> = {
  en: englishToday,
  fr: frenchToday,
  ar: arabicToday,
};

export function getOperationsTasksCopy(locale: Locale): OperationsTasksCopy {
  return taskCopies[locale];
}

export function getTodayCopy(locale: Locale): TodayCopy {
  return todayCopies[locale];
}
