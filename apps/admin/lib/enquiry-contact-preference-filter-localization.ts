import type { Locale } from '@luminol/localization';

export type EnquiryContactPreferenceFilterCopy = {
  eyebrow: string;
  preference: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryContactPreferenceFilterCopy> = {
  en: {
    eyebrow: 'Recorded contact preference',
    preference: 'Preferred contact',
    intro:
      'This protected view is scoped only by the structured contact preference recorded on the enquiry. It does not indicate lead quality, responsiveness, urgency, suitability, conversion probability, programme recommendation or clinical need.',
    clear: 'Clear contact-preference filter',
  },
  fr: {
    eyebrow: 'Préférence de contact enregistrée',
    preference: 'Contact préféré',
    intro:
      'Cette vue protégée est limitée uniquement à la préférence de contact structurée enregistrée sur la demande. Elle n’indique ni la qualité du prospect, ni la réactivité, l’urgence, l’adéquation, une probabilité de conversion, une recommandation de programme ou un besoin clinique.',
    clear: 'Effacer le filtre de préférence de contact',
  },
  ar: {
    eyebrow: 'تفضيل التواصل المسجّل',
    preference: 'وسيلة التواصل المفضلة',
    intro:
      'يقتصر هذا العرض المحمي على تفضيل التواصل المنظم المسجل في الطلب فقط. ولا يدل على جودة الطلب أو سرعة الاستجابة أو الاستعجال أو الملاءمة أو احتمال التحويل أو توصية ببرنامج أو الحاجة السريرية.',
    clear: 'مسح مرشح تفضيل التواصل',
  },
};

export function getEnquiryContactPreferenceFilterCopy(
  locale: Locale,
): EnquiryContactPreferenceFilterCopy {
  return COPY[locale];
}
