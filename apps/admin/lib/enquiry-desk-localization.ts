import type { Locale } from '@luminol/localization';

export type EnquiryDeskCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  filterByStatus: string;
  all: string;
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
      'Review the full submitted context, assign ownership, contact the lead, and move each enquiry through the existing audited workflow.',
    back: 'Back to overview',
    filterByStatus: 'Filter by status',
    all: 'All',
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
    updateStatus: 'Update enquiry status',
    moveTo: 'Move to…',
    update: 'Update',
    noMatches: 'No enquiries match this filter.',
  },
  fr: {
    eyebrow: 'Opérations de développement',
    title: 'Suivi des demandes',
    intro:
      'Consultez le contexte complet transmis, attribuez un responsable, contactez le prospect et faites avancer chaque demande dans le flux de suivi audité existant.',
    back: 'Retour à la vue d’ensemble',
    filterByStatus: 'Filtrer par statut',
    all: 'Toutes',
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
    updateStatus: 'Modifier le statut de la demande',
    moveTo: 'Passer à…',
    update: 'Mettre à jour',
    noMatches: 'Aucune demande ne correspond à ce filtre.',
  },
  ar: {
    eyebrow: 'عمليات النمو',
    title: 'مكتب متابعة الطلبات',
    intro:
      'راجع كامل المعلومات المرسلة، وحدد مسؤول المتابعة، وتواصل مع صاحب الطلب، ثم انقل كل طلب عبر مسار المتابعة الحالي الموثق.',
    back: 'العودة إلى النظرة العامة',
    filterByStatus: 'التصفية حسب الحالة',
    all: 'الكل',
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
    updateStatus: 'تحديث حالة الطلب',
    moveTo: 'نقل إلى…',
    update: 'تحديث',
    noMatches: 'لا توجد طلبات تطابق هذا الفلتر.',
  },
};

export function getEnquiryDeskCopy(locale: Locale): EnquiryDeskCopy {
  return ENQUIRY_DESK_COPY[locale];
}
