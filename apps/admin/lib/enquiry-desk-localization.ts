import type { Locale } from '@luminol/localization';

import type { EnquiryAuditAction } from './enquiry-audit-history';
import type { EnquiryFirstResponseStep } from './enquiry-first-response';

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
  activeIncompleteQualification: string;
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
  programmeContext: string;
  language: string;
  source: string;
  owner: string;
  unassigned: string;
  assignedToYou: string;
  assignToMe: string;
  unassign: string;
  message: string;
  protectedMessage: string;
  firstResponseGuide: string;
  firstResponseGuideIntro: string;
  firstResponseBoundary: string;
  recentAuditChanges: string;
  recentAuditIntro: string;
  auditBy: string;
  auditNoChanges: string;
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
    activeIncompleteQualification: 'Active with missing qualification',
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
    programmeContext: 'Programme / offer',
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
    firstResponseGuide: 'First-response guide',
    firstResponseGuideIntro:
      'Use this checklist to keep the first contact consistent with the information already provided.',
    firstResponseBoundary:
      'Operational guidance only — do not add diagnoses, treatment recommendations or clinical claims to the reply.',
    recentAuditChanges: 'Recent audited changes',
    recentAuditIntro:
      'Latest protected workflow events. Historical message, next-action and outcome text are not repeated here.',
    auditBy: 'by',
    auditNoChanges: 'No audited workflow changes recorded yet.',
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
    activeIncompleteQualification: 'Actives avec qualification incomplète',
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
    programmeContext: 'Programme / offre',
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
    firstResponseGuide: 'Guide de première réponse',
    firstResponseGuideIntro:
      'Utilisez cette liste pour garder un premier contact cohérent avec les informations déjà fournies.',
    firstResponseBoundary:
      'Guide opérationnel uniquement — n’ajoutez pas de diagnostic, recommandation thérapeutique ou affirmation clinique à la réponse.',
    recentAuditChanges: 'Modifications auditées récentes',
    recentAuditIntro:
      'Derniers événements protégés du flux. Les anciens messages, prochaines actions et textes de résultat ne sont pas répétés ici.',
    auditBy: 'par',
    auditNoChanges: 'Aucune modification auditée du flux pour le moment.',
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
    activeIncompleteQualification: 'نشطة ببيانات تأهيل ناقصة',
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
    programmeContext: 'البرنامج / العرض',
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
    firstResponseGuide: 'دليل الرد الأول',
    firstResponseGuideIntro:
      'استخدم هذه القائمة للحفاظ على تواصل أول متسق مع المعلومات التي قدمها صاحب الطلب.',
    firstResponseBoundary:
      'إرشاد تشغيلي فقط — لا تضف تشخيصات أو توصيات علاجية أو ادعاءات سريرية إلى الرد.',
    recentAuditChanges: 'أحدث التغييرات المدققة',
    recentAuditIntro:
      'أحدث أحداث سير العمل المحمية. لا نكرر هنا نصوص الرسائل أو الإجراءات التالية أو النتائج السابقة.',
    auditBy: 'بواسطة',
    auditNoChanges: 'لا توجد تغييرات مدققة في سير العمل حتى الآن.',
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

const AUDIT_ACTION_LABELS: Record<
  Locale,
  Record<EnquiryAuditAction, string>
> = {
  en: {
    'status-changed': 'Status changed',
    'ownership-assigned': 'Owner assigned',
    'ownership-reassigned': 'Owner reassigned',
    'ownership-cleared': 'Ownership cleared',
    'follow-up-planned': 'Follow-up planned',
    'follow-up-updated': 'Follow-up updated',
    'follow-up-cleared': 'Follow-up cleared',
    'outcome-recorded': 'Outcome recorded',
    'outcome-updated': 'Outcome updated',
    'outcome-cleared': 'Outcome cleared',
  },
  fr: {
    'status-changed': 'Statut modifié',
    'ownership-assigned': 'Responsable attribué',
    'ownership-reassigned': 'Responsable réattribué',
    'ownership-cleared': 'Attribution retirée',
    'follow-up-planned': 'Suivi planifié',
    'follow-up-updated': 'Suivi modifié',
    'follow-up-cleared': 'Suivi supprimé',
    'outcome-recorded': 'Résultat enregistré',
    'outcome-updated': 'Résultat modifié',
    'outcome-cleared': 'Résultat supprimé',
  },
  ar: {
    'status-changed': 'تم تغيير الحالة',
    'ownership-assigned': 'تم إسناد مسؤول',
    'ownership-reassigned': 'تم تغيير المسؤول',
    'ownership-cleared': 'تم إلغاء الإسناد',
    'follow-up-planned': 'تمت جدولة المتابعة',
    'follow-up-updated': 'تم تحديث المتابعة',
    'follow-up-cleared': 'تم إلغاء المتابعة',
    'outcome-recorded': 'تم تسجيل النتيجة',
    'outcome-updated': 'تم تحديث النتيجة',
    'outcome-cleared': 'تم حذف النتيجة',
  },
};

const FIRST_RESPONSE_STEP_LABELS: Record<
  Locale,
  Record<EnquiryFirstResponseStep, string>
