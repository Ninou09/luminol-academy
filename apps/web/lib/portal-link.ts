import type { Locale } from '@luminol/localization';

/** The learner portal is its own Vercel project; override with NEXT_PUBLIC_PORTAL_URL. */
const fallbackPortalUrl = 'https://luminol-academy-portal.vercel.app';

export function getPortalHref(locale: Locale) {
  let origin = fallbackPortalUrl;
  try {
    origin = new URL(process.env.NEXT_PUBLIC_PORTAL_URL?.trim() || fallbackPortalUrl).origin;
  } catch {
    // keep the fallback
  }
  return `${origin}/${locale}`;
}

export const portalLabel = {
  en: 'My account',
  fr: 'Mon espace',
  ar: 'حسابي',
} as const satisfies Record<Locale, string>;
