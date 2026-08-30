import type { Locale } from '@luminol/localization';

export type EnquiryAttributionCoverageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  landingPath: string;
  recordedOfTotal: (recorded: string, total: string) => string;
};

const COPY: Record<Locale, EnquiryAttributionCoverageCopy> = {
  en: {
    eyebrow: 'Attribution data completeness',
    title: 'Stored attribution field coverage',
    intro:
      'Share of enquiry records from the last 30 days with each persisted attribution field present. This is data-capture completeness only, not attribution accuracy, traffic quality, campaign performance, conversion, ROI or lead quality.',
    utmSource: 'UTM source',
    utmMedium: 'UTM medium',
    utmCampaign: 'UTM campaign',
    utmContent: 'UTM content',
    landingPath: 'Landing path',
    recordedOfTotal: (recorded, total) => `${recorded} of ${total} recorded`,
  },
  fr: {
    eyebrow: 'Complétude des données d’attribution',
    title: 'Couverture des champs d’attribution enregistrés',
    intro:
      'Part des demandes des 30 derniers jours pour lesquelles chaque champ d’attribution persistant est présent. Il s’agit uniquement de complétude de saisie, et non de précision d’attribution, de qualité du trafic, de performance de campagne, de conversion, de ROI ou de qualité du prospect.',
    utmSource: 'Source UTM',
    utmMedium: 'Support UTM',
    utmCampaign: 'Campagne UTM',
    utmContent: 'Contenu UTM',
    landingPath: 'Page d’arrivée',
    recordedOfTotal: (recorded, total) =>
      `${recorded} sur ${total} enregistrés`,
  },
  ar: {
    eyebrow: 'اكتمال بيانات الإسناد',
    title: 'تغطية حقول الإسناد المسجلة',
    intro:
      'نسبة سجلات الطلبات خلال آخر 30 يومًا التي تحتوي على كل حقل إسناد محفوظ. هذا مقياس لاكتمال تسجيل البيانات فقط، وليس لدقة الإسناد أو جودة الزيارات أو أداء الحملة أو التحويل أو العائد على الاستثمار أو جودة الطلب.',
    utmSource: 'مصدر UTM',
    utmMedium: 'وسيط UTM',
    utmCampaign: 'حملة UTM',
    utmContent: 'محتوى UTM',
    landingPath: 'مسار صفحة الوصول',
    recordedOfTotal: (recorded, total) => `${recorded} من ${total} مسجلة`,
  },
};

export function getEnquiryAttributionCoverageCopy(
  locale: Locale,
): EnquiryAttributionCoverageCopy {
  return COPY[locale];
}
