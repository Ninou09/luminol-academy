import type { Locale } from '@luminol/localization';

import type { EnquiryQualificationGap } from './enquiry-qualification-gap-filter';

export type EnquiryQualificationGapFilterCopy = {
  eyebrow: string;
  intro: string;
  clear: string;
  label: (gap: EnquiryQualificationGap) => string;
};

const COPY: Record<Locale, EnquiryQualificationGapFilterCopy> = {
  en: {
    eyebrow: 'Missing structured qualification field',
    intro:
      'This protected view includes enquiries only because the selected persisted qualification field is missing. It does not score lead quality, intent, readiness, suitability, urgency or clinical need, and it does not infer a replacement value from other data.',
    clear: 'Clear qualification-gap filter',
    label: (gap) => {
      if (gap === 'city') return 'City not recorded';
      if (gap === 'preferredContact') return 'Preferred contact not recorded';
      if (gap === 'deliveryPreference')
        return 'Delivery preference not recorded';
      return 'Requested timing not recorded';
    },
  },
  fr: {
    eyebrow: 'Champ de qualification structuré manquant',
    intro:
      'Cette vue protégée inclut les demandes uniquement parce que le champ de qualification enregistré sélectionné est manquant. Elle n’évalue ni la qualité du prospect, ni l’intention, ni la préparation, ni l’adéquation, ni l’urgence ou un besoin clinique, et elle ne déduit aucune valeur de remplacement à partir d’autres données.',
    clear: 'Effacer le filtre de qualification manquante',
    label: (gap) => {
      if (gap === 'city') return 'Ville non enregistrée';
      if (gap === 'preferredContact') return 'Contact préféré non enregistré';
      if (gap === 'deliveryPreference') {
        return 'Préférence de modalité non enregistrée';
      }
      return 'Moment souhaité non enregistré';
    },
  },
  ar: {
    eyebrow: 'حقل تأهيل منظم مفقود',
    intro:
      'يشمل هذا العرض المحمي الطلبات فقط لأن حقل التأهيل المحفوظ المحدد غير مسجل. ولا يمثل ذلك تقييمًا لجودة الطلب أو النية أو الجاهزية أو الملاءمة أو الاستعجال أو الحاجة السريرية، كما لا يتم استنتاج قيمة بديلة من أي بيانات أخرى.',
    clear: 'مسح مرشح نقص التأهيل',
    label: (gap) => {
      if (gap === 'city') return 'المدينة غير مسجلة';
      if (gap === 'preferredContact') return 'وسيلة التواصل المفضلة غير مسجلة';
      if (gap === 'deliveryPreference') return 'تفضيل طريقة التقديم غير مسجل';
      return 'التوقيت المطلوب غير مسجل';
    },
  },
};

export function getEnquiryQualificationGapFilterCopy(
  locale: Locale,
): EnquiryQualificationGapFilterCopy {
  return COPY[locale];
}
