import type { Locale } from '@luminol/localization';

export type EnquiryDeliveryPreferenceCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  missing: string;
  inPerson: string;
  online: string;
  flexible: string;
  notSure: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryDeliveryPreferenceCopy> = {
  en: {
    eyebrow: 'Recorded delivery preference',
    title: 'Preferred delivery formats',
    intro:
      'Enquiries received in the last 30 days, grouped only by the delivery format the enquirer selected. “Not sure yet” is a recorded answer, not missing data, and none of these labels imply intent, suitability or performance.',
    missing: 'Not recorded',
    inPerson: 'In person',
    online: 'Online',
    flexible: 'Either / flexible',
    notSure: 'Not sure yet',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Préférence de format enregistrée',
    title: 'Formats de prestation préférés',
    intro:
      'Demandes reçues au cours des 30 derniers jours, regroupées uniquement selon le format choisi. « Pas encore sûr » est une réponse enregistrée, et non une donnée manquante, et ces libellés ne mesurent ni intention, ni adéquation, ni performance.',
    missing: 'Non renseigné',
    inPerson: 'En présentiel',
    online: 'En ligne',
    flexible: 'Les deux / flexible',
    notSure: 'Pas encore sûr',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'تفضيل طريقة الحضور المسجل',
    title: 'طرق الحضور المفضلة',
    intro:
      'الطلبات المستلمة خلال آخر 30 يومًا مجمعة فقط حسب طريقة الحضور التي اختارها صاحب الطلب. «لست متأكدًا بعد» إجابة مسجلة وليست بيانات مفقودة، ولا تعني هذه الخيارات مستوى النية أو الملاءمة أو الأداء.',
    missing: 'غير مسجل',
    inPerson: 'حضوري',
    online: 'عن بُعد',
    flexible: 'كلاهما / مرن',
    notSure: 'لست متأكدًا بعد',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryDeliveryPreferenceCopy(
  locale: Locale,
): EnquiryDeliveryPreferenceCopy {
  return COPY[locale];
}
