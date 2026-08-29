import type { Locale } from '@luminol/localization';

type EnquiryWorkflowCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  ownerCoverage: string;
  ownerCoverageNote: string;
  followUpCoverage: string;
  followUpCoverageNote: string;
  qualificationCoverage: string;
  qualificationCoverageNote: string;
  coveredOfActive: (covered: string, total: string) => string;
};

const COPY: Record<Locale, EnquiryWorkflowCopy> = {
  en: {
    eyebrow: 'Workflow discipline',
    title: '30-day enquiry workflow coverage',
    intro:
      'Operational completeness among active enquiries received in the rolling last 30 days. These are workflow metrics, not conversion or lead-quality scores.',
    ownerCoverage: 'Assigned owner',
    ownerCoverageNote: 'Active enquiries with a recorded owner',
    followUpCoverage: 'Follow-up plan',
    followUpCoverageNote:
      'Active enquiries with both next action and follow-up date',
    qualificationCoverage: 'Structured qualification',
    qualificationCoverageNote:
      'Active enquiries with city, contact, delivery and timing captured',
    coveredOfActive: (covered, total) => `${covered} of ${total} active`,
  },
  fr: {
    eyebrow: 'Discipline du suivi',
    title: 'Couverture du suivi des demandes sur 30 jours',
    intro:
      'Complétude opérationnelle des demandes actives reçues sur les 30 derniers jours glissants. Il s’agit de mesures de suivi, et non de conversion ou de qualité des prospects.',
    ownerCoverage: 'Responsable attribué',
    ownerCoverageNote: 'Demandes actives avec un responsable enregistré',
    followUpCoverage: 'Plan de suivi',
    followUpCoverageNote:
      'Demandes actives avec prochaine action et date de suivi',
    qualificationCoverage: 'Qualification structurée',
    qualificationCoverageNote:
      'Demandes actives avec ville, contact, format et timing renseignés',
    coveredOfActive: (covered, total) => `${covered} sur ${total} actives`,
  },
  ar: {
    eyebrow: 'انضباط المتابعة',
    title: 'اكتمال متابعة الطلبات خلال 30 يومًا',
    intro:
      'مؤشرات اكتمال تشغيلي للطلبات النشطة المستلمة خلال آخر 30 يومًا بشكل متحرك. هذه مؤشرات لسير العمل وليست معدلات تحويل أو تقييمًا لجودة العملاء المحتملين.',
    ownerCoverage: 'مسؤول محدد',
    ownerCoverageNote: 'الطلبات النشطة التي تم إسناد مسؤول لها',
    followUpCoverage: 'خطة متابعة',
    followUpCoverageNote: 'الطلبات النشطة التي لها إجراء تالٍ وتاريخ متابعة',
    qualificationCoverage: 'تأهيل منظم مكتمل',
    qualificationCoverageNote:
      'الطلبات النشطة التي تم تسجيل المدينة وطريقة التواصل والصيغة والتوقيت لها',
    coveredOfActive: (covered, total) => `${covered} من ${total} طلبات نشطة`,
  },
};

export function getEnquiryWorkflowCopy(locale: Locale) {
  return COPY[locale];
}
