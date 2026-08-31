import type { Locale } from '@luminol/localization';

export type EnquiryTimingPreferenceFilterCopy = {
  eyebrow: string;
  preference: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryTimingPreferenceFilterCopy> = {
  en: {
    eyebrow: 'Recorded requested timing',
    preference: 'Requested timing',
    intro:
      'This protected view is scoped only by the structured requested timing recorded on the enquiry. “Soon” is not an emergency or urgency signal, and “Not sure yet” is a recorded answer rather than low intent. It does not indicate lead quality, readiness, suitability, conversion probability, programme recommendation or clinical need.',
    clear: 'Clear timing-preference filter',
  },
  fr: {
    eyebrow: 'Calendrier souhaité enregistré',
    preference: 'Calendrier souhaité',
    intro:
      'Cette vue protégée est limitée uniquement au calendrier souhaité structuré enregistré sur la demande. « Bientôt » ne constitue pas un signal d’urgence ou d’urgence clinique, et « Pas encore sûr » est une réponse enregistrée plutôt qu’un signe de faible intention. Elle n’indique ni la qualité du prospect, ni la préparation, l’adéquation, une probabilité de conversion, une recommandation de programme ou un besoin clinique.',
    clear: 'Effacer le filtre de calendrier souhaité',
  },
  ar: {
    eyebrow: 'التوقيت المطلوب المسجّل',
    preference: 'التوقيت المطلوب',
    intro:
      'يقتصر هذا العرض المحمي على التوقيت المطلوب المنظم والمسجل في الطلب فقط. خيار «قريبًا» ليس إشارة إلى حالة طارئة أو درجة استعجال، وخيار «غير متأكد بعد» هو إجابة مسجلة وليس دليلاً على ضعف النية. ولا يدل هذا التوقيت على جودة الطلب أو الجاهزية أو الملاءمة أو احتمال التحويل أو توصية ببرنامج أو حاجة سريرية.',
    clear: 'مسح مرشح التوقيت المطلوب',
  },
};

export function getEnquiryTimingPreferenceFilterCopy(
  locale: Locale,
): EnquiryTimingPreferenceFilterCopy {
  return COPY[locale];
}