> = {
  en: {
    acknowledge:
      'Acknowledge the enquiry and confirm you understood the request.',
    'confirm-programme-objective':
      'Confirm that the recorded programme matches the visitor’s objective; do not assume availability or suitability.',
    'clarify-service-objective':
      'Clarify which service or objective the visitor is asking about.',
    'clarify-location': 'Ask for the city or area needed for routing.',
    'clarify-format':
      'Confirm whether they prefer in-person or online support.',
    'clarify-timing': 'Confirm their preferred timing for the next step.',
    'agree-next-option':
      'Offer only an operational next option that is actually available and agree what happens next.',
    'use-email-preference': 'Reply by email, their stated preferred channel.',
    'confirm-phone-permission':
      'Before continuing by phone, confirm they agree to be contacted on the provided number.',
    'clarify-phone-number':
      'They prefer phone but no number is recorded; confirm how they want to be contacted.',
    'confirm-whatsapp-permission':
      'Before moving to WhatsApp, confirm they agree to continue there; do not assume the provided number is WhatsApp-enabled.',
    'clarify-whatsapp-number':
      'They prefer WhatsApp but no number is recorded; confirm the contact method and number first.',
    'clarify-contact-preference':
      'Confirm which contact channel they prefer before moving the conversation.',
    'schedule-follow-up':
      'After the response, record the next action and follow-up date in this desk.',
  },
  fr: {
    acknowledge:
      'Accusez réception de la demande et confirmez que vous avez compris le besoin.',
    'confirm-programme-objective':
      'Confirmez que le programme enregistré correspond à l’objectif de la personne, sans supposer sa disponibilité ni son adéquation.',
    'clarify-service-objective':
      'Clarifiez le service ou l’objectif recherché par la personne.',
    'clarify-location': 'Demandez la ville ou la zone nécessaire au routage.',
    'clarify-format':
      'Confirmez si la personne préfère un accompagnement en présentiel ou en ligne.',
    'clarify-timing': 'Confirmez le délai souhaité pour la prochaine étape.',
    'agree-next-option':
      'Proposez uniquement une prochaine option opérationnelle réellement disponible et convenez de la suite.',
    'use-email-preference':
      'Répondez par e-mail, le canal indiqué comme préféré.',
    'confirm-phone-permission':
      'Avant de poursuivre par téléphone, confirmez l’accord pour utiliser le numéro fourni.',
    'clarify-phone-number':
      'Le téléphone est préféré mais aucun numéro n’est enregistré ; confirmez le moyen de contact.',
    'confirm-whatsapp-permission':
      'Avant de passer sur WhatsApp, confirmez l’accord pour y poursuivre l’échange et ne supposez pas que le numéro fourni est compatible.',
    'clarify-whatsapp-number':
      'WhatsApp est préféré mais aucun numéro n’est enregistré ; confirmez d’abord le moyen de contact et le numéro.',
    'clarify-contact-preference':
      'Confirmez le canal de contact préféré avant de poursuivre l’échange.',
    'schedule-follow-up':
      'Après la réponse, enregistrez la prochaine action et la date de suivi dans ce bureau.',
  },
  ar: {
    acknowledge: 'أكد استلام الطلب وأنك فهمت ما يطلبه صاحبه.',
    'confirm-programme-objective':
      'أكد أن البرنامج المسجل يطابق هدف صاحب الطلب دون افتراض التوفر أو الملاءمة.',
    'clarify-service-objective':
      'وضّح الخدمة أو الهدف الذي يسأل عنه صاحب الطلب.',
    'clarify-location': 'اطلب المدينة أو المنطقة اللازمة لتوجيه الطلب.',
    'clarify-format': 'أكد ما إذا كان يفضل المتابعة حضوريًا أو عن بُعد.',
    'clarify-timing': 'أكد التوقيت المفضل للخطوة التالية.',
    'agree-next-option':
      'اعرض فقط خيارًا تشغيليًا متاحًا فعليًا للخطوة التالية واتفق على ما سيحدث بعدها.',
    'use-email-preference':
      'استخدم البريد الإلكتروني لأنه وسيلة التواصل المفضلة المذكورة.',
    'confirm-phone-permission':
      'قبل المتابعة هاتفيًا، أكد موافقته على التواصل عبر الرقم المقدم.',
    'clarify-phone-number':
      'يفضل الهاتف لكن لا يوجد رقم مسجل؛ أكد معه طريقة التواصل المناسبة.',
    'confirm-whatsapp-permission':
      'قبل الانتقال إلى واتساب، أكد موافقته على مواصلة التواصل هناك ولا تفترض أن الرقم المقدم مفعّل على واتساب.',
    'clarify-whatsapp-number':
      'يفضل واتساب لكن لا يوجد رقم مسجل؛ أكد أولًا وسيلة التواصل والرقم.',
    'clarify-contact-preference':
      'أكد وسيلة التواصل التي يفضلها قبل نقل المحادثة إلى قناة أخرى.',
    'schedule-follow-up':
      'بعد الرد، سجّل الخطوة التالية وتاريخ المتابعة في هذا المكتب.',
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

export function getEnquiryAuditActionLabel(
  locale: Locale,
  action: EnquiryAuditAction,
): string {
  return AUDIT_ACTION_LABELS[locale][action];
}

export function getEnquiryFirstResponseStepLabel(
  locale: Locale,
  step: EnquiryFirstResponseStep,
): string {
  return FIRST_RESPONSE_STEP_LABELS[locale][step];
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
