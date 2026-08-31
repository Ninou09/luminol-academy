import type { Locale } from '@luminol/localization';

export type EnquiryLandingPathFilterCopy = {
  eyebrow: string;
  path: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryLandingPathFilterCopy> = {
  en: {
    eyebrow: 'Recorded landing context',
    path: 'Landing path',
    intro:
      'This protected view is scoped only by the exact stored public pathname. It does not measure page traffic, visits, conversion, campaign performance, lead quality, intent, urgency or suitability.',
    clear: 'Clear landing-path filter',
  },
  fr: {
    eyebrow: 'Contexte d’arrivée enregistré',
    path: 'Chemin d’arrivée',
    intro:
      'Cette vue protégée est limitée uniquement au chemin public exact enregistré. Elle ne mesure ni le trafic de page, ni les visites, ni la conversion, ni la performance des campagnes, ni la qualité du prospect, l’intention, l’urgence ou l’adéquation.',
    clear: 'Effacer le filtre de chemin d’arrivée',
  },
  ar: {
    eyebrow: 'سياق الوصول المسجّل',
    path: 'مسار الوصول',
    intro:
      'يقتصر هذا العرض المحمي على مسار الصفحة العامة المحفوظ كما هو تمامًا. ولا يقيس حركة الصفحة أو الزيارات أو التحويل أو أداء الحملات أو جودة الطلب أو النية أو الاستعجال أو الملاءمة.',
    clear: 'مسح مرشح مسار الوصول',
  },
};

export function getEnquiryLandingPathFilterCopy(
  locale: Locale,
): EnquiryLandingPathFilterCopy {
  return COPY[locale];
}
