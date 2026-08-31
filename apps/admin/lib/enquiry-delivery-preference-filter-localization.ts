import type { Locale } from '@luminol/localization';

export type EnquiryDeliveryPreferenceFilterCopy = {
  eyebrow: string;
  preference: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryDeliveryPreferenceFilterCopy> = {
  en: {
    eyebrow: 'Recorded delivery preference',
    preference: 'Delivery preference',
    intro:
      'This protected view is scoped only by the structured delivery preference recorded on the enquiry. It does not indicate lead quality, intent, urgency, suitability, conversion probability, programme recommendation or clinical need.',
    clear: 'Clear delivery-preference filter',
  },
  fr: {
    eyebrow: 'Préférence de format enregistrée',
    preference: 'Préférence de format',
    intro:
      'Cette vue protégée est limitée uniquement à la préférence de format structurée enregistrée sur la demande. Elle n’indique ni la qualité du prospect, ni l’intention, l’urgence, l’adéquation, une probabilité de conversion, une recommandation de programme ou un besoin clinique.',
    clear: 'Effacer le filtre de préférence de format',
  },
  ar: {
    eyebrow: 'تفضيل نمط التقديم المسجّل',
    preference: 'تفضيل نمط التقديم',
    intro:
      'يقتصر هذا العرض المحمي على تفضيل نمط التقديم المنظم المسجل في الطلب فقط. ولا يدل على جودة الطلب أو النية أو الاستعجال أو الملاءمة أو احتمال التحويل أو توصية ببرنامج أو الحاجة السريرية.',
    clear: 'مسح مرشح تفضيل نمط التقديم',
  },
};

export function getEnquiryDeliveryPreferenceFilterCopy(
  locale: Locale,
): EnquiryDeliveryPreferenceFilterCopy {
  return COPY[locale];
}
