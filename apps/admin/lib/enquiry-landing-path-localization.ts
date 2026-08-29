import type { Locale } from '@luminol/localization';

export type EnquiryLandingPathCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  recorded: string;
  missing: string;
  topPaths: string;
  noPaths: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryLandingPathCopy> = {
  en: {
    eyebrow: 'Stored enquiry landing context',
    title: '30-day enquiry landing paths',
    intro:
      'Enquiries received in the last 30 days, grouped only by the stored public pathname submitted with the enquiry. These counts are enquiry landing context, not page traffic, visits, conversion rates, campaign performance or lead quality.',
    recorded: 'Landing path recorded',
    missing: 'No landing path stored',
    topPaths: 'Top stored landing paths',
    noPaths: 'No stored landing paths in this period.',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Contexte de page d’arrivée enregistré',
    title: 'Pages d’arrivée des demandes sur 30 jours',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon le chemin public enregistré avec la demande. Ces volumes décrivent le contexte de page d’arrivée des demandes, et non le trafic, les visites, le taux de conversion, la performance des campagnes ou la qualité des prospects.',
    recorded: 'Page d’arrivée enregistrée',
    missing: 'Aucune page d’arrivée enregistrée',
    topPaths: 'Principaux chemins enregistrés',
    noPaths: 'Aucun chemin d’arrivée enregistré sur cette période.',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'سياق صفحة الوصول المسجل للطلب',
    title: 'مسارات وصول الطلبات خلال 30 يومًا',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب مسار الصفحة العامة المحفوظ مع الطلب. هذه الأعداد تصف سياق وصول الطلبات ولا تمثل زيارات الصفحات أو حركة الموقع أو معدل التحويل أو أداء الحملات أو جودة الطلبات.',
    recorded: 'تم تسجيل مسار الوصول',
    missing: 'لا يوجد مسار وصول محفوظ',
    topPaths: 'أبرز مسارات الوصول المحفوظة',
    noPaths: 'لا توجد مسارات وصول محفوظة خلال هذه الفترة.',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryLandingPathCopy(
  locale: Locale,
): EnquiryLandingPathCopy {
  return COPY[locale];
}
