import type { Locale } from '@luminol/localization';

const INCOMPLETE_QUALIFICATION_LABEL: Record<Locale, string> = {
  en: 'Active with incomplete qualification',
  fr: 'Actives avec qualification incomplète',
  ar: 'نشطة ببيانات تأهيل غير مكتملة',
};

const NO_RECORDED_CONTACT_COPY: Record<
  Locale,
  { label: string; note: string }
> = {
  en: {
    label: 'Active with no recorded contact',
    note: 'Based on status history only: no Contacted transition is recorded. This does not prove that no email, call or message occurred.',
  },
  fr: {
    label: 'Actives sans contact enregistré',
    note: 'Basé uniquement sur l’historique des statuts : aucune transition « Contacté » n’est enregistrée. Cela ne prouve pas qu’aucun e-mail, appel ou message n’a eu lieu.',
  },
  ar: {
    label: 'نشطة بلا تواصل مسجل',
    note: 'يعتمد ذلك على سجل الحالات فقط: لا يوجد انتقال مسجل إلى «تم التواصل». ولا يثبت هذا عدم حدوث بريد إلكتروني أو مكالمة أو رسالة.',
  },
};

export function getIncompleteQualificationAttentionLabel(locale: Locale) {
  return INCOMPLETE_QUALIFICATION_LABEL[locale];
}

export function getNoRecordedContactAttentionCopy(locale: Locale) {
  return NO_RECORDED_CONTACT_COPY[locale];
}
