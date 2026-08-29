import type { Locale } from '@luminol/localization';

type EnquiryCampaignReportingCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  tagged: string;
  taggedNote: string;
  untagged: string;
  untaggedNote: string;
  sourceMix: string;
  campaignMix: string;
  campaignPair: (source: string, campaign: string) => string;
  enquiryCount: (count: string) => string;
  noSources: string;
  noCampaigns: string;
};

const COPY: Record<Locale, EnquiryCampaignReportingCopy> = {
  en: {
    eyebrow: 'Acquisition context',
    title: '30-day campaign-attributed enquiry mix',
    intro:
      'Raw enquiry volume from stored UTM context. These labels are submitted campaign context, not proof of ad delivery, spend, conversion, ROI, or lead quality.',
    tagged: 'Tagged campaign enquiries',
    taggedNote: 'Recent enquiries with a stored UTM source',
    untagged: 'No campaign source tag',
    untaggedNote: 'Recent enquiries without a stored UTM source',
    sourceMix: 'Top UTM sources',
    campaignMix: 'Top source + campaign pairs',
    campaignPair: (source, campaign) => `${source} · ${campaign}`,
    enquiryCount: (count) => `${count} enquiries`,
    noSources: 'No tagged UTM sources were recorded in this window.',
    noCampaigns: 'No source + campaign pairs were recorded in this window.',
  },
  fr: {
    eyebrow: 'Contexte d’acquisition',
    title: 'Répartition des demandes attribuées aux campagnes sur 30 jours',
    intro:
      'Volume brut des demandes selon le contexte UTM enregistré. Ces libellés représentent un contexte de campagne transmis, et ne prouvent ni diffusion publicitaire, ni dépense, ni conversion, ni ROI, ni qualité du prospect.',
    tagged: 'Demandes avec balise de campagne',
    taggedNote: 'Demandes récentes avec une source UTM enregistrée',
    untagged: 'Sans balise de source de campagne',
    untaggedNote: 'Demandes récentes sans source UTM enregistrée',
    sourceMix: 'Principales sources UTM',
    campaignMix: 'Principaux couples source + campagne',
    campaignPair: (source, campaign) => `${source} · ${campaign}`,
    enquiryCount: (count) => `${count} demandes`,
    noSources:
      'Aucune source UTM balisée n’a été enregistrée sur cette période.',
    noCampaigns:
      'Aucun couple source + campagne n’a été enregistré sur cette période.',
  },
  ar: {
    eyebrow: 'سياق الاستحواذ',
    title: 'توزيع الطلبات المرتبطة بالحملات خلال 30 يومًا',
    intro:
      'حجم خام للطلبات استنادًا إلى سياق UTM المحفوظ. هذه التسميات تمثل سياق حملة مُرسَلًا ولا تثبت عرض إعلان أو الإنفاق أو التحويل أو العائد على الاستثمار أو جودة العميل المحتمل.',
    tagged: 'طلبات تحمل وسم حملة',
    taggedNote: 'طلبات حديثة تحتوي على مصدر UTM محفوظ',
    untagged: 'من دون وسم مصدر حملة',
    untaggedNote: 'طلبات حديثة من دون مصدر UTM محفوظ',
    sourceMix: 'أهم مصادر UTM',
    campaignMix: 'أهم أزواج المصدر + الحملة',
    campaignPair: (source, campaign) => `${source} · ${campaign}`,
    enquiryCount: (count) => `${count} طلبات`,
    noSources: 'لم يتم تسجيل مصادر UTM موسومة خلال هذه الفترة.',
    noCampaigns: 'لم يتم تسجيل أزواج مصدر + حملة خلال هذه الفترة.',
  },
};

export function getEnquiryCampaignReportingCopy(locale: Locale) {
  return COPY[locale];
}
