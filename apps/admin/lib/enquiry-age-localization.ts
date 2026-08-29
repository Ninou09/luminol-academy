import type { Locale } from '@luminol/localization';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  activeTotal: string;
  under24Hours: string;
  oneToThreeDays: string;
  fourToSevenDays: string;
  overSevenDays: string;
  count: (value: string) => string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Operational backlog age',
    title: 'Active enquiry age',
    intro:
      'Current active enquiries grouped only by how long ago they were created. This is workflow backlog context, not urgency, lead quality or suitability.',
    activeTotal: 'Active total',
    under24Hours: 'Under 24 hours',
    oneToThreeDays: '1–3 days',
    fourToSevenDays: '4–7 days',
    overSevenDays: 'Over 7 days',
    count: (value: string) => `${value} active enquiries`,
  },
  fr: {
    eyebrow: 'Âge du flux opérationnel',
    title: 'Âge des demandes actives',
    intro:
      'Demandes actuellement actives regroupées uniquement selon le temps écoulé depuis leur création. Il s’agit d’un contexte de charge opérationnelle, et non d’une mesure d’urgence, de qualité ou d’adéquation.',
    activeTotal: 'Total actif',
    under24Hours: 'Moins de 24 heures',
    oneToThreeDays: '1 à 3 jours',
    fourToSevenDays: '4 à 7 jours',
    overSevenDays: 'Plus de 7 jours',
    count: (value: string) => `${value} demandes actives`,
  },
  ar: {
    eyebrow: 'عمر التراكم التشغيلي',
    title: 'عمر الطلبات النشطة',
    intro:
      'تجميع الطلبات النشطة الحالية فقط حسب المدة منذ إنشائها. هذا سياق تشغيلي للتراكم وليس مقياسًا للاستعجال أو جودة العميل المحتمل أو الملاءمة.',
    activeTotal: 'إجمالي النشط',
    under24Hours: 'أقل من 24 ساعة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    fourToSevenDays: 'من 4 إلى 7 أيام',
    overSevenDays: 'أكثر من 7 أيام',
    count: (value: string) => `${value} طلبات نشطة`,
  },
};

export function getEnquiryAgeCopy(locale: Locale): Copy {
  return copy[locale];
}
