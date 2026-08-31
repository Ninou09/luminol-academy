import type { Locale } from '@luminol/localization';

import type { EnquiryActiveAgeBucket } from './enquiry-active-age-filter';

export type EnquiryActiveAgeFilterCopy = {
  eyebrow: string;
  intro: string;
  clear: string;
  label: (bucket: EnquiryActiveAgeBucket) => string;
};

const COPY: Record<Locale, EnquiryActiveAgeFilterCopy> = {
  en: {
    eyebrow: 'Active enquiry age',
    intro:
      'This protected view uses only elapsed time since the enquiry was recorded and the established active-status definition. The age bucket does not indicate urgency, priority, lead quality, readiness, suitability, conversion probability or clinical need.',
    clear: 'Clear active-age filter',
    label: (bucket) => {
      if (bucket === 'under24Hours') return 'Under 24 hours';
      if (bucket === 'oneToThreeDays') return '1–3 days';
      if (bucket === 'fourToSevenDays') return '4–7 days';
      return 'Over 7 days';
    },
  },
  fr: {
    eyebrow: 'Âge des demandes actives',
    intro:
      'Cette vue protégée utilise uniquement le temps écoulé depuis l’enregistrement de la demande et la définition établie des statuts actifs. La tranche d’âge n’indique ni urgence, ni priorité, ni qualité du prospect, ni préparation, ni adéquation, ni probabilité de conversion ou besoin clinique.',
    clear: 'Effacer le filtre d’âge actif',
    label: (bucket) => {
      if (bucket === 'under24Hours') return 'Moins de 24 heures';
      if (bucket === 'oneToThreeDays') return '1 à 3 jours';
      if (bucket === 'fourToSevenDays') return '4 à 7 jours';
      return 'Plus de 7 jours';
    },
  },
  ar: {
    eyebrow: 'عمر الطلبات النشطة',
    intro:
      'يستخدم هذا العرض المحمي فقط الوقت المنقضي منذ تسجيل الطلب وتعريف الحالات النشطة المعتمد. ولا تعني الفئة الزمنية وجود استعجال أو أولوية أو جودة أعلى للطلب أو جاهزية أو ملاءمة أو احتمال تحويل أو حاجة سريرية.',
    clear: 'مسح مرشح عمر الطلب النشط',
    label: (bucket) => {
      if (bucket === 'under24Hours') return 'أقل من 24 ساعة';
      if (bucket === 'oneToThreeDays') return 'من يوم إلى 3 أيام';
      if (bucket === 'fourToSevenDays') return 'من 4 إلى 7 أيام';
      return 'أكثر من 7 أيام';
    },
  },
};

export function getEnquiryActiveAgeFilterCopy(
  locale: Locale,
): EnquiryActiveAgeFilterCopy {
  return COPY[locale];
}
