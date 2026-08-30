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
    eyebrow: 'Recorded contact backlog age',
    title: 'No recorded contact age',
    intro:
      'Current active enquiries with no recorded CONTACTED workflow event, grouped only by how long ago they were created. Absence of that event does not prove no real-world message, call, reply or conversation occurred. This is workflow-record context, not urgency, lead quality or suitability.',
    under24Hours: 'Under 24 hours',
    oneToThreeDays: '1–3 days',
    fourToSevenDays: '4–7 days',
    overSevenDays: 'Over 7 days',
    count: (value) => `${value} enquiries without recorded contact`,
  },
  fr: {
    eyebrow: 'Âge du backlog de contact enregistré',
    title: 'Âge des demandes sans contact enregistré',
    intro:
      'Demandes actuellement actives sans événement de workflow CONTACTED enregistré, regroupées uniquement selon le temps écoulé depuis leur création. L’absence de cet événement ne prouve pas qu’aucun message, appel, réponse ou échange réel n’a eu lieu. Il s’agit d’un contexte d’enregistrement du workflow, et non d’une mesure d’urgence, de qualité ou d’adéquation.',
    under24Hours: 'Moins de 24 heures',
    oneToThreeDays: '1 à 3 jours',
    fourToSevenDays: '4 à 7 jours',
    overSevenDays: 'Plus de 7 jours',
    count: (value) => `${value} demandes sans contact enregistré`,
  },
  ar: {
    eyebrow: 'عمر تراكم الاتصال المسجل',
    title: 'عمر الطلبات دون اتصال مسجل',
    intro:
      'الطلبات النشطة الحالية التي لا تحتوي على حدث سير عمل CONTACTED مسجل، مجمعة فقط حسب المدة منذ إنشائها. غياب هذا الحدث لا يثبت عدم حدوث رسالة أو مكالمة أو رد أو محادثة فعلية. هذا سياق لسجل سير العمل وليس مقياسًا للاستعجال أو جودة الطلب أو الملاءمة.',
    under24Hours: 'أقل من 24 ساعة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    fourToSevenDays: 'من 4 إلى 7 أيام',
    overSevenDays: 'أكثر من 7 أيام',
    count: (value) => `${value} طلبات دون اتصال مسجل`,
  },
};

export function getUnrecordedContactAgeCopy(locale: Locale): Copy {
  return COPY[locale];
}
