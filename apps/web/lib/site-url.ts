export const FALLBACK_PUBLIC_SITE_URL =
  'https://luminol-academy-web.vercel.app';

export function resolvePublicSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || FALLBACK_PUBLIC_SITE_URL);
  } catch {
    return new URL(FALLBACK_PUBLIC_SITE_URL);
  }
}

export function resolvePublicSiteOrigin(): string {
  return resolvePublicSiteUrl().origin;
}
