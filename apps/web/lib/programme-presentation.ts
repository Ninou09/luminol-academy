import type { Locale } from '@luminol/localization';

const PROGRAMME_DELIVERY_LABELS = {
  en: {
    'In person': 'In person',
    Online: 'Online',
    Hybrid: 'Hybrid',
    Flexible: 'Flexible',
  },
  fr: {
    'In person': 'En présentiel',
    Online: 'En ligne',
    Hybrid: 'Hybride',
    Flexible: 'Flexible',
  },
  ar: {
    'In person': 'حضوري',
    Online: 'عن بُعد',
    Hybrid: 'هجين',
    Flexible: 'مرن',
  },
} as const satisfies Record<Locale, Record<string, string>>;

const PROGRAMME_VIEW_ACTION_LABELS = {
  en: 'View programme',
  fr: 'Voir le programme',
  ar: 'عرض البرنامج',
} as const satisfies Record<Locale, string>;

const PROGRAMME_ENQUIRY_ACTION_LABELS = {
  en: 'Ask about this programme',
  fr: 'Demander des informations sur ce programme',
  ar: 'استفسر عن هذا البرنامج',
} as const satisfies Record<Locale, string>;

const PROGRAMME_WAITLIST_LABELS = {
  en: 'Next cohort · Waitlist',
  fr: 'Prochaine cohorte · Liste d’attente',
  ar: 'الفوج القادم · قائمة الانتظار',
} as const satisfies Record<Locale, string>;

const PROGRAMME_WAITLIST_ACTION_LABELS = {
  en: 'Ask about next cohort',
  fr: 'Demander la prochaine cohorte',
  ar: 'اسأل عن الفوج القادم',
} as const satisfies Record<Locale, string>;

const waitlistProgrammeSlugs = new Set(['acceptance-commitment-therapy-act']);

type LocalizedProgrammeCopy = {
  title: string;
  summary: string;
};

type LocalizableProgramme = {
  title: string;
  summary: string;
  slug: { current: string };
  localizedCopy?: {
    fr?: LocalizedProgrammeCopy;
    en?: LocalizedProgrammeCopy;
  };
};

const REVIEWED_PROGRAMME_COPY_OVERRIDES: Partial<
  Record<string, Partial<Record<Locale, LocalizedProgrammeCopy>>>
> = {
  'acceptance-commitment-therapy-act': {
    fr: {
      title: 'Thérapie d’acceptation et d’engagement (ACT)',
      summary:
        'Une formation spécialisée en thérapie d’acceptation et d’engagement (ACT), qui présente des principes et des techniques pratiques pour aider les professionnels de la psychologie et les personnes intéressées par le domaine à comprendre cette approche thérapeutique et à appliquer ses outils essentiels.',
    },
    en: {
      title: 'Acceptance and Commitment Therapy (ACT)',
      summary:
        'A specialized training course in Acceptance and Commitment Therapy (ACT), introducing practical principles and techniques to help psychology professionals and people interested in the field understand this therapeutic approach and apply its core tools.',
    },
  },
};

export function localizeProgrammePublicCopy(
  locale: Locale,
  programme: LocalizableProgramme,
): LocalizedProgrammeCopy {
  if (locale === 'ar') {
    return { title: programme.title, summary: programme.summary };
  }

  const cmsCopy = programme.localizedCopy?.[locale];
  if (cmsCopy) {
    return { title: cmsCopy.title.trim(), summary: cmsCopy.summary.trim() };
  }

  const reviewedFallback =
    REVIEWED_PROGRAMME_COPY_OVERRIDES[
      programme.slug.current.trim().toLowerCase()
    ]?.[locale];

  return (
    reviewedFallback ?? {
      title: programme.title,
      summary: programme.summary,
    }
  );
}

export function localizeProgrammeDelivery(
  locale: Locale,
  delivery: string | null | undefined,
): string | null {
  const normalized = delivery?.trim();
  if (!normalized) return null;

  return (
    PROGRAMME_DELIVERY_LABELS[locale][
      normalized as keyof (typeof PROGRAMME_DELIVERY_LABELS)[typeof locale]
    ] ?? normalized
  );
}

export function localizeProgrammeViewAction(locale: Locale): string {
  return PROGRAMME_VIEW_ACTION_LABELS[locale];
}

export function localizeProgrammeEnquiryAction(locale: Locale): string {
  return PROGRAMME_ENQUIRY_ACTION_LABELS[locale];
}

export function isProgrammeWaitlist(slug: string): boolean {
  return waitlistProgrammeSlugs.has(slug.trim().toLowerCase());
}

export function localizeProgrammeWaitlistLabel(locale: Locale): string {
  return PROGRAMME_WAITLIST_LABELS[locale];
}

export function localizeProgrammeWaitlistAction(locale: Locale): string {
  return PROGRAMME_WAITLIST_ACTION_LABELS[locale];
}
