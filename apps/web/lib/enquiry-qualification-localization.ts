import type { Locale } from '@luminol/localization';

export type EnquiryQualificationCopy = {
  city: string;
  preferredContact: string;
  chooseContact: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  phoneHint: string;
  deliveryPreference: string;
  chooseDelivery: string;
  inPerson: string;
  online: string;
  flexible: string;
  notSure: string;
  timingPreference: string;
  chooseTiming: string;
  soon: string;
  withinMonth: string;
  later: string;
};

const COPY: Record<Locale, EnquiryQualificationCopy> = {
  en: {
    city: 'City / area',
    preferredContact: 'Preferred contact',
    chooseContact: 'Choose a contact method',
    contactEmail: 'Email',
    contactPhone: 'Phone',
    contactWhatsapp: 'WhatsApp',
    phoneHint: 'A phone number is required for phone or WhatsApp follow-up.',
    deliveryPreference: 'Preferred format',
    chooseDelivery: 'Choose a format',
    inPerson: 'In person',
    online: 'Online',
    flexible: 'Either / flexible',
    notSure: 'Not sure yet',
    timingPreference: 'Preferred timing',
    chooseTiming: 'Choose timing',
    soon: 'As soon as practical',
    withinMonth: 'Within a month',
    later: 'Later',
  },
  fr: {
    city: 'Ville / région',
    preferredContact: 'Moyen de contact préféré',
    chooseContact: 'Choisissez un moyen de contact',
    contactEmail: 'E-mail',
    contactPhone: 'Téléphone',
    contactWhatsapp: 'WhatsApp',
    phoneHint:
      'Un numéro de téléphone est requis pour un suivi par téléphone ou WhatsApp.',
    deliveryPreference: 'Format préféré',
    chooseDelivery: 'Choisissez un format',
    inPerson: 'En présentiel',
    online: 'En ligne',
    flexible: 'Les deux / flexible',
    notSure: 'Pas encore sûr',
    timingPreference: 'Délai souhaité',
    chooseTiming: 'Choisissez un délai',
    soon: 'Dès que possible',
    withinMonth: 'Dans le mois',
    later: 'Plus tard',
  },
  ar: {
    city: 'المدينة / المنطقة',
    preferredContact: 'وسيلة التواصل المفضلة',
    chooseContact: 'اختر وسيلة التواصل',
    contactEmail: 'البريد الإلكتروني',
    contactPhone: 'الهاتف',
    contactWhatsapp: 'واتساب',
    phoneHint: 'رقم الهاتف مطلوب عند اختيار الهاتف أو واتساب للمتابعة.',
    deliveryPreference: 'طريقة الحضور المفضلة',
    chooseDelivery: 'اختر طريقة الحضور',
    inPerson: 'حضوري',
    online: 'عن بُعد',
    flexible: 'كلاهما / مرن',
    notSure: 'لست متأكدًا بعد',
    timingPreference: 'التوقيت المفضل',
    chooseTiming: 'اختر التوقيت',
    soon: 'في أقرب وقت مناسب',
    withinMonth: 'خلال شهر',
    later: 'لاحقًا',
  },
};

export function getEnquiryQualificationCopy(
  locale: Locale,
): EnquiryQualificationCopy {
  return COPY[locale];
}
