import type { Locale } from '@luminol/localization';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  missingPlan: string;
  pastDue: string;
  next24Hours: string;
  oneToThreeDays: string;
  later: string;
  count: (value: string) => string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Recorded follow-up schedule',
    title: 'Active enquiry follow-up timing',
    intro:
      'Active enquiries grouped by their recorded complete follow-up plan. A complete plan needs both a follow-up time and next action. Timing is operational scheduling context, not urgency or lead quality.',
    missingPlan: 'Missing complete plan',
    pastDue: 'Scheduled time passed',
    next24Hours: 'Next 24 hours',
    oneToThreeDays: '1–3 days',
    later: 'Later than 3 days',
    count: (value: string) => `${value} active enquiries`,
  },
  fr: {
    eyebrow: 'Suivi planifié enregistré',
    title: 'Calendrier de suivi des demandes actives',
    intro:
      'Demandes actives regroupées selon leur plan de suivi complet enregistré. Un plan complet exige une date de suivi et une prochaine action. Ce calendrier est un contexte opérationnel, et non une mesure d’urgence ou de qualité.',
    missingPlan: 'Plan complet manquant',
    pastDue: 'Heure planifiée dépassée',
    next24Hours: 'Prochaines 24 heures',
    oneToThreeDays: '1 à 3 jours',
    later: 'Plus de 3 jours',
    count: (value: string) => `${value} demandes actives`,
  },
  ar: {
    eyebrow: 'جدول المتابعة المسجّل',
    title: 'توقيت متابعة الطلبات النشطة',
    intro:
      'تجميع الطلبات النشطة حسب خطة المتابعة الكاملة المسجّلة. تتطلب الخطة الكاملة وقت متابعة وإجراءً تاليًا معًا. هذا سياق جدولة تشغيلي وليس مقياسًا للاستعجال أو جودة العميل المحتمل.',
    missingPlan: 'خطة كاملة مفقودة',
    pastDue: 'تجاوز الوقت المجدول',
    next24Hours: 'خلال 24 ساعة القادمة',
    oneToThreeDays: 'من يوم إلى 3 أيام',
    later: 'بعد أكثر من 3 أيام',
    count: (value: string) => `${value} طلبات نشطة`,
  },
};

export function getEnquiryFollowUpTimingCopy(locale: Locale): Copy {
  return copy[locale];
}
