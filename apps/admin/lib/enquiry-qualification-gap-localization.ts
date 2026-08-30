import type { Locale } from '@luminol/localization';

export type EnquiryQualificationGapCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  activeTotal: string;
  city: string;
  preferredContact: string;
  deliveryPreference: string;
  timingPreference: string;
  count: (value: string) => string;
};

const COPY: Record<Locale, EnquiryQualificationGapCopy> = {
  en: {
    eyebrow: 'Structured qualification gaps',
    title: 'Recent active enquiry qualification gaps',
    intro:
      'Active enquiries received in the last 30 days, counted only where an existing structured qualification field is not recorded. One enquiry can appear in more than one gap count. Explicit “not sure” delivery or timing answers remain completed answers, not gaps. These counts describe data completeness only, not intent, urgency, suitability or lead quality.',
    activeTotal: 'Recent active enquiries',
    city: 'City not recorded',
    preferredContact: 'Contact preference not recorded',
    deliveryPreference: 'Delivery preference not recorded',
    timingPreference: 'Timing preference not recorded',
    count: (value) => `${value} enquiries`,
  },
  fr: {
    eyebrow: 'Lacunes de qualification structurée',
    title: 'Lacunes de qualification des demandes actives récentes',
    intro:
      'Demandes actives reçues au cours des 30 derniers jours, comptées uniquement lorsqu’un champ de qualification structurée existant n’est pas renseigné. Une même demande peut apparaître dans plusieurs comptes de lacunes. Les réponses explicites « pas encore sûr » pour le format ou le calendrier restent des réponses complètes, et non des lacunes. Ces comptes décrivent uniquement la complétude des données, pas l’intention, l’urgence, l’adéquation ou la qualité du prospect.',
    activeTotal: 'Demandes actives récentes',
    city: 'Ville non renseignée',
    preferredContact: 'Préférence de contact non renseignée',
    deliveryPreference: 'Préférence de format non renseignée',
    timingPreference: 'Préférence de calendrier non renseignée',
    count: (value) => `${value} demandes`,
  },
  ar: {
    eyebrow: 'فجوات التأهيل المنظم',
    title: 'فجوات تأهيل الطلبات النشطة الحديثة',
    intro:
      'الطلبات النشطة المستلمة خلال آخر 30 يومًا، مع احتساب الحالات التي لم يُسجَّل فيها أحد حقول التأهيل المنظمة الحالية فقط. قد يظهر الطلب نفسه في أكثر من فجوة. وتبقى إجابة «لست متأكدًا بعد» الصريحة لطريقة الحضور أو التوقيت إجابة مكتملة وليست فجوة. تصف هذه الأعداد اكتمال البيانات فقط، ولا تقيس النية أو الاستعجال أو الملاءمة أو جودة الطلب.',
    activeTotal: 'الطلبات النشطة الحديثة',
    city: 'المدينة غير مسجلة',
    preferredContact: 'تفضيل التواصل غير مسجل',
    deliveryPreference: 'تفضيل طريقة الحضور غير مسجل',
    timingPreference: 'تفضيل التوقيت غير مسجل',
    count: (value) => `${value} طلبات`,
  },
};

export function getEnquiryQualificationGapCopy(
  locale: Locale,
): EnquiryQualificationGapCopy {
  return COPY[locale];
}
