import type { Locale } from '@luminol/localization';

export type ConsultationFacts = {
  heading: string;
  priceLabel: string;
  price: string;
  durationLabel: string;
  duration: string;
  formatLabel: string;
  format: string;
  availability: string;
};

const FACTS: Record<Locale, ConsultationFacts> = {
  en: {
    heading: 'Consultation information',
    priceLabel: 'Fee with Kheddaoui Fettouma',
    price: '3,000 DZD',
    durationLabel: 'Typical duration',
    duration: '45–60 minutes',
    formatLabel: 'Format',
    format: 'In person in Blida or online via Zoom',
    availability:
      'Submitting the request does not confirm an appointment. The team confirms the professional, date, format, and availability before booking.',
  },
  fr: {
    heading: 'Informations sur la consultation',
    priceLabel: 'Tarif avec Kheddaoui Fettouma',
    price: '3 000 DZD',
    durationLabel: 'Durée habituelle',
    duration: '45–60 minutes',
    formatLabel: 'Format',
    format: 'En présentiel à Blida ou en ligne via Zoom',
    availability:
      'L’envoi de la demande ne confirme pas un rendez-vous. L’équipe confirme la professionnelle, la date, le format et la disponibilité avant la réservation.',
  },
  ar: {
    heading: 'معلومات الاستشارة',
    priceLabel: 'السعر مع الأخصائية خداوي فطومة',
    price: '3,000 دج',
    durationLabel: 'المدة المعتادة',
    duration: '45–60 دقيقة',
    formatLabel: 'طريقة الاستشارة',
    format: 'حضوريًا في البليدة أو عن بُعد عبر Zoom',
    availability:
      'إرسال الطلب لا يؤكد الموعد. يؤكد الفريق الأخصائية والتاريخ وطريقة الاستشارة والتوفر قبل تثبيت الحجز.',
  },
};

export function getConsultationFacts(locale: Locale): ConsultationFacts {
  return FACTS[locale];
}
