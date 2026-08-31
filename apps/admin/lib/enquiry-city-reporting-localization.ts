import type { Locale } from '@luminol/localization';

export type EnquiryCityReportingCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  recorded: string;
  missing: string;
  enquiryCount: (count: string) => string;
  noData: string;
};

const COPY: Record<Locale, EnquiryCityReportingCopy> = {
  en: {
    eyebrow: 'Geography context',
    title: 'Recorded enquiry cities',
    intro:
      'Rolling 30-day view of the exact city text supplied with enquiries. Spellings and language variants stay separate; no geocoding or regional inference is applied.',
    recorded: 'City recorded',
    missing: 'City missing',
    enquiryCount: (count) => `${count} enquiries`,
    noData: 'No recorded city context is available in this period.',
  },
  fr: {
    eyebrow: 'Contexte géographique',
    title: 'Villes enregistrées des demandes',
    intro:
      'Vue glissante sur 30 jours du texte exact de la ville fourni avec les demandes. Les variantes d’orthographe et de langue restent séparées ; aucun géocodage ni aucune inférence régionale n’est appliqué.',
    recorded: 'Ville enregistrée',
    missing: 'Ville manquante',
    enquiryCount: (count) => `${count} demandes`,
    noData: 'Aucun contexte de ville enregistré n’est disponible sur cette période.',
  },
  ar: {
    eyebrow: 'السياق الجغرافي',
    title: 'مدن الطلبات المسجّلة',
    intro:
      'عرض لآخر 30 يومًا لنص المدينة المطابق الذي قُدّم مع الطلبات. تبقى اختلافات الكتابة واللغة منفصلة، ولا يتم استخدام تحديد جغرافي أو استنتاج للمناطق.',
    recorded: 'المدينة مسجّلة',
    missing: 'المدينة غير مسجّلة',
    enquiryCount: (count) => `${count} طلبات`,
    noData: 'لا يتوفر سياق مدينة مسجّل خلال هذه الفترة.',
  },
};

export function getEnquiryCityReportingCopy(
  locale: Locale,
): EnquiryCityReportingCopy {
  return COPY[locale];
}
