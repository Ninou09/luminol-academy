import type { Locale } from '@luminol/localization';

export type EnquiryContactPreferenceCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  missing: string;
  email: string;
  phone: string;
  whatsapp: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryContactPreferenceCopy> = {
  en: {
    eyebrow: 'Recorded contact preference',
    title: 'Preferred contact methods',
    intro:
      'Enquiries received in the last 30 days, grouped only by the contact method the enquirer selected. This records preference, not whether contact was attempted, delivered, answered or successful.',
    missing: 'Not recorded',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Préférence de contact enregistrée',
    title: 'Moyens de contact préférés',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon le moyen de contact choisi. Il s’agit d’une préférence enregistrée, et non d’une preuve de tentative, de livraison, de réponse ou de succès du contact.',
    missing: 'Non renseigné',
    email: 'E-mail',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'تفضيل التواصل المسجل',
    title: 'وسائل التواصل المفضلة',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب وسيلة التواصل التي اختارها صاحب الطلب. هذا يسجل التفضيل ولا يثبت محاولة التواصل أو وصوله أو الرد عليه أو نجاحه.',
    missing: 'غير مسجل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    whatsapp: 'واتساب',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryContactPreferenceCopy(
  locale: Locale,
): EnquiryContactPreferenceCopy {
  return COPY[locale];
}
