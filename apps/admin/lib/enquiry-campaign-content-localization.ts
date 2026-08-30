import type { Locale } from '@luminol/localization';

export type EnquiryCampaignContentCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  recorded: string;
  missing: string;
  topContent: string;
  noContent: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryCampaignContentCopy> = {
  en: {
    eyebrow: 'Stored campaign attribution',
    title: 'Campaign content mix',
    intro:
      'Enquiries received in the last 30 days, grouped only by the persisted UTM content value attached to the enquiry record. These counts describe stored attribution context, not creative performance, ad delivery, impressions, clicks, traffic, conversion, ROI, campaign performance or lead quality.',
    recorded: 'Content recorded',
    missing: 'No content recorded',
    topContent: 'Top recorded content values',
    noContent: 'No recorded UTM content values in this period.',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Attribution de campagne enregistrée',
    title: 'Répartition des contenus de campagne',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon la valeur UTM content enregistrée sur la demande. Ces comptes décrivent un contexte d’attribution enregistré, et non la performance créative, la diffusion publicitaire, les impressions, les clics, le trafic, la conversion, le ROI, la performance de campagne ou la qualité du prospect.',
    recorded: 'Contenu enregistré',
    missing: 'Aucun contenu enregistré',
    topContent: 'Principales valeurs de contenu enregistrées',
    noContent: 'Aucune valeur UTM content enregistrée sur cette période.',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'إسناد الحملة المسجل',
    title: 'توزيع محتوى الحملة',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب قيمة UTM content المحفوظة في سجل الطلب. تصف هذه الأعداد سياق الإسناد المسجل فقط، ولا تقيس أداء المادة الإعلانية أو عرض الإعلانات أو مرات الظهور أو النقرات أو الزيارات أو التحويل أو العائد على الاستثمار أو أداء الحملة أو جودة الطلب.',
    recorded: 'المحتوى مسجل',
    missing: 'لا يوجد محتوى مسجل',
    topContent: 'أبرز قيم المحتوى المسجلة',
    noContent: 'لا توجد قيم UTM content مسجلة خلال هذه الفترة.',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryCampaignContentCopy(
  locale: Locale,
): EnquiryCampaignContentCopy {
  return COPY[locale];
}
