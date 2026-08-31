import type { Locale } from '@luminol/localization';

import type { EnquiryFollowUpTimingBucket } from './enquiry-follow-up-timing-filter';

export type EnquiryFollowUpTimingFilterCopy = {
  eyebrow: string;
  intro: string;
  clear: string;
  label: (bucket: EnquiryFollowUpTimingBucket) => string;
};

const COPY: Record<Locale, EnquiryFollowUpTimingFilterCopy> = {
  en: {
    eyebrow: 'Active follow-up timing',
    intro:
      'This protected view uses only the recorded follow-up plan and the established active-enquiry timing boundaries. Past due is workflow timing, not inferred urgency, priority, lead quality, readiness, suitability, conversion probability or clinical need; a missing plan means operational incompleteness, not low intent.',
    clear: 'Clear follow-up timing filter',
    label: (bucket) => {
      if (bucket === 'missingPlan') return 'Follow-up plan missing';
      if (bucket === 'pastDue') return 'Past due';
      if (bucket === 'next24Hours') return 'Next 24 hours';
      if (bucket === 'oneToThreeDays') return '1–3 days';
      return 'Later';
    },
  },
  fr: {
    eyebrow: 'Échéance du suivi actif',
    intro:
      'Cette vue protégée utilise uniquement le plan de suivi enregistré et les limites temporelles établies pour les demandes actives. Un suivi en retard décrit une échéance de travail et n’indique ni urgence, ni priorité, ni qualité du prospect, ni préparation, ni adéquation, ni probabilité de conversion ou besoin clinique ; un plan manquant signifie seulement que le suivi opérationnel est incomplet, pas une faible intention.',
    clear: 'Effacer le filtre d’échéance du suivi',
    label: (bucket) => {
      if (bucket === 'missingPlan') return 'Plan de suivi manquant';
      if (bucket === 'pastDue') return 'En retard';
      if (bucket === 'next24Hours') return 'Prochaines 24 heures';
      if (bucket === 'oneToThreeDays') return '1 à 3 jours';
      return 'Plus tard';
    },
  },
  ar: {
    eyebrow: 'توقيت المتابعة النشطة',
    intro:
      'يستخدم هذا العرض المحمي فقط خطة المتابعة المسجلة والحدود الزمنية المعتمدة للطلبات النشطة. وتعني المتابعة المتأخرة توقيت سير العمل فقط، ولا تدل على استعجال أو أولوية أو جودة الطلب أو الجاهزية أو الملاءمة أو احتمال التحويل أو حاجة سريرية؛ أما غياب الخطة فيعني نقصًا تشغيليًا فقط ولا يعني ضعف الاهتمام.',
    clear: 'مسح مرشح توقيت المتابعة',
    label: (bucket) => {
      if (bucket === 'missingPlan') return 'خطة المتابعة غير مكتملة';
      if (bucket === 'pastDue') return 'موعد المتابعة مضى';
      if (bucket === 'next24Hours') return 'خلال 24 ساعة القادمة';
      if (bucket === 'oneToThreeDays') return 'من يوم إلى 3 أيام';
      return 'لاحقًا';
    },
  },
};

export function getEnquiryFollowUpTimingFilterCopy(
  locale: Locale,
): EnquiryFollowUpTimingFilterCopy {
  return COPY[locale];
}
