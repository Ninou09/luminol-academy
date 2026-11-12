import type { Locale } from '@luminol/localization';
import type {
  CrmActivityDirectionValue,
  CrmActivityOutcomeValue,
  CrmActivityTypeValue,
} from '@luminol/validation/crm-activities';

export const crmFeedbackCodes = [
  'not-found',
  'forbidden',
  'consent-required',
  'direction-required',
  'occurred-at',
  'invalid',
] as const;
export type CrmFeedbackCode = (typeof crmFeedbackCodes)[number];

export function parseCrmFeedback(
  value: string | string[] | undefined,
): CrmFeedbackCode | null {
  return typeof value === 'string' &&
    (crmFeedbackCodes as readonly string[]).includes(value)
    ? (value as CrmFeedbackCode)
    : null;
}

export type CrmCopy = {
  eyebrow: string;
  searchTitle: string;
  searchIntro: string;
  searchTooShort: string;
  noResults: string;
  leads: string;
  contacts: string;
  receipts: string;
  lead: string;
  contact: string;
  open: string;
  details: string;
  email: string;
  phone: string;
  city: string;
  school: string;
  programme: string;
  preferredContact: string;
  delivery: string;
  timing: string;
  source: string;
  campaign: string;
  received: string;
  owner: string;
  unassigned: string;
  assignToMe: string;
  unassign: string;
  consent: string;
  consentYes: string;
  consentNo: string;
  consentHint: string;
  stage: string;
  moveTo: string;
  followUp: string;
  followUpOn: string;
  nextAction: string;
  saveFollowUp: string;
  clearFollowUp: string;
  noFollowUp: string;
  outcome: string;
  saveOutcome: string;
  noOutcome: string;
  message: string;
  convert: string;
  convertedTo: string;
  openEnquiryDesk: string;
  logActivity: string;
  activityType: string;
  direction: string;
  activityOutcome: string;
  summary: string;
  summaryHint: string;
  occurredOn: string;
  log: string;
  timeline: string;
  noTimeline: string;
  appointments: string;
  noAppointments: string;
  payments: string;
  noPayments: string;
  tasks: string;
  noTasks: string;
  addTask: string;
  taskTitle: string;
  dueOn: string;
  bookConsultation: string;
  recordPayment: string;
  editContact: string;
  sourceEnquiry: string;
  paidTotal: string;
  saved: string;
  timelineTitle: {
    enquiryReceived: string;
    status: (from: string, to: string) => string;
    ownerAssigned: (name: string) => string;
    ownerCleared: string;
    followUpSet: (date: string) => string;
    followUpCleared: string;
    outcomeSet: string;
    outcomeCleared: string;
    clientCreated: string;
    appointment: (status: string) => string;
    payment: (receipt: string) => string;
    task: (status: string) => string;
  };
  activityTypeLabel: Record<CrmActivityTypeValue, string>;
  directionLabel: Record<CrmActivityDirectionValue, string>;
  outcomeLabel: Record<CrmActivityOutcomeValue, string>;
  feedback: Record<CrmFeedbackCode, string>;
};

