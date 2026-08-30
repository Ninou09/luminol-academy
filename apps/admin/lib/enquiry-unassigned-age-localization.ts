import type { Locale } from '@luminol/localization';

export type UnassignedEnquiryAgeCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  total: string;
  under24Hours: string;
  oneToThreeDays: string;
  fourToSevenDays: string;
  overSevenDays: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, UnassignedEnquiryAgeCopy> = {
  en: {
    eyebrow: 'Unassigned workflow backlog',
    title: 'Unassigned active enquiry age',
    intro:
      'Current active enquiries with no recorded owner, grouped only by how long ago they were created. This is operational backlog context, not urgency, intent, lead quality or suitability.',
    total: 'Unassigned active total',
    under24Hours: 'Under 24 hours',
    oneToThreeDays: '1–3 days',
    fourToSevenDays: '4–7 days',
    overSevenDays: 'Over 7 days',
    count: (value) => `${value} unassigned enquiries`,
  },
  fr: {
    eyebrow: 'Arriéré opérationnel non attribué',
    title: 'Âge des demandes actives non attribuées',
    intro:
      'Demandes actuellement actives sans responsable enregistré, regroupées uniquement selon le temps écoulé depuis leur création. Il s’agit d’un contexte d’arriéré opérationnel, et non d’une mesure d’urgence, d’intention, de qualité ou d’adéquation.',
    total: 'Total actif non attribué',
    under24Hours: 'Moins de 24 heures',
    oneToThreeDays: '1 à 3 jours',
    fourToSevenDays: '4 à 7 jours',
    overSevenDays: 'Plus de 7 jours',
    count: (value) => `${value} demandes non attribuées`,
  },
  ar: {
    eyebrow: 'التراكم التشغيلي غير المسند',
    title: 'عمر الطلبات النشطة غير المسندة',
    intro:
      'الطلبات النشطة الحالية التي لا يوجد لها مسؤول مسجل، مجمعة فقط حسب المدة منذ إنشائها. هذا سياق للتراكم التشغيلي وليس مقياسًا للاستعجال أو النية أو جودة الطلب أو الملاءمة.',
    total: 'إجمالي النشط غير المسند',
    under24Hours: 'أقل من 24 ساعة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    fourToSevenDays: 'من 4 إلى 7 أيام',
    overSevenDays: 'أكثر من 7 أيام',
    count: (value) => `${value} طلبات غير مسندة`,
  },
};

export function getUnassignedEnquiryAgeCopy(
  locale: Locale,
): UnassignedEnquiryAgeCopy {
  return COPY[locale];
}
