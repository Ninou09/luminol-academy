import type { Locale } from '@luminol/localization';

export type EnquiryProgrammeFilterCopy = {
  eyebrow: string;
  programme: string;
  storedSlug: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryProgrammeFilterCopy> = {
  en: {
    eyebrow: 'Verified programme context',
    programme: 'Recorded programme',
    storedSlug: 'Stored slug',
    intro:
      'This protected view is scoped only by the exact programme slug and title snapshot stored with the enquiry after server verification. The snapshot is historical enquiry context, not a current-catalogue replacement, recommendation, suitability assessment, conversion signal, lead-quality signal or clinical inference.',
    clear: 'Clear programme filter',
  },
  fr: {
    eyebrow: 'Contexte de programme vérifié',
    programme: 'Programme enregistré',
    storedSlug: 'Slug enregistré',
    intro:
      'Cette vue protégée est limitée uniquement au slug et à l’intitulé instantané exacts enregistrés avec la demande après vérification serveur. Cet instantané est un contexte historique de la demande et ne remplace pas le catalogue actuel ; il ne constitue ni une recommandation, ni une évaluation d’adéquation, ni un signal de conversion ou de qualité du prospect, ni une inférence clinique.',
    clear: 'Effacer le filtre de programme',
  },
  ar: {
    eyebrow: 'سياق البرنامج المتحقق منه',
    programme: 'البرنامج المسجّل',
    storedSlug: 'المعرّف المحفوظ',
    intro:
      'يقتصر هذا العرض المحمي على معرّف البرنامج ولقطة عنوانه المطابقين تمامًا لما حُفظ مع الطلب بعد التحقق على الخادم. هذه اللقطة سياق تاريخي للطلب وليست بديلًا عن الكتالوج الحالي، ولا تمثل توصية أو تقييم ملاءمة أو إشارة تحويل أو جودة للطلب أو استنتاجًا سريريًا.',
    clear: 'مسح مرشح البرنامج',
  },
};

export function getEnquiryProgrammeFilterCopy(
  locale: Locale,
): EnquiryProgrammeFilterCopy {
  return COPY[locale];
}
