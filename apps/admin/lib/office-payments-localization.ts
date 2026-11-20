import type { Locale } from '@luminol/localization';
import type {
  OfficePaymentMethodValue,
  OfficePaymentPurposeValue,
} from '@luminol/validation/office-payments';

import type { OfficePaymentFeedbackCode } from './office-payment-scope';

export type OfficePaymentsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  boundary: string;
  monthOf: (label: string) => string;
  previousMonth: string;
  nextMonth: string;
  thisMonth: string;
  totalReceived: string;
  paymentsCount: string;
  byMethod: string;
  byPurpose: string;
  recordTitle: string;
  recordIntro: string;
  consultantRecordIntro: string;
  appointmentLabel: string;
  noAppointments: string;
  payerLabel: string;
  clientLabel: string;
  noClient: string;
  purposeLabel: string;
  descriptionLabel: string;
  amountLabel: string;
  methodLabel: string;
  referenceLabel: string;
  referenceHelp: string;
  receivedOnLabel: string;
  record: string;
  ledgerTitle: string;
  noPayments: string;
  receipt: string;
  recordedBy: string;
  voided: string;
  voidReasonLabel: string;
  void: string;
  saved: string;
  method: Record<OfficePaymentMethodValue, string>;
  purpose: Record<OfficePaymentPurposeValue, string>;
  feedback: Record<OfficePaymentFeedbackCode, string>;
  defaultConsultationDescription: string;
};

const english: OfficePaymentsCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Office payments',
  intro:
    'Payments received in person or by transfer: cash, BaridiMob, CCP and bank transfer, in Algerian dinars. Each payment gets a sequential receipt number.',
  boundary:
    'Recorded payments cannot be edited or deleted. Mistakes are voided with a reason by the owner and stay visible in the ledger. Online invoices remain in Finance.',
  monthOf: (label) => label,
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  thisMonth: 'This month',
  totalReceived: 'Received this month',
  paymentsCount: 'Payments',
  byMethod: 'By method',
  byPurpose: 'By purpose',
  recordTitle: 'Record a payment',
  recordIntro:
    'Enter the amount actually received. Electronic payments need the transfer reference.',
  consultantRecordIntro:
    'Record a payment received for one of your consultations.',
  appointmentLabel: 'Consultation',
  noAppointments: 'No recent consultations to record a payment for.',
  payerLabel: 'Paid by',
  clientLabel: 'Client record (optional)',
  noClient: 'No client record',
  purposeLabel: 'Purpose',
  descriptionLabel: 'Description',
  amountLabel: 'Amount (DZD)',
  methodLabel: 'Method',
  referenceLabel: 'Transfer reference',
  referenceHelp: 'Required for BaridiMob, CCP and bank transfers.',
  receivedOnLabel: 'Received on',
  record: 'Record payment',
  ledgerTitle: 'Ledger',
  noPayments: 'No payments recorded this month.',
  receipt: 'Receipt',
  recordedBy: 'Recorded by',
  voided: 'Voided',
  voidReasonLabel: 'Reason for voiding',
  void: 'Void payment',
  saved: 'Saved.',
  method: {
    CASH: 'Cash',
    BARIDIMOB: 'BaridiMob',
    CCP: 'CCP',
    BANK_TRANSFER: 'Bank transfer',
  },
  purpose: {
    CONSULTATION: 'Consultation',
    PROGRAMME: 'Course or programme',
    OTHER: 'Other',
  },
  feedback: {
    'not-found': 'That record is not available in your workspace.',
    forbidden:
      'Consultants can record payments only for their own consultations.',
    'reference-required':
      'Add the transfer reference for BaridiMob, CCP or bank payments.',
    'received-at':
      'The payment date must be within the last year and not in the future.',
    'already-voided': 'This payment is already voided.',
    mismatch: 'The client does not match the consultation.',
    invalid: 'Some fields are missing or invalid. Check the form and retry.',
  },
  defaultConsultationDescription: 'Consultation',
};

