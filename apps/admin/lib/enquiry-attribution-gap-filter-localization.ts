import type { Locale } from '@luminol/localization';

import type { EnquiryAttributionGap } from './enquiry-attribution-gap-filter';

export type EnquiryAttributionGapFilterCopy = {
  eyebrow: string;
  intro: string;
  clear: string;
  label: (gap: EnquiryAttributionGap) => string;
};

const COPY: Record<Locale, EnquiryAttributionGapFilterCopy> = {
  en: {
    eyebrow: 'Missing stored attribution field',
    intro:
      'This protected view includes enquiries only because the selected persisted attribution field is missing. It measures data-capture completeness only and does not imply attribution failure, campaign performance, conversion, ROI, lead quality, intent, urgency, suitability or clinical need.',
    clear: 'Clear attribution-gap filter',
    label: (gap) => {
      if (gap === 'utmSource') return 'UTM source not recorded';
      if (gap === 'utmMedium') return 'UTM medium not recorded';
      if (gap === 'utmCampaign') return 'UTM campaign not recorded';
      if (gap === 'utmContent') return 'UTM content not recorded';
      return 'Landing path not recorded';
    },
  },
  fr: {
    eyebrow: 'Champ d’attribution enregistré manquant',
    intro:
      'Cette vue protégée inclut les demandes uniquement parce que le champ d’attribution persistant sélectionné est manquant. Elle mesure seulement la complétude de saisie et n’indique ni un échec d’attribution, ni la performance de campagne, ni la conversion, ni le ROI, ni la qualité du prospect, l’intention, l’urgence, l’adéquation ou un besoin clinique.',
    clear: 'Effacer le filtre d’attribution manquante',
    label: (gap) => {
      if (gap === 'utmSource') return 'Source UTM non enregistrée';
      if (gap === 'utmMedium') return 'Support UTM non enregistré';
      if (gap === 'utmCampaign') return 'Campagne UTM non enregistrée';
      if (gap === 'utmContent') return 'Contenu UTM non enregistré';
      return 'Page d’arrivée non enregistrée';
    },
  },
  ar: {
    eyebrow: 'حقل إسناد محفوظ مفقود',
    intro:
      'يشمل هذا العرض المحمي الطلبات فقط لأن حقل الإسناد المحفوظ المحدد غير مسجل. وهو يقيس اكتمال تسجيل البيانات فقط ولا يعني فشل الإسناد أو أداء الحملة أو التحويل أو العائد على الاستثمار أو جودة الطلب أو النية أو الاستعجال أو الملاءمة أو الحاجة السريرية.',
    clear: 'مسح مرشح نقص الإسناد',
    label: (gap) => {
      if (gap === 'utmSource') return 'مصدر UTM غير مسجل';
      if (gap === 'utmMedium') return 'وسيط UTM غير مسجل';
      if (gap === 'utmCampaign') return 'حملة UTM غير مسجلة';
      if (gap === 'utmContent') return 'محتوى UTM غير مسجل';
      return 'مسار صفحة الوصول غير مسجل';
    },
  },
};

export function getEnquiryAttributionGapFilterCopy(
  locale: Locale,
): EnquiryAttributionGapFilterCopy {
  return COPY[locale];
}
