import type { Prisma } from '@luminol/database';

export const ENQUIRY_LANDING_PATH_FILTER_LIMIT = 240;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseEnquiryLandingPathFilter(
  value: string | string[] | undefined,
): string | null {
  const candidate = firstParam(value);
  if (!candidate) return null;
  if (candidate.length > ENQUIRY_LANDING_PATH_FILTER_LIMIT) return null;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return null;
  if (/[?#\\\s]/u.test(candidate)) return null;
  if (/[\u0000-\u001f\u007f]/u.test(candidate)) return null;

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
