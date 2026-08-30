import type { Locale } from '@luminol/localization';

export type EnquiryCampaignFilterCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  source: string;
  campaign: string;
  medium: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryCampaignFilterCopy> = {
  en: {
    eyebrow: 'Recorded campaign context',
    title: 'Campaign attribution filter',
    intro:
      'This protected view is scoped only by persisted UTM values. It does not measure conversion, ROI, traffic volume, lead quality, intent, urgency or suitability.',
    source: 'UTM source',
    campaign: 'UTM campaign',
    medium: 'UTM medium',
    clear: 'Clear campaign filter',
  },
  fr: {
    eyebrow: 'Contexte de campagne enregistré',
    title: 'Filtre d’attribution de campagne',
    intro:
      'Cette vue protégée est limitée uniquement aux valeurs UTM enregistrées. Elle ne mesure ni la conversion, ni le ROI, ni le volume de trafic, ni la qualité du prospect, ni l’intention, l’urgence ou l’adéquation.',
    source: 'Source UTM',
    campaign: 'Campagne UTM',
    medium: 'Support UTM',
    clear: 'Effacer le filtre de campagne',
  },
  ar: {
    eyebrow: 'سياق الحملة المسجّل',
    title: 'مرشح إسناد الحملة',
    intro:
      'يقتصر هذا العرض المحمي على قيم UTM المحفوظة فقط. ولا يقيس التحويل أو العائد على الاستثمار أو حجم الزيارات أو جودة العميل المحتمل أو النية أو الاستعجال أو الملاءمة.',
    source: 'مصدر UTM',
    campaign: 'حملة UTM',
    medium: 'وسيط UTM',
    clear: 'مسح مرشح الحملة',
  },
};

export function getEnquiryCampaignFilterCopy(
  locale: Locale,
): EnquiryCampaignFilterCopy {
  return COPY[locale];
}
