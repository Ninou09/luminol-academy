import type { Locale } from '@luminol/localization';

export type EnquiryTimingPreferenceCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  missing: string;
  soon: string;
  withinMonth: string;
  later: string;
  notSure: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryTimingPreferenceCopy> = {
  en: {
    eyebrow: 'Recorded requested timing',
    title: 'Requested timing preferences',
    intro:
      'Enquiries received in the last 30 days, grouped only by the timing answer the enquirer selected. “Not sure yet” is a recorded answer, not missing data, and these labels do not imply urgency, priority, readiness, suitability or lead quality.',
    missing: 'Not recorded',
    soon: 'As soon as possible',
    withinMonth: 'Within a month',
    later: 'Later',
    notSure: 'Not sure yet',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Échéance souhaitée enregistrée',
    title: 'Préférences de calendrier demandées',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon la réponse de calendrier choisie. « Pas encore sûr » est une réponse enregistrée, et non une donnée manquante, et ces libellés ne signifient ni urgence, ni priorité, ni maturité, ni adéquation, ni qualité du prospect.',
    missing: 'Non renseigné',
    soon: 'Dès que possible',
    withinMonth: 'Dans le mois',
    later: 'Plus tard',
    notSure: 'Pas encore sûr',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'التوقيت المطلوب المسجل',
    title: 'تفضيلات التوقيت المطلوبة',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب إجابة التوقيت التي اختارها صاحب الطلب. «لست متأكدًا بعد» إجابة مسجلة وليست بيانات مفقودة، ولا تعني هذه الخيارات وجود حالة استعجال أو أولوية أو جاهزية أو ملاءمة أو جودة أعلى للطلب.',
    missing: 'غير مسجل',
    soon: 'في أقرب وقت ممكن',
    withinMonth: 'خلال شهر',
    later: 'لاحقًا',
    notSure: 'لست متأكدًا بعد',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryTimingPreferenceCopy(
  locale: Locale,
): EnquiryTimingPreferenceCopy {
  return COPY[locale];
}
