import type { Locale } from '@luminol/localization';

export type EnquiryDeskCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  filterByStatus: string;
  filterByFollowUp: string;
  all: string;
  allFollowUps: string;
  dueToday: string;
  overdue: string;
  enquiries: string;
  received: string;
  contact: string;
  email: string;
  call: string;
  noPhone: string;
  school: string;
  language: string;
  source: string;
  owner: string;
  unassigned: string;
  assignedToYou: string;
  assignToMe: string;
  unassign: string;
  message: string;
  protectedMessage: string;
  followUpPlan: string;
  nextFollowUp: string;
  noFollowUp: string;
  nextAction: string;
  noNextAction: string;
  saveFollowUp: string;
  clearFollowUp: string;
  updateStatus: string;
  moveTo: string;
  update: string;
  noMatches: string;
};

const ENQUIRY_DESK_COPY: Record<Locale, EnquiryDeskCopy> = {
  en: {
    eyebrow: 'Growth operations',
    title: 'Enquiry follow-up desk',
    intro:
      'Review the submitted context, assign ownership, schedule the next action, contact the lead, and move each enquiry through the audited workflow.',
    back: 'Back to overview',
    filterByStatus: 'Filter by status',
    filterByFollowUp: 'Filter by follow-up',
    all: 'All',
    allFollowUps: 'Any follow-up',
    dueToday: 'Due today',
    overdue: 'Overdue',
    enquiries: 'enquiries',
    received: 'Received',
    contact: 'Contact',
    email: 'Email',
    call: 'Call',
    noPhone: 'No phone provided',
    school: 'School',
    language: 'Language',
    source: 'Source',
    owner: 'Owner',
    unassigned: 'Unassigned',
    assignedToYou: 'Assigned to you',
    assignToMe: 'Assign to me',
    unassign: 'Unassign',
    message: 'Message',
    protectedMessage:
      'Protected enquiry message — use only for operational follow-up.',
    followUpPlan: 'Next follow-up plan',
    nextFollowUp: 'Follow-up date',
    noFollowUp: 'No follow-up scheduled',
    nextAction: 'Next action',
    noNextAction: 'No next action recorded',
    saveFollowUp: 'Save follow-up',
    clearFollowUp: 'Clear follow-up',
    updateStatus: 'Update enquiry status',
    moveTo: 'Move to…',
    update: 'Update',
    noMatches: 'No enquiries match these filters.',
  },
  fr: {
    eyebrow: 'Opérations de développement',
    title: 'Suivi des demandes',
    intro:
      'Consultez le contexte transmis, attribuez un responsable, planifiez la prochaine action, contactez le prospect et faites avancer chaque demande dans le flux audité.',
    back: 'Retour à la vue d’ensemble',
    filterByStatus: 'Filtrer par statut',
    filterByFollowUp: 'Filtrer par suivi',
    all: 'Toutes',
    allFollowUps: 'Tous les suivis',
    dueToday: 'À faire aujourd’hui',
    overdue: 'En retard',
    enquiries: 'demandes',
    received: 'Reçue le',
    contact: 'Contact',
    email: 'E-mail',
    call: 'Appeler',
    noPhone: 'Aucun téléphone fourni',
    school: 'Pôle',
    language: 'Langue',
    source: 'Source',
    owner: 'Responsable',
    unassigned: 'Non attribuée',
    assignedToYou: 'Attribuée à vous',
    assignToMe: 'Me l’attribuer',
    unassign: 'Désattribuer',
    message: 'Message',
    protectedMessage:
      'Message de demande protégé — à utiliser uniquement pour le suivi opérationnel.',
    followUpPlan: 'Prochain suivi',
    nextFollowUp: 'Date de suivi',
    noFollowUp: 'Aucun suivi planifié',
    nextAction: 'Prochaine action',
    noNextAction: 'Aucune prochaine action enregistrée',
    saveFollowUp: 'Enregistrer le suivi',
    clearFollowUp: 'Effacer le suivi',
    updateStatus: 'Modifier le statut de la demande',
    moveTo: 'Passer à…',
    update: 'Mettre à jour',
    noMatches: 'Aucune demande ne correspond à ces filtres.',
  },
  ar: {
    eyebrow: 'عمليات النمو',
    title: 'مكتب متابعة الطلبات',
    intro:
      'راجع المعلومات المرسلة، وحدد مسؤول المتابعة، وخطط للخطوة التالية، وتواصل مع صاحب الطلب، ثم انقل الطلب عبر المسار الموثق.',
    back: 'العودة إلى النظرة العامة',
    filterByStatus: 'التصفية حسب الحالة',
    filterByFollowUp: 'التصفية حسب المتابعة',
    all: 'الكل',
    allFollowUps: 'كل مواعيد المتابعة',
    dueToday: 'مستحق اليوم',
    overdue: 'متأخر',
    enquiries: 'طلبات',
    received: 'تاريخ الاستلام',
    contact: 'التواصل',
    email: 'البريد الإلكتروني',
    call: 'اتصال',
    noPhone: 'لم يتم تقديم رقم هاتف',
    school: 'المجال',
    language: 'اللغة',
    source: 'المصدر',
    owner: 'مسؤول المتابعة',
    unassigned: 'غير مسند',
    assignedToYou: 'مسند إليك',
    assignToMe: 'إسناده إليّ',
    unassign: 'إلغاء الإسناد',
    message: 'الرسالة',
    protectedMessage:
      'رسالة طلب محمية — تُستخدم فقط لأغراض المتابعة التشغيلية.',
    followUpPlan: 'خطة المتابعة التالية',
    nextFollowUp: 'تاريخ المتابعة',
    noFollowUp: 'لا توجد متابعة مجدولة',
    nextAction: 'الخطوة التالية',
    noNextAction: 'لم تُسجل خطوة تالية',
    saveFollowUp: 'حفظ المتابعة',
    clearFollowUp: 'مسح المتابعة',
    updateStatus: 'تحديث حالة الطلب',
    moveTo: 'نقل إلى…',
    update: 'تحديث',
    noMatches: 'لا توجد طلبات تطابق هذه الفلاتر.',
  },
};

export function getEnquiryDeskCopy(locale: Locale): EnquiryDeskCopy {
  return ENQUIRY_DESK_COPY[locale];
}
