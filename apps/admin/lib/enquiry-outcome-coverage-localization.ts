import type { Locale } from '@luminol/localization';

type EnquiryOutcomeCoverageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  recorded: string;
  recordedNote: string;
  missing: string;
  missingNote: string;
  coverage: string;
  coverageNote: string;
  recordedOfClosed: (recorded: string, closed: string) => string;
};

const COPY: Record<Locale, EnquiryOutcomeCoverageCopy> = {
  en: {
    eyebrow: 'Closure discipline',
    title: '30-day enquiry outcome-recording coverage',
    intro:
      'Operational completeness for enquiries closed during the rolling last 30 days. This measures whether an outcome record exists, not sales conversion, revenue, treatment success, or lead quality.',
    recorded: 'Outcome recorded',
    recordedNote: 'Recently closed enquiries with both outcome text and recorded date',
    missing: 'Outcome missing',
    missingNote: 'Recently closed enquiries without a complete outcome record',
    coverage: 'Outcome-recording coverage',
    coverageNote: 'Share of recently closed enquiries with a complete outcome record',
    recordedOfClosed: (recorded, closed) => `${recorded} of ${closed} closed`,
  },
  fr: {
    eyebrow: 'Discipline de clôture',
    title: 'Couverture de saisie des résultats sur 30 jours',
    intro:
      'Complétude opérationnelle des demandes clôturées au cours des 30 derniers jours glissants. Cette mesure indique si un résultat a été enregistré, et non une conversion commerciale, un revenu, un succès thérapeutique ou la qualité du prospect.',
    recorded: 'Résultat enregistré',
    recordedNote:
      'Demandes récemment clôturées avec texte du résultat et date d’enregistrement',
    missing: 'Résultat manquant',
    missingNote:
      'Demandes récemment clôturées sans enregistrement complet du résultat',
    coverage: 'Couverture de saisie des résultats',
    coverageNote:
      'Part des demandes récemment clôturées avec un résultat complètement enregistré',
    recordedOfClosed: (recorded, closed) => `${recorded} sur ${closed} clôturées`,
  },
  ar: {
    eyebrow: 'انضباط الإغلاق',
    title: 'اكتمال تسجيل نتائج الطلبات خلال 30 يومًا',
    intro:
      'مؤشر اكتمال تشغيلي للطلبات التي أُغلقت خلال آخر 30 يومًا بشكل متحرك. يقيس وجود سجل نتيجة فقط، وليس التحويل التجاري أو الإيرادات أو نجاح العلاج أو جودة العميل المحتمل.',
    recorded: 'تم تسجيل النتيجة',
    recordedNote: 'طلبات أُغلقت حديثًا وبها نص النتيجة وتاريخ تسجيلها',
    missing: 'النتيجة غير مكتملة',
    missingNote: 'طلبات أُغلقت حديثًا من دون سجل نتيجة مكتمل',
    coverage: 'اكتمال تسجيل النتائج',
    coverageNote: 'نسبة الطلبات المغلقة حديثًا التي تحتوي على سجل نتيجة مكتمل',
    recordedOfClosed: (recorded, closed) => `${recorded} من ${closed} طلبات مغلقة`,
  },
};

export function getEnquiryOutcomeCoverageCopy(locale: Locale) {
  return COPY[locale];
}
