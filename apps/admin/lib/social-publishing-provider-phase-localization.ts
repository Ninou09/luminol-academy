import type { Locale } from '@luminol/localization';

import type { SocialPublishingProviderPhase } from '@luminol/database/social-publishing-attempts';

type SocialPublishingProviderPhaseCopy = {
  providerPhase: string;
  providerCheckpoint: string;
  phaseName: Record<SocialPublishingProviderPhase, string>;
};

const COPY: Record<Locale, SocialPublishingProviderPhaseCopy> = {
  en: {
    providerPhase: 'Provider phase',
    providerCheckpoint: 'Provider session checkpoint',
    phaseName: {
      NOT_STARTED: 'Not started',
      SESSION_READY: 'Session ready',
      PUBLISHED: 'Published',
    },
  },
  fr: {
    providerPhase: 'Phase fournisseur',
    providerCheckpoint: 'Point de reprise de session fournisseur',
    phaseName: {
      NOT_STARTED: 'Non démarrée',
      SESSION_READY: 'Session prête',
      PUBLISHED: 'Publiée',
    },
  },
  ar: {
    providerPhase: 'مرحلة المزوّد',
    providerCheckpoint: 'نقطة استئناف جلسة المزوّد',
    phaseName: {
      NOT_STARTED: 'لم تبدأ',
      SESSION_READY: 'الجلسة جاهزة',
      PUBLISHED: 'تم النشر',
    },
  },
};

export function getSocialPublishingProviderPhaseCopy(locale: Locale) {
  return COPY[locale];
}
