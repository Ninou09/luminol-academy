import type { Prisma } from '@luminol/database';

export const ENQUIRY_LANDING_PATH_FILTER_LIMIT = 240;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || codePoint === 127;
  });
}

export function parseEnquiryLandingPathFilter(
  value: string | string[] | undefined,
): string | null {
  const candidate = firstParam(value);
  if (!candidate) return null;
  if (candidate.length > ENQUIRY_LANDING_PATH_FILTER_LIMIT) return null;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return null;
  if (/[?#\\\s]/u.test(candidate)) return null;
  if (containsControlCharacter(candidate)) return null;

  return candidate;
}

export function getEnquiryLandingPathWhere(
  landingPath: string | null,
): Prisma.EnquiryWhereInput | null {
  return landingPath ? { landingPath } : null;
}

export function buildEnquiryLandingPathQuery(landingPath: string): string {
  const query = new URLSearchParams();
  query.set('landingPath', landingPath);
  return query.toString();
}
