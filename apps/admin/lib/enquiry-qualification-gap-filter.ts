import type { Prisma } from '@luminol/database';

export const ENQUIRY_QUALIFICATION_GAPS = [
  'city',
  'preferredContact',
  'deliveryPreference',
  'timingPreference',
] as const;

export type EnquiryQualificationGap =
  (typeof ENQUIRY_QUALIFICATION_GAPS)[number];

export function parseEnquiryQualificationGapFilter(
  value: string | string[] | undefined,
): EnquiryQualificationGap | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_QUALIFICATION_GAPS as readonly string[]).includes(value)
    ? (value as EnquiryQualificationGap)
    : null;
}

export function getEnquiryQualificationGapWhere(
  qualificationGap: EnquiryQualificationGap | null,
): Prisma.EnquiryWhereInput | null {
  if (qualificationGap === 'city') return { city: null };
  if (qualificationGap === 'preferredContact')
    return { preferredContact: null };
  if (qualificationGap === 'deliveryPreference') {
    return { deliveryPreference: null };
  }
  if (qualificationGap === 'timingPreference') {
    return { timingPreference: null };
  }

  return null;
}

export function buildEnquiryQualificationGapQuery(
  qualificationGap: EnquiryQualificationGap,
): string {
  const query = new URLSearchParams();
  query.set('qualificationGap', qualificationGap);
  return query.toString();
}
