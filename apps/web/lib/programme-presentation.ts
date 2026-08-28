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

export function isProgrammeWaitlist(slug: string): boolean {
  return waitlistProgrammeSlugs.has(slug.trim().toLowerCase());
}

export function localizeProgrammeWaitlistLabel(locale: Locale): string {
  return PROGRAMME_WAITLIST_LABELS[locale];
}

export function localizeProgrammeWaitlistAction(locale: Locale): string {
  return PROGRAMME_WAITLIST_ACTION_LABELS[locale];
}