const english: CrmCopy = {
  eyebrow: 'Luminol CRM',
  searchTitle: 'Search',
  searchIntro:
    'Results include only the leads, contacts and receipts your role can see.',
  searchTooShort: 'Type at least two characters.',
  noResults: 'No matching records.',
  leads: 'Leads',
  contacts: 'Contacts',
  receipts: 'Receipts',
  lead: 'Lead',
  contact: 'Contact',
  open: 'Open',
  details: 'Details',
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  school: 'School',
  programme: 'Programme',
  preferredContact: 'Preferred contact',
  delivery: 'Format',
  timing: 'Timing',
  source: 'Source',
  campaign: 'Campaign',
  received: 'Received',
  owner: 'Owner',
  unassigned: 'Unassigned',
  assignToMe: 'Assign to me',
  unassign: 'Unassign',
  consent: 'Contact consent',
  consentYes: 'Agreed to be contacted',
  consentNo: 'No contact consent — log inbound conversations and notes only',
  consentHint:
    'Outbound calls, WhatsApp and email are refused without consent.',
  stage: 'Stage',
  moveTo: 'Move to',
  followUp: 'Follow-up plan',
  followUpOn: 'Follow up on',
  nextAction: 'Next action',
  saveFollowUp: 'Save plan',
  clearFollowUp: 'Clear plan',
  noFollowUp: 'No follow-up planned.',
  outcome: 'Outcome',
  saveOutcome: 'Save outcome',
  noOutcome: 'No outcome recorded.',
  message: 'Enquiry message',
  convert: 'Create contact from this lead',
  convertedTo: 'Contact record',
  openEnquiryDesk: 'Open in enquiry desk',
  logActivity: 'Log an activity',
  activityType: 'Type',
  direction: 'Direction',
  activityOutcome: 'Result',
  summary: 'Summary',
  summaryHint: 'Operational facts only. No clinical observations.',
  occurredOn: 'When',
  log: 'Log activity',
  timeline: 'Timeline',
  noTimeline: 'Nothing recorded yet.',
  appointments: 'Consultations',
  noAppointments: 'No consultations yet.',
  payments: 'Payments',
  noPayments: 'No payments yet.',
  tasks: 'Tasks',
  noTasks: 'No tasks linked to this contact.',
  addTask: 'Add task',
  taskTitle: 'Task',
  dueOn: 'Due',
  bookConsultation: 'Book consultation',
  recordPayment: 'Record payment',
  editContact: 'Edit contact',
  sourceEnquiry: 'Original enquiry',
  paidTotal: 'Paid in total',
  saved: 'Saved.',
  timelineTitle: {
    enquiryReceived: 'Enquiry received',
    status: (from, to) => `Stage changed: ${from} → ${to}`,
    ownerAssigned: (name) => `Assigned to ${name}`,
    ownerCleared: 'Owner removed',
    followUpSet: (date) => `Follow-up planned for ${date}`,
    followUpCleared: 'Follow-up plan cleared',
    outcomeSet: 'Outcome recorded',
    outcomeCleared: 'Outcome cleared',
    clientCreated: 'Contact record created',
    appointment: (status) => `Consultation · ${status}`,
    payment: (receipt) => `Payment ${receipt}`,
    task: (status) => `Task · ${status}`,
  },
  activityTypeLabel: {
    CALL: 'Call',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'Email',
    MEETING: 'Meeting',
    NOTE: 'Note',
  },
  directionLabel: { INBOUND: 'Inbound', OUTBOUND: 'Outbound' },
  outcomeLabel: {
    REACHED: 'Reached',
    NO_ANSWER: 'No answer',
    LEFT_MESSAGE: 'Left a message',
    BOOKED: 'Booked',
    NOT_INTERESTED: 'Not interested',
    OTHER: 'Other',
  },
  feedback: {
    'not-found': 'That record is not available in your workspace.',
    forbidden: 'Your role cannot make this change.',
    'consent-required':
      'This person has not agreed to be contacted. Log an inbound conversation or a note instead.',
    'direction-required':
      'Choose whether the conversation was inbound or outbound.',
    'occurred-at':
      'Activities must be within the last 90 days and not in the future.',
    invalid: 'Some fields are missing or invalid. Check the form and retry.',
  },
};

