import type { Locale } from '@luminol/localization';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  activeTotal: string;
  count: (value: string) => string;
  noData: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Current workflow states',
    title: 'Active enquiry status mix',
    intro:
      'Current active enquiries grouped only by their persisted workflow status. These counts describe workflow state, not conversion likelihood, urgency, lead quality or suitability.',
    activeTotal: 'Active total',
    count: (value: string) => `${value} active enquiries`,
    noData: 'There are no active enquiries in the current workflow.',
  },
  fr: {
    eyebrow: 'États actuels du flux',
    title: 'Répartition des statuts des demandes actives',
    intro:
      'Demandes actuellement actives regroupées uniquement selon leur statut de workflow enregistré. Ces volumes décrivent l’état du flux, et non une probabilité de conversion, une urgence, une qualité ou une adéquation.',
    activeTotal: 'Total actif',
    count: (value: string) => `${value} demandes actives`,
    noData: 'Aucune demande active dans le workflow actuel.',
  },
  ar: {
    eyebrow: 'حالات سير العمل الحالية',
    title: 'توزيع حالات الطلبات النشطة',
    intro:
      'تجميع الطلبات النشطة الحالية فقط حسب حالة سير العمل المسجّلة. تصف هذه الأعداد حالة سير العمل ولا تعني احتمال التحويل أو الاستعجال أو جودة العميل المحتمل أو الملاءمة.',
    activeTotal: 'إجمالي النشط',
    count: (value: string) => `${value} طلبات نشطة`,
    noData: 'لا توجد طلبات نشطة في سير العمل الحالي.',
  },
};

export function getEnquiryStatusMixCopy(locale: Locale): Copy {
  return copy[locale];
}
