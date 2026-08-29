import type { Locale } from '@luminol/localization';

type EnquiryAttributionCopy = {
  campaignAttribution: string;
  landingPath: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
};

const COPY: Record<Locale, EnquiryAttributionCopy> = {
  en: {
    campaignAttribution: 'Campaign attribution',
    landingPath: 'Landing path',
    source: 'source',
    medium: 'medium',
    campaign: 'campaign',
    content: 'content',
  },
  fr: {
    campaignAttribution: 'Attribution de campagne',
    landingPath: 'Page d’arrivée',
    source: 'source',
    medium: 'support',
    campaign: 'campagne',
    content: 'contenu',
  },
  ar: {
    campaignAttribution: 'إسناد الحملة',
    landingPath: 'مسار صفحة الوصول',
    source: 'المصدر',
    medium: 'الوسيط',
    campaign: 'الحملة',
    content: 'المحتوى',
  },
};

export function getEnquiryAttributionCopy(locale: Locale) {
  return COPY[locale];
}
