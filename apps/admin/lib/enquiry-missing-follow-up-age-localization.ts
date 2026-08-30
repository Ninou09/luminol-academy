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
    eyebrow: 'Follow-up workflow backlog age',
    title: 'Missing follow-up plan age',
    intro:
      'Current active enquiries with no complete recorded follow-up plan, grouped only by how long ago they were created. A plan is incomplete when the follow-up time or next action is missing. This is workflow backlog context, not urgency, lead quality or suitability.',
    under24Hours: 'Under 24 hours',
    oneToThreeDays: '1–3 days',
    fourToSevenDays: '4–7 days',
    overSevenDays: 'Over 7 days',
    count: (value) => `${value} enquiries missing a complete plan`,
  },
  fr: {
    eyebrow: 'Âge du backlog de suivi',
    title: 'Âge des demandes sans plan de suivi complet',
    intro:
      'Demandes actuellement actives sans plan de suivi complet enregistré, regroupées uniquement selon le temps écoulé depuis leur création. Un plan est incomplet lorsque la date de suivi ou la prochaine action manque. Il s’agit d’un contexte de charge opérationnelle, et non d’une mesure d’urgence, de qualité ou d’adéquation.',
    under24Hours: 'Moins de 24 heures',
    oneToThreeDays: '1 à 3 jours',
    fourToSevenDays: '4 à 7 jours',
    overSevenDays: 'Plus de 7 jours',
    count: (value) => `${value} demandes sans plan complet`,
  },
  ar: {
    eyebrow: 'عمر تراكم سير عمل المتابعة',
    title: 'عمر الطلبات دون خطة متابعة مكتملة',
    intro:
      'الطلبات النشطة الحالية التي لا تحتوي على خطة متابعة مكتملة ومسجلة، مجمعة فقط حسب المدة منذ إنشائها. تعد الخطة غير مكتملة عند غياب وقت المتابعة أو الإجراء التالي. هذا سياق تشغيلي للتراكم وليس مقياسًا للاستعجال أو جودة الطلب أو الملاءمة.',
    under24Hours: 'أقل من 24 ساعة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    fourToSevenDays: 'من 4 إلى 7 أيام',
    overSevenDays: 'أكثر من 7 أيام',
    count: (value) => `${value} طلبات دون خطة مكتملة`,
  },
};

export function getMissingFollowUpPlanAgeCopy(locale: Locale): Copy {
  return COPY[locale];
}
