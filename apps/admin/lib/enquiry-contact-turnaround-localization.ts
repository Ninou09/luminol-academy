import type { SupportedLocale } from '@luminol/localization';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  contacted: string;
  contactedNote: string;
  uncontacted: string;
  uncontactedNote: string;
  median: string;
  medianNote: string;
  noMedian: string;
  bucketsTitle: string;
  underOneHour: string;
  oneToFourHours: string;
  fourToTwentyFourHours: string;
  overTwentyFourHours: string;
  minutes: (value: string) => string;
  hours: (value: string) => string;
  recordedCount: (value: string) => string;
};

const copy: Record<SupportedLocale, Copy> = {
  en: {
    eyebrow: 'Recorded response timing',
    title: '30-day enquiry first-contact turnaround',
    intro:
      'Operational timing based on the earliest recorded status transition to Contacted for enquiries received in the last 30 days. It does not prove message delivery, reply receipt, call completion, conversion or lead quality.',
    contacted: 'Recorded as contacted',
    contactedNote: 'Recent enquiries with a structured Contacted status event.',
    uncontacted: 'No Contacted event yet',
    uncontactedNote:
      'Recent enquiries without a recorded Contacted transition.',
    median: 'Median recorded turnaround',
    medianNote:
      'Median time from enquiry creation to the first Contacted event.',
    noMedian: 'No recorded contacts',
    bucketsTitle: 'Recorded-contact turnaround buckets',
    underOneHour: 'Under 1 hour',
    oneToFourHours: '1–4 hours',
    fourToTwentyFourHours: '4–24 hours',
    overTwentyFourHours: '24+ hours',
    minutes: (value) => `${value} min`,
    hours: (value) => `${value} h`,
    recordedCount: (value) =>
      `${value} recorded contact${value === '1' ? '' : 's'}`,
  },
  fr: {
    eyebrow: 'Délai de contact enregistré',
    title: 'Délai du premier contact sur 30 jours',
    intro:
      'Mesure opérationnelle fondée sur la première transition de statut enregistrée vers « Contacté » pour les demandes reçues au cours des 30 derniers jours. Elle ne prouve ni la livraison d’un message, ni la réception d’une réponse, ni l’aboutissement d’un appel, ni une conversion ou la qualité d’un prospect.',
    contacted: 'Contact enregistré',
    contactedNote:
      'Demandes récentes avec un événement structuré « Contacté ».',
    uncontacted: 'Aucun événement « Contacté »',
    uncontactedNote:
      'Demandes récentes sans transition enregistrée vers « Contacté ».',
    median: 'Délai médian enregistré',
    medianNote:
      'Temps médian entre la création de la demande et le premier événement « Contacté ».',
    noMedian: 'Aucun contact enregistré',
    bucketsTitle: 'Répartition des délais de contact enregistrés',
    underOneHour: 'Moins de 1 heure',
    oneToFourHours: '1–4 heures',
    fourToTwentyFourHours: '4–24 heures',
    overTwentyFourHours: '24 h et plus',
    minutes: (value) => `${value} min`,
    hours: (value) => `${value} h`,
    recordedCount: (value) => `${value} contact(s) enregistré(s)`,
  },
  ar: {
    eyebrow: 'توقيت التواصل المسجل',
    title: 'زمن تسجيل أول تواصل خلال 30 يومًا',
    intro:
      'مؤشر تشغيلي يعتمد على أول انتقال حالة مسجل إلى «تم التواصل» للطلبات المستلمة خلال آخر 30 يومًا. ولا يثبت تسليم رسالة أو استلام رد أو اكتمال مكالمة أو حدوث تحويل أو جودة الطلب.',
    contacted: 'تم تسجيل التواصل',
    contactedNote: 'طلبات حديثة لديها انتقال حالة منظم إلى «تم التواصل».',
    uncontacted: 'لا يوجد حدث «تم التواصل» بعد',
    uncontactedNote: 'طلبات حديثة لا يوجد لها انتقال مسجل إلى «تم التواصل».',
    median: 'الزمن الوسيط المسجل',
    medianNote: 'الزمن الوسيط من إنشاء الطلب إلى أول حدث «تم التواصل».',
    noMedian: 'لا توجد حالات تواصل مسجلة',
    bucketsTitle: 'فئات زمن تسجيل التواصل',
    underOneHour: 'أقل من ساعة',
    oneToFourHours: 'من ساعة إلى 4 ساعات',
    fourToTwentyFourHours: 'من 4 إلى 24 ساعة',
    overTwentyFourHours: '24 ساعة فأكثر',
    minutes: (value) => `${value} دقيقة`,
    hours: (value) => `${value} ساعة`,
    recordedCount: (value) => `${value} تواصل مسجل`,
  },
};

export function getEnquiryContactTurnaroundCopy(locale: SupportedLocale): Copy {
  return copy[locale];
}
