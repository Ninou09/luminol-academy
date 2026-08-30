import type { Locale } from '@luminol/localization';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  under24Hours: string;
  oneToThreeDays: string;
  fourToSevenDays: string;
  overSevenDays: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Qualification data backlog age',
    title: 'Incomplete qualification age',
    intro:
      'Current active enquiries with one or more missing structured qualification fields, grouped only by how long ago they were created. Explicit recorded options such as Not sure remain complete. This is workflow-data completeness context, not urgency, lead quality or suitability.',
    under24Hours: 'Under 24 hours',
    oneToThreeDays: '1–3 days',
    fourToSevenDays: '4–7 days',
    overSevenDays: 'Over 7 days',
    count: (value) => `${value} enquiries with incomplete qualification`,
  },
  fr: {
    eyebrow: 'Âge du backlog de qualification',
    title: 'Âge des qualifications incomplètes',
    intro:
      'Demandes actuellement actives avec un ou plusieurs champs structurés de qualification manquants, regroupées uniquement selon le temps écoulé depuis leur création. Les options explicitement enregistrées telles que « Pas sûr » restent considérées comme renseignées. Il s’agit d’un contexte de complétude des données opérationnelles, et non d’une mesure d’urgence, de qualité ou d’adéquation.',
    under24Hours: 'Moins de 24 heures',
    oneToThreeDays: '1 à 3 jours',
    fourToSevenDays: '4 à 7 jours',
    overSevenDays: 'Plus de 7 jours',
    count: (value) => `${value} demandes avec qualification incomplète`,
  },
  ar: {
    eyebrow: 'عمر تراكم بيانات التأهيل',
    title: 'عمر الطلبات ذات التأهيل غير المكتمل',
    intro:
      'الطلبات النشطة الحالية التي ينقصها حقل واحد أو أكثر من حقول التأهيل المنظمة، مجمعة فقط حسب المدة منذ إنشائها. الخيارات المسجلة صراحة مثل «غير متأكد» تبقى محسوبة كبيانات مكتملة. هذا سياق لاكتمال بيانات سير العمل وليس مقياسًا للاستعجال أو جودة الطلب أو الملاءمة.',
    under24Hours: 'أقل من 24 ساعة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    fourToSevenDays: 'من 4 إلى 7 أيام',
    overSevenDays: 'أكثر من 7 أيام',
    count: (value) => `${value} طلبات بتأهيل غير مكتمل`,
  },
};

export function getIncompleteQualificationAgeCopy(locale: Locale): Copy {
  return COPY[locale];
}
