import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_SCHOOLS,
  type EnquirySchoolValue,
} from './enquiry-pipeline-reporting';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseEnquirySchoolFilter(
  value: string | string[] | undefined,
): EnquirySchoolValue | null {
  const candidate = firstParam(value);
  if (!candidate) return null;

  return (ENQUIRY_SCHOOLS as readonly string[]).includes(candidate)
    ? (candidate as EnquirySchoolValue)
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
