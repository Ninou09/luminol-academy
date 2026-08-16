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

export function localizeProgrammeDelivery(
  locale: Locale,
  delivery: string | null | undefined,
): string | null {
  const normalized = delivery?.trim();
  if (!normalized) return null;

  return PROGRAMME_DELIVERY_LABELS[locale][
    normalized as keyof (typeof PROGRAMME_DELIVERY_LABELS)[typeof locale]
  ] ?? normalized;
}