const french: OfficePaymentsCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Encaissements',
  intro:
    'Paiements reçus sur place ou par virement : espèces, BaridiMob, CCP et virement bancaire, en dinars algériens. Chaque paiement reçoit un numéro de reçu séquentiel.',
  boundary:
    'Un paiement enregistré ne peut être ni modifié ni supprimé. Les erreurs sont annulées avec un motif par le propriétaire et restent visibles. Les factures en ligne restent dans Finances.',
  monthOf: (label) => label,
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  thisMonth: 'Ce mois-ci',
  totalReceived: 'Encaissé ce mois',
  paymentsCount: 'Paiements',
  byMethod: 'Par mode',
  byPurpose: 'Par objet',
  recordTitle: 'Enregistrer un paiement',
  recordIntro:
    'Saisissez le montant réellement reçu. Les paiements électroniques exigent la référence du virement.',
  consultantRecordIntro:
    'Enregistrez un paiement reçu pour l’une de vos consultations.',
  appointmentLabel: 'Consultation',
  noAppointments: 'Aucune consultation récente à encaisser.',
  payerLabel: 'Payé par',
  clientLabel: 'Fiche client (facultatif)',
  noClient: 'Sans fiche client',
  purposeLabel: 'Objet',
  descriptionLabel: 'Description',
  amountLabel: 'Montant (DA)',
  methodLabel: 'Mode',
  referenceLabel: 'Référence du virement',
  referenceHelp: 'Obligatoire pour BaridiMob, CCP et virement bancaire.',
  receivedOnLabel: 'Reçu le',
  record: 'Enregistrer le paiement',
  ledgerTitle: 'Registre',
  noPayments: 'Aucun paiement enregistré ce mois.',
  receipt: 'Reçu',
  recordedBy: 'Enregistré par',
  voided: 'Annulé',
  voidReasonLabel: 'Motif de l’annulation',
  void: 'Annuler le paiement',
  saved: 'Enregistré.',
  method: {
    CASH: 'Espèces',
    BARIDIMOB: 'BaridiMob',
    CCP: 'CCP',
    BANK_TRANSFER: 'Virement bancaire',
  },
  purpose: {
    CONSULTATION: 'Consultation',
    PROGRAMME: 'Formation ou programme',
    OTHER: 'Autre',
  },
  feedback: {
    'not-found': 'Cet élément n’est pas disponible dans votre espace.',
    forbidden:
      'Les consultant(e)s n’encaissent que leurs propres consultations.',
    'reference-required':
      'Ajoutez la référence du virement pour BaridiMob, CCP ou banque.',
    'received-at':
      'La date doit se situer dans l’année écoulée et pas dans le futur.',
    'already-voided': 'Ce paiement est déjà annulé.',
    mismatch: 'Le client ne correspond pas à la consultation.',
    invalid:
      'Certains champs manquent ou sont invalides. Vérifiez le formulaire.',
  },
  defaultConsultationDescription: 'Consultation',
};

const arabic: OfficePaymentsCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'المدفوعات المكتبية',
  intro:
    'المدفوعات المستلمة حضوريًا أو بالتحويل: نقدًا، BaridiMob، CCP والتحويل البنكي، بالدينار الجزائري. يحصل كل دفع على رقم وصل تسلسلي.',
  boundary:
    'لا يمكن تعديل الدفع المسجّل أو حذفه. تُلغى الأخطاء بسبب مكتوب من طرف المالك وتبقى ظاهرة في السجل. الفواتير الإلكترونية تبقى في صفحة المالية.',
  monthOf: (label) => label,
  previousMonth: 'الشهر السابق',
  nextMonth: 'الشهر التالي',
  thisMonth: 'هذا الشهر',
  totalReceived: 'المستلم هذا الشهر',
  paymentsCount: 'عدد المدفوعات',
  byMethod: 'حسب الطريقة',
  byPurpose: 'حسب الغرض',
  recordTitle: 'تسجيل دفعة',
  recordIntro:
    'أدخل المبلغ المستلم فعلًا. تحتاج المدفوعات الإلكترونية إلى مرجع التحويل.',
  consultantRecordIntro: 'سجّل دفعة مستلمة عن إحدى استشاراتك.',
  appointmentLabel: 'الاستشارة',
  noAppointments: 'لا توجد استشارات حديثة لتسجيل دفعة عنها.',
  payerLabel: 'الدافع',
  clientLabel: 'بطاقة العميل (اختياري)',
  noClient: 'بدون بطاقة عميل',
  purposeLabel: 'الغرض',
  descriptionLabel: 'الوصف',
  amountLabel: 'المبلغ (دج)',
  methodLabel: 'الطريقة',
  referenceLabel: 'مرجع التحويل',
  referenceHelp: 'إلزامي لـ BaridiMob وCCP والتحويل البنكي.',
  receivedOnLabel: 'تاريخ الاستلام',
  record: 'تسجيل الدفعة',
  ledgerTitle: 'السجل',
  noPayments: 'لا مدفوعات مسجّلة هذا الشهر.',
  receipt: 'الوصل',
  recordedBy: 'سجّلها',
  voided: 'ملغاة',
  voidReasonLabel: 'سبب الإلغاء',
  void: 'إلغاء الدفعة',
  saved: 'تم الحفظ.',
  method: {
    CASH: 'نقدًا',
    BARIDIMOB: 'BaridiMob',
    CCP: 'CCP',
    BANK_TRANSFER: 'تحويل بنكي',
  },
  purpose: {
    CONSULTATION: 'استشارة',
    PROGRAMME: 'دورة أو برنامج',
    OTHER: 'أخرى',
  },
  feedback: {
    'not-found': 'هذا العنصر غير متاح في مساحة عملك.',
    forbidden: 'يسجّل الأخصائيون المدفوعات عن استشاراتهم فقط.',
    'reference-required':
      'أضف مرجع التحويل لمدفوعات BaridiMob أو CCP أو البنك.',
    'received-at':
      'يجب أن يكون تاريخ الدفع خلال السنة الماضية وليس في المستقبل.',
    'already-voided': 'هذه الدفعة ملغاة بالفعل.',
    mismatch: 'العميل لا يطابق الاستشارة.',
    invalid: 'بعض الحقول ناقصة أو غير صحيحة. راجع النموذج وأعد المحاولة.',
  },
  defaultConsultationDescription: 'استشارة',
};

const copies: Record<Locale, OfficePaymentsCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getOfficePaymentsCopy(locale: Locale): OfficePaymentsCopy {
  return copies[locale];
}
