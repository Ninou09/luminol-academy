import type { Locale } from '@luminol/localization';

export type EnquiryQualificationCopy = {
  optionalDetails: string;
  optionalDetailsHint: string;
  city: string;
  profession: string;
  professionHint: string;
  readiness: string;
  chooseReadiness: string;
  informationFirst: string;
  registrationBooking: string;
  privacyNotice: string;
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
    optionalDetails: 'Add details (optional)',
    optionalDetailsHint:
      'You can discuss these with the team later. Please do not include medical records or sensitive personal details.',
    city: 'City / area',
    profession: 'Profession or field',
    professionHint: 'Especially helpful for professional training requests.',
    readiness: 'What would you like next?',
    chooseReadiness: 'Choose the next step',
    informationFirst: 'Receive the programme or details first',
    registrationBooking: 'Start registration or booking',
    privacyNotice: 'Read the privacy notice',
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
    optionalDetails: 'Ajouter des précisions (facultatif)',
    optionalDetailsHint:
      'Vous pourrez en discuter avec l’équipe plus tard. Ne joignez pas de dossier médical ni de détails personnels sensibles.',
    city: 'Ville / région',
    profession: 'Profession ou spécialité',
    professionHint:
      'Particulièrement utile pour les demandes de formation professionnelle.',
    readiness: 'Quelle suite souhaitez-vous ?',
    chooseReadiness: 'Choisissez la prochaine étape',
    informationFirst: 'Recevoir d’abord le programme ou les informations',
    registrationBooking: 'Commencer l’inscription ou la réservation',
    privacyNotice: 'Lire l’avis de confidentialité',
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
    optionalDetails: 'أضف تفاصيل (اختياري)',
    optionalDetailsHint:
      'يمكنك مناقشة هذه التفاصيل مع الفريق لاحقًا. يرجى عدم إدراج تقارير طبية أو معلومات شخصية حساسة.',
    city: 'المدينة / المنطقة',
    profession: 'المهنة أو التخصص',
    professionHint: 'مهم خصوصًا لتوجيه طلبات التكوين المهني.',
    readiness: 'ما الخطوة التي تفضّلها؟',
    chooseReadiness: 'اختر الخطوة التالية',
    informationFirst: 'استلام البرنامج أو التفاصيل أولًا',
    registrationBooking: 'بدء التسجيل أو الحجز',
    privacyNotice: 'اقرأ إشعار الخصوصية',
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