const french: CrmCopy = {
  eyebrow: 'CRM Luminol',
  searchTitle: 'Recherche',
  searchIntro:
    'Les résultats incluent uniquement les prospects, contacts et reçus que votre rôle peut voir.',
  searchTooShort: 'Saisissez au moins deux caractères.',
  noResults: 'Aucun résultat.',
  leads: 'Prospects',
  contacts: 'Contacts',
  receipts: 'Reçus',
  lead: 'Prospect',
  contact: 'Contact',
  open: 'Ouvrir',
  details: 'Détails',
  email: 'E-mail',
  phone: 'Téléphone',
  city: 'Ville',
  school: 'École',
  programme: 'Programme',
  preferredContact: 'Contact préféré',
  delivery: 'Format',
  timing: 'Échéance',
  source: 'Source',
  campaign: 'Campagne',
  received: 'Reçue',
  owner: 'Responsable',
  unassigned: 'Non attribuée',
  assignToMe: 'M’attribuer',
  unassign: 'Retirer',
  consent: 'Consentement',
  consentYes: 'Accepte d’être contacté(e)',
  consentNo:
    'Pas de consentement — enregistrez seulement les échanges entrants et les notes',
  consentHint:
    'Appels, WhatsApp et e-mails sortants sont refusés sans consentement.',
  stage: 'Étape',
  moveTo: 'Passer à',
  followUp: 'Plan de relance',
  followUpOn: 'Relancer le',
  nextAction: 'Prochaine action',
  saveFollowUp: 'Enregistrer',
  clearFollowUp: 'Effacer',
  noFollowUp: 'Aucune relance prévue.',
  outcome: 'Résultat',
  saveOutcome: 'Enregistrer le résultat',
  noOutcome: 'Aucun résultat enregistré.',
  message: 'Message de la demande',
  convert: 'Créer un contact depuis ce prospect',
  convertedTo: 'Fiche contact',
  openEnquiryDesk: 'Ouvrir dans le bureau des demandes',
  logActivity: 'Enregistrer une activité',
  activityType: 'Type',
  direction: 'Sens',
  activityOutcome: 'Issue',
  summary: 'Résumé',
  summaryHint: 'Faits opérationnels uniquement. Aucune observation clinique.',
  occurredOn: 'Quand',
  log: 'Enregistrer',
  timeline: 'Historique',
  noTimeline: 'Rien d’enregistré pour l’instant.',
  appointments: 'Consultations',
  noAppointments: 'Aucune consultation.',
  payments: 'Paiements',
  noPayments: 'Aucun paiement.',
  tasks: 'Tâches',
  noTasks: 'Aucune tâche liée à ce contact.',
  addTask: 'Ajouter une tâche',
  taskTitle: 'Tâche',
  dueOn: 'Échéance',
  bookConsultation: 'Réserver une consultation',
  recordPayment: 'Encaisser',
  editContact: 'Modifier le contact',
  sourceEnquiry: 'Demande d’origine',
  paidTotal: 'Total payé',
  saved: 'Enregistré.',
  timelineTitle: {
    enquiryReceived: 'Demande reçue',
    status: (from, to) => `Étape modifiée : ${from} → ${to}`,
    ownerAssigned: (name) => `Attribuée à ${name}`,
    ownerCleared: 'Responsable retiré',
    followUpSet: (date) => `Relance prévue le ${date}`,
    followUpCleared: 'Plan de relance effacé',
    outcomeSet: 'Résultat enregistré',
    outcomeCleared: 'Résultat effacé',
    clientCreated: 'Fiche contact créée',
    appointment: (status) => `Consultation · ${status}`,
    payment: (receipt) => `Paiement ${receipt}`,
    task: (status) => `Tâche · ${status}`,
  },
  activityTypeLabel: {
    CALL: 'Appel',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'E-mail',
    MEETING: 'Rendez-vous',
    NOTE: 'Note',
  },
  directionLabel: { INBOUND: 'Entrant', OUTBOUND: 'Sortant' },
  outcomeLabel: {
    REACHED: 'Joint(e)',
    NO_ANSWER: 'Pas de réponse',
    LEFT_MESSAGE: 'Message laissé',
    BOOKED: 'Réservé',
    NOT_INTERESTED: 'Pas intéressé(e)',
    OTHER: 'Autre',
  },
  feedback: {
    'not-found': 'Cet élément n’est pas disponible dans votre espace.',
    forbidden: 'Votre rôle ne permet pas cette modification.',
    'consent-required':
      'Cette personne n’a pas accepté d’être contactée. Enregistrez un échange entrant ou une note.',
    'direction-required': 'Indiquez si l’échange était entrant ou sortant.',
    'occurred-at':
      'L’activité doit dater des 90 derniers jours et pas du futur.',
    invalid:
      'Certains champs manquent ou sont invalides. Vérifiez le formulaire.',
  },
};

