import type { Locale } from '@luminol/localization';

const INCOMPLETE_QUALIFICATION_LABEL: Record<Locale, string> = {
  en: 'Active with incomplete qualification',
  fr: 'Actives avec qualification incomplète',
  ar: 'نشطة ببيانات تأهيل غير مكتملة',
};

export function getIncompleteQualificationAttentionLabel(locale: Locale) {
  return INCOMPLETE_QUALIFICATION_LABEL[locale];
}
