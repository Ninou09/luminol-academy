import type { Locale } from '@luminol/localization';

export type EnquiryContactPreferenceValue = 'EMAIL' | 'PHONE' | 'WHATSAPP';
export type EnquiryDeliveryPreferenceValue =
  'IN_PERSON' | 'ONLINE' | 'FLEXIBLE' | 'NOT_SURE';
export type EnquiryTimingPreferenceValue =
  'SOON' | 'WITHIN_MONTH' | 'LATER' | 'NOT_SURE';

export type EnquiryDeskCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  filterByStatus: string;
  filterByFollowUp: string;
  attentionQueue: string;
  filterByAttention: string;
  filterByOwner: string;
  anyOwner: string;
  myEnquiries: string;
  allAttention: string;
  unassignedActive: string;
  activeWithoutFollowUp: string;
  closedWithoutOutcome: string;
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
  city: string;
  preferredContact: string;
  deliveryPreference: string;
  timingPreference: string;
  notProvided: string;
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
  outcome: string;
  outcomeRecorded: string;
  noOutcome: string;
  outcomeGuidance: string;
  saveOutcome: string;
  clearOutcome: string;
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
    attentionQueue: 'Attention queue',
    filterByAttention: 'Filter by attention',
    filterByOwner: 'Filter by owner',
    anyOwner: 'Any owner',
    myEnquiries: 'Assigned to me',
    allAttention: 'Any attention state',
    unassignedActive: 'Active & unassigned',
    activeWithoutFollowUp: 'Active without follow-up',
    closedWithoutOutcome: 'Closed without outcome',
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
    city: 'City / area',
    preferredContact: 'Preferred contact',
    deliveryPreference: 'Preferred format',
    timingPreference: 'Preferred timing',
    notProvided: 'Not provided',
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
    outcome: 'Operational outcome',
    outcomeRecorded: 'Recorded',
    noOutcome: 'No operational outcome recorded',
    outcomeGuidance:
      'Record only the operational result of follow-up. Do not add clinical notes, diagnoses, symptoms or treatment decisions.',
    saveOutcome: 'Save outcome',
    clearOutcome: 'Clear outcome',
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
    attentionQueue: 'Points d’attention',
    filterByAttention: 'Filtrer par point d’attention',
    filterByOwner: 'Filtrer par responsable',
    anyOwner: 'Tous les responsables',
    myEnquiries: 'Attribuées à moi',
    allAttention: 'Tous les points d’attention',
    unassignedActive: 'Actives non attribuées',
    activeWithoutFollowUp: 'Actives sans suivi planifié',
    closedWithoutOutcome: 'Clôturées sans résultat',
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
    city: 'Ville / région',
    preferredContact: 'Contact préféré',
    deliveryPreference: 'Format préféré',
    timingPreference: 'Délai souhaité',
    notProvided: 'Non renseigné',
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
    outcome: 'Résultat opérationnel',
    outcomeRecorded: 'Enregistré le',
    noOutcome: 'Aucun résultat opérationnel enregistré',
    outcomeGuidance:
      'Indiquez uniquement le résultat opérationnel du suivi. N’ajoutez pas de notes cliniques, diagnostics, symptômes ou décisions thérapeutiques.',
    saveOutcome: 'Enregistrer le résultat',
    clearOutcome: 'Effacer le résultat',
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
    attentionQueue: 'حالات تحتاج متابعة',
    filterByAttention: 'التصفية حسب حالة المتابعة',
    filterByOwner: 'التصفية حسب المسؤول',
    anyOwner: 'أي مسؤول',
    myEnquiries: 'مسندة إليّ',
    allAttention: 'كل حالات المتابعة',
    unassignedActive: 'نشطة وغير مسندة',
    activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',
    closedWithoutOutcome: 'مغلقة دون نتيجة',
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
    city: 'المدينة / المنطقة',
    preferredContact: 'وسيلة التواصل المفضلة',
    deliveryPreference: 'طريقة الحضور المفضلة',
    timingPreference: 'التوقيت المفضل',
    notProvided: 'غير مذكور',
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
    outcome: 'النتيجة التشغيلية',
    outcomeRecorded: 'تاريخ التسجيل',
    noOutcome: 'لم تُسجل نتيجة تشغيلية',
    outcomeGuidance:
      'سجّل فقط النتيجة التشغيلية للمتابعة. لا تضف ملاحظات سريرية أو تشخيصات أو أعراضًا أو قرارات علاجية.',
    saveOutcome: 'حفظ النتيجة',
    clearOutcome: 'مسح النتيجة',
    updateStatus: 'تحديث حالة الطلب',
    moveTo: 'نقل إلى…',
    update: 'تحديث',
    noMatches: 'لا توجد طلبات تطابق هذه الفلاتر.',
  },
};