const arabic: CrmCopy = {
  eyebrow: 'نظام Luminol لإدارة العملاء',
  searchTitle: 'البحث',
  searchIntro:
    'تشمل النتائج فقط الطلبات والعملاء والوصولات التي يسمح بها دورك.',
  searchTooShort: 'اكتب حرفين على الأقل.',
  noResults: 'لا توجد نتائج مطابقة.',
  leads: 'العملاء المحتملون',
  contacts: 'جهات الاتصال',
  receipts: 'الوصولات',
  lead: 'عميل محتمل',
  contact: 'جهة اتصال',
  open: 'فتح',
  details: 'التفاصيل',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  city: 'المدينة',
  school: 'المدرسة',
  programme: 'البرنامج',
  preferredContact: 'وسيلة التواصل المفضلة',
  delivery: 'الصيغة',
  timing: 'التوقيت',
  source: 'المصدر',
  campaign: 'الحملة',
  received: 'تاريخ الاستلام',
  owner: 'المسؤول',
  unassigned: 'غير مسند',
  assignToMe: 'إسناد إليّ',
  unassign: 'إلغاء الإسناد',
  consent: 'الموافقة على الاتصال',
  consentYes: 'وافق على الاتصال به',
  consentNo: 'بدون موافقة على الاتصال — سجّل المحادثات الواردة والملاحظات فقط',
  consentHint: 'تُرفض المكالمات ورسائل واتساب والبريد الصادرة بدون موافقة.',
  stage: 'المرحلة',
  moveTo: 'نقل إلى',
  followUp: 'خطة المتابعة',
  followUpOn: 'تاريخ المتابعة',
  nextAction: 'الإجراء التالي',
  saveFollowUp: 'حفظ الخطة',
  clearFollowUp: 'مسح الخطة',
  noFollowUp: 'لا توجد متابعة مخططة.',
  outcome: 'النتيجة',
  saveOutcome: 'حفظ النتيجة',
  noOutcome: 'لا نتيجة مسجّلة.',
  message: 'رسالة الطلب',
  convert: 'إنشاء جهة اتصال من هذا الطلب',
  convertedTo: 'بطاقة جهة الاتصال',
  openEnquiryDesk: 'فتح في مكتب الطلبات',
  logActivity: 'تسجيل نشاط',
  activityType: 'النوع',
  direction: 'الاتجاه',
  activityOutcome: 'النتيجة',
  summary: 'الملخص',
  summaryHint: 'وقائع تنظيمية فقط. بدون ملاحظات سريرية.',
  occurredOn: 'متى',
  log: 'تسجيل النشاط',
  timeline: 'السجل الزمني',
  noTimeline: 'لا شيء مسجّل بعد.',
  appointments: 'الاستشارات',
  noAppointments: 'لا استشارات بعد.',
  payments: 'المدفوعات',
  noPayments: 'لا مدفوعات بعد.',
  tasks: 'المهام',
  noTasks: 'لا مهام مرتبطة بجهة الاتصال هذه.',
  addTask: 'إضافة مهمة',
  taskTitle: 'المهمة',
  dueOn: 'الاستحقاق',
  bookConsultation: 'حجز استشارة',
  recordPayment: 'تسجيل دفعة',
  editContact: 'تعديل جهة الاتصال',
  sourceEnquiry: 'الطلب الأصلي',
  paidTotal: 'إجمالي المدفوع',
  saved: 'تم الحفظ.',
  timelineTitle: {
    enquiryReceived: 'استُلم الطلب',
    status: (from, to) => `تغيّرت المرحلة: ${from} ← ${to}`,
    ownerAssigned: (name) => `أُسند إلى ${name}`,
    ownerCleared: 'أُزيل المسؤول',
    followUpSet: (date) => `متابعة مخططة في ${date}`,
    followUpCleared: 'مُسحت خطة المتابعة',
    outcomeSet: 'سُجّلت النتيجة',
    outcomeCleared: 'مُسحت النتيجة',
    clientCreated: 'أُنشئت بطاقة جهة الاتصال',
    appointment: (status) => `استشارة · ${status}`,
    payment: (receipt) => `دفعة ${receipt}`,
    task: (status) => `مهمة · ${status}`,
  },
  activityTypeLabel: {
    CALL: 'مكالمة',
    WHATSAPP: 'واتساب',
    EMAIL: 'بريد إلكتروني',
    MEETING: 'لقاء',
    NOTE: 'ملاحظة',
  },
  directionLabel: { INBOUND: 'وارد', OUTBOUND: 'صادر' },
  outcomeLabel: {
    REACHED: 'تم الوصول إليه',
    NO_ANSWER: 'لا رد',
    LEFT_MESSAGE: 'تُركت رسالة',
    BOOKED: 'تم الحجز',
    NOT_INTERESTED: 'غير مهتم',
    OTHER: 'أخرى',
  },
  feedback: {
    'not-found': 'هذا العنصر غير متاح في مساحة عملك.',
    forbidden: 'دورك لا يسمح بهذا التعديل.',
    'consent-required':
      'هذا الشخص لم يوافق على الاتصال به. سجّل محادثة واردة أو ملاحظة بدلًا من ذلك.',
    'direction-required': 'حدّد ما إذا كانت المحادثة واردة أو صادرة.',
    'occurred-at': 'يجب أن يكون النشاط خلال آخر 90 يومًا وليس في المستقبل.',
    invalid: 'بعض الحقول ناقصة أو غير صحيحة. راجع النموذج وأعد المحاولة.',
  },
};

const copies: Record<Locale, CrmCopy> = { en: english, fr: french, ar: arabic };

export function getCrmCopy(locale: Locale): CrmCopy {
  return copies[locale];
}
