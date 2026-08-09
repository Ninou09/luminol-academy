import type { Locale } from '@luminol/localization';

export function getPortalArrow(
  locale: Locale,
  direction: 'back' | 'forward',
): '←' | '→' {
  if (direction === 'back') return locale === 'ar' ? '→' : '←';
  return locale === 'ar' ? '←' : '→';
}
