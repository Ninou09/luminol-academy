import type { Locale } from '@luminol/localization';

export type EnquirySchoolFilterCopy = {
  eyebrow: string;
  school: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquirySchoolFilterCopy> = {
  en: {
    eyebrow: 'Recorded school context',
    school: 'School',
    intro:
      'This protected view is scoped only by the structured school recorded on the enquiry. It does not indicate lead quality, intent, urgency, suitability, programme recommendation, conversion probability or clinical need.',
    clear: 'Clear school filter',
  },
  fr: {
    eyebrow: 'Contexte d’école enregistré',
    school: 'École',
    intro:
      'Cette vue protégée est limitée uniquement à l’école structurée enregistrée sur la demande. Elle n’indique ni la qualité du prospect, ni l’intention, l’urgence, l’adéquation, une recommandation de programme, une probabilité de conversion ou un besoin clinique.',
    clear: 'Effacer le filtre d’école',
  },
  ar: {
    eyebrow: 'سياق المدرسة المسجّل',
    school: 'المدرسة',
    intro:
      'يقتصر هذا العرض المحمي على المدرسة المنظمة المسجلة في الطلب فقط. ولا يدل على جودة الطلب أو النية أو الاستعجال أو الملاءمة أو توصية ببرنامج أو احتمال التحويل أو الحاجة السريرية.',
    clear: 'مسح مرشح المدرسة',
  },
};

export function getEnquirySchoolFilterCopy(
  locale: Locale,
): EnquirySchoolFilterCopy {
  return COPY[locale];
}