const CONTACT_LABELS: Record<
  Locale,
  Record<EnquiryContactPreferenceValue, string>
> = {
  en: { EMAIL: 'Email', PHONE: 'Phone', WHATSAPP: 'WhatsApp' },
  fr: { EMAIL: 'E-mail', PHONE: 'Téléphone', WHATSAPP: 'WhatsApp' },
  ar: { EMAIL: 'البريد الإلكتروني', PHONE: 'الهاتف', WHATSAPP: 'واتساب' },
};

const DELIVERY_LABELS: Record<
  Locale,
  Record<EnquiryDeliveryPreferenceValue, string>
> = {
  en: {
    IN_PERSON: 'In person',
    ONLINE: 'Online',
    FLEXIBLE: 'Either / flexible',
    NOT_SURE: 'Not sure yet',
  },
  fr: {
    IN_PERSON: 'En présentiel',
    ONLINE: 'En ligne',
    FLEXIBLE: 'Les deux / flexible',
    NOT_SURE: 'Pas encore sûr',
  },
  ar: {
    IN_PERSON: 'حضوري',
    ONLINE: 'عن بُعد',
    FLEXIBLE: 'كلاهما / مرن',
    NOT_SURE: 'لست متأكدًا بعد',
  },
};

const TIMING_LABELS: Record<
  Locale,
  Record<EnquiryTimingPreferenceValue, string>
> = {
  en: {
    SOON: 'As soon as practical',
    WITHIN_MONTH: 'Within a month',
    LATER: 'Later',
    NOT_SURE: 'Not sure yet',
  },
  fr: {
    SOON: 'Dès que possible',
    WITHIN_MONTH: 'Dans le mois',
    LATER: 'Plus tard',
    NOT_SURE: 'Pas encore sûr',
  },
  ar: {
    SOON: 'في أقرب وقت مناسب',
    WITHIN_MONTH: 'خلال شهر',
    LATER: 'لاحقًا',
    NOT_SURE: 'لست متأكدًا بعد',
  },
};

export function getEnquiryDeskCopy(locale: Locale): EnquiryDeskCopy {
  return ENQUIRY_DESK_COPY[locale];
}

export function getEnquiryContactPreferenceLabel(
  locale: Locale,
  value: EnquiryContactPreferenceValue | null,
): string {
  return value
    ? CONTACT_LABELS[locale][value]
    : ENQUIRY_DESK_COPY[locale].notProvided;
}

export function getEnquiryDeliveryPreferenceLabel(
  locale: Locale,
  value: EnquiryDeliveryPreferenceValue | null,
): string {
  return value
    ? DELIVERY_LABELS[locale][value]
    : ENQUIRY_DESK_COPY[locale].notProvided;
}

export function getEnquiryTimingPreferenceLabel(
  locale: Locale,
  value: EnquiryTimingPreferenceValue | null,
): string {
  return value
    ? TIMING_LABELS[locale][value]
    : ENQUIRY_DESK_COPY[locale].notProvided;
}
