import type { Locale } from '@luminol/localization';

export type EnquiryCityFilterCopy = {
  eyebrow: string;
  city: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryCityFilterCopy> = {
  en: {
    eyebrow: 'Recorded city context',
    city: 'Recorded city',
    intro:
      'This protected view uses only the exact city text stored with the enquiry. It does not geocode, merge spellings, infer a region, or treat city as a lead-quality, suitability, demographic or clinical signal.',
    clear: 'Clear city filter',
  },
  fr: {
    eyebrow: 'Contexte de ville enregistré',
    city: 'Ville enregistrée',
    intro:
      'Cette vue protégée utilise uniquement le texte exact de la ville enregistré avec la demande. Elle ne géocode pas, ne fusionne pas les variantes orthographiques, n’infère pas de région et ne traite pas la ville comme un signal de qualité du prospect, d’adéquation, démographique ou clinique.',
    clear: 'Effacer le filtre de ville',
  },
  ar: {
    eyebrow: 'سياق المدينة المسجّل',
    city: 'المدينة المسجّلة',
    intro:
      'يستخدم هذا العرض المحمي فقط نص المدينة المطابق لما حُفظ مع الطلب. لا يحوّل المدينة إلى إحداثيات، ولا يدمج اختلافات الكتابة، ولا يستنتج منطقة، ولا يعامل المدينة كمؤشر على جودة الطلب أو الملاءمة أو الخصائص الديموغرافية أو الحالة السريرية.',
    clear: 'مسح مرشح المدينة',
  },
};

export function getEnquiryCityFilterCopy(
  locale: Locale,
): EnquiryCityFilterCopy {
  return COPY[locale];
}
