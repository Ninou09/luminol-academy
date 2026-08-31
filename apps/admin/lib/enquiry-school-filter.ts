import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_SCHOOLS,
  type EnquirySchoolValue,
} from './enquiry-pipeline-reporting';

export type { EnquirySchoolValue };

export function parseEnquirySchoolFilter(
  value: string | string[] | undefined,
): EnquirySchoolValue | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_SCHOOLS as readonly string[]).includes(value)
    ? (value as EnquirySchoolValue)
    : null;
}

export function getEnquirySchoolWhere(
  school: EnquirySchoolValue | null,
): Prisma.EnquiryWhereInput | null {
  return school ? { school } : null;
}

export function buildEnquirySchoolQuery(school: EnquirySchoolValue): string {
  const query = new URLSearchParams();
  query.set('school', school);
  return query.toString();
}
