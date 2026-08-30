import type { Locale } from '@luminol/localization';

export type EnquiryCampaignMediumCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  recorded: string;
  missing: string;
  topMedia: string;
  noMedia: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryCampaignMediumCopy> = {
  en: {
    eyebrow: 'Stored campaign attribution',
    title: 'Campaign medium mix',
    intro:
      'Enquiries received in the last 30 days, grouped only by the persisted UTM medium value attached to the enquiry record. These counts describe stored attribution context, not ad delivery, traffic, conversion, ROI, campaign performance or lead quality.',
    recorded: 'Medium recorded',
    missing: 'No medium recorded',
    topMedia: 'Top recorded media',
    noMedia: 'No recorded UTM medium values in this period.',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Attribution de campagne enregistrée',
    title: 'Répartition des supports de campagne',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon la valeur UTM medium enregistrée sur la demande. Ces comptes décrivent un contexte d’attribution enregistré, et non la diffusion publicitaire, le trafic, la conversion, le ROI, la performance de campagne ou la qualité du prospect.',
    recorded: 'Support enregistré',
    missing: 'Aucun support enregistré',
    topMedia: 'Principaux supports enregistrés',
    noMedia: 'Aucune valeur UTM medium enregistrée sur cette période.',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'إسناد الحملة المسجل',
    title: 'توزيع وسيط الحملة',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب قيمة UTM medium المحفوظة في سجل الطلب. تصف هذه الأعداد سياق الإسناد المسجل فقط، ولا تقيس عرض الإعلانات أو الزيارات أو التحويل أو العائد على الاستثمار أو أداء الحملة أو جودة الطلب.',
    recorded: 'الوسيط مسجل',
    missing: 'لا يوجد وسيط مسجل',
    topMedia: 'أبرز الوسائط المسجلة',
    noMedia: 'لا توجد قيم UTM medium مسجلة خلال هذه الفترة.',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryCampaignMediumCopy(
  locale: Locale,
): EnquiryCampaignMediumCopy {
  return COPY[locale];
}
