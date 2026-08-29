import type { Locale } from '@luminol/localization';

export type RecentEnquiryStatusMixCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  noData: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, RecentEnquiryStatusMixCopy> = {
  en: {
    eyebrow: 'Current recorded workflow state',
    title: '30-day enquiry current-status mix',
    intro:
      'Enquiries created in the last 30 days, grouped only by their current recorded workflow status. Closed does not imply a sale or treatment success, and this panel does not measure conversion, response rate, urgency, suitability or lead quality.',
    noData: 'No enquiries were created in this period.',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'État actuel du workflow enregistré',
    title: 'Répartition des statuts actuels sur 30 jours',
    intro:
      'Demandes créées au cours des 30 derniers jours, regroupées uniquement selon leur statut de workflow actuellement enregistré. « Clôturé » ne signifie ni vente ni réussite de traitement, et ce panneau ne mesure ni conversion, ni taux de réponse, ni urgence, ni adéquation, ni qualité des prospects.',
    noData: 'Aucune demande créée sur cette période.',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'حالة سير العمل الحالية المسجلة',
    title: 'توزيع حالات الطلبات الحالية خلال 30 يومًا',
    intro:
      'الطلبات المنشأة خلال آخر 30 يومًا مجمعة فقط حسب حالة سير العمل المسجلة حاليًا. الحالة «مغلق» لا تعني حدوث بيع أو نجاح علاج، ولا تقيس هذه اللوحة التحويل أو معدل الاستجابة أو الاستعجال أو الملاءمة أو جودة الطلبات.',
    noData: 'لا توجد طلبات منشأة خلال هذه الفترة.',
    count: (value) => `${value} طلبات`,
  },
};

export function getRecentEnquiryStatusMixCopy(
  locale: Locale,
): RecentEnquiryStatusMixCopy {
  return COPY[locale];
}
