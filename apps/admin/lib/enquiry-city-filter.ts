import type { Prisma } from '@luminol/database';

export const ENQUIRY_CITY_FILTER_LIMIT = 120;

function scalar(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }

  return false;
}

export function parseEnquiryCityFilter(
  value: string | string[] | undefined,
): string | null {
  const city = scalar(value);
  if (!city) return null;
  if (city.length < 2 || city.length > ENQUIRY_CITY_FILTER_LIMIT) return null;
  if (city !== city.trim()) return null;
  if (hasControlCharacter(city)) return null;

  return city;
}

export function getEnquiryCityWhere(
  city: string | null,
): Prisma.EnquiryWhereInput | null {
  return city ? { city } : null;
}

export function buildEnquiryCityQuery(city: string): string {
  const query = new URLSearchParams();
  query.set('city', city);
  return query.toString();
}
