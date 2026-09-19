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
  localizedCopy?:
    | {
        fr?: LocalizedProgrammeCopy | undefined;
        en?: LocalizedProgrammeCopy | undefined;
      }
    | null
    | undefined;
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

type LocalizedProgrammeDetails = {
  bodyText: string;
  outcomes: string[];
  audience: string[];
};

type LocalizedProgrammeDetailCopy = LocalizedProgrammeCopy & {
  bodyText?: string | undefined;
  outcomes?: string[] | undefined;
  audience?: string[] | undefined;
};

type LocalizableProgrammeDetails = {
  slug: { current: string };
  bodyText: string;
  outcomes: string[];
  audience: string[];
  localizedCopy?:
    | {
        fr?: LocalizedProgrammeDetailCopy | null | undefined;
        en?: LocalizedProgrammeDetailCopy | null | undefined;
      }
    | null
    | undefined;
};

const REVIEWED_PROGRAMME_DETAIL_OVERRIDES: Partial<
  Record<string, Partial<Record<Locale, LocalizedProgrammeDetails>>>
> = {
  'acceptance-commitment-therapy-act': {
    en: {
      bodyText: '',
      outcomes: [
        'Understand the core principles of Acceptance and Commitment Therapy (ACT).',
        'Recognize psychological flexibility and its importance for mental health.',
        'Understand the six core processes in the ACT model.',
        'Learn flexible ways of responding to difficult thoughts and emotions.',
        'Use acceptance, cognitive defusion, and present-moment awareness exercises.',
        'Help clients identify their values and translate them into committed, purposeful action.',
        'Gain practical tools and exercises that can be used in psychological practice.',
        'Distinguish attempts to control internal experiences from responding to them flexibly.',
      ],
      audience: [
        'Psychologists and psychology practitioners.',
        'Students of psychology and related human sciences.',
        'Practitioners and people interested in psychotherapy.',
        'Professionals working in counselling and psychological support.',
        'People seeking to deepen their knowledge of Acceptance and Commitment Therapy (ACT).',
      ],
    },
    fr: {
      bodyText: '',
      outcomes: [
        'Comprendre les principes fondamentaux de la thérapie d’acceptation et d’engagement (ACT).',
        'Comprendre la flexibilité psychologique et son importance pour la santé mentale.',
        'Comprendre les six processus fondamentaux du modèle ACT.',
        'Apprendre des façons plus flexibles de répondre aux pensées et émotions difficiles.',
        'Utiliser des exercices d’acceptation, de défusion cognitive et de conscience du moment présent.',
        'Aider les bénéficiaires à identifier leurs valeurs et à les traduire en actions engagées et porteuses de sens.',
        'Acquérir des outils et exercices pratiques utilisables dans la pratique psychologique.',
        'Distinguer la tentative de contrôler les expériences internes d’une réponse plus flexible à celles-ci.',
      ],
      audience: [
        'Psychologues et praticiens en psychologie.',
        'Étudiants en psychologie et en sciences humaines connexes.',
        'Praticiens et personnes intéressées par la psychothérapie.',
        'Professionnels de l’accompagnement et du soutien psychologique.',
        'Personnes souhaitant approfondir leurs connaissances en thérapie d’acceptation et d’engagement (ACT).',
      ],
    },
  },
};

export function localizeProgrammeDetailContent(
  locale: Locale,
  programme: LocalizableProgrammeDetails,
): LocalizedProgrammeDetails {
  if (locale === 'ar') {
    return {
      bodyText: programme.bodyText,
      outcomes: programme.outcomes,
      audience: programme.audience,
    };
  }

  const cmsCopy = programme.localizedCopy?.[locale];
  if (
    cmsCopy &&
    (cmsCopy.bodyText !== undefined ||
      cmsCopy.outcomes !== undefined ||
      cmsCopy.audience !== undefined)
  ) {
    return {
      bodyText: cmsCopy.bodyText?.trim() ?? '',
      outcomes: cmsCopy.outcomes ?? [],
      audience: cmsCopy.audience ?? [],
    };
  }

  return (
    REVIEWED_PROGRAMME_DETAIL_OVERRIDES[
      programme.slug.current.trim().toLowerCase()
    ]?.[locale] ?? { bodyText: '', outcomes: [], audience: [] }
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
