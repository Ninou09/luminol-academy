import type { Prisma } from '@luminol/database';

export const ENQUIRY_ATTRIBUTION_GAPS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'landingPath',
] as const;

export type EnquiryAttributionGap =
  (typeof ENQUIRY_ATTRIBUTION_GAPS)[number];

export function parseEnquiryAttributionGapFilter(
  value: string | string[] | undefined,
): EnquiryAttributionGap | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_ATTRIBUTION_GAPS as readonly string[]).includes(value)
    ? (value as EnquiryAttributionGap)
    : null;
}

export function getEnquiryAttributionGapWhere(
  attributionGap: EnquiryAttributionGap | null,
): Prisma.EnquiryWhereInput | null {
  if (attributionGap === 'utmSource') return { utmSource: null };
  if (attributionGap === 'utmMedium') return { utmMedium: null };
  if (attributionGap === 'utmCampaign') return { utmCampaign: null };
  if (attributionGap === 'utmContent') return { utmContent: null };
  if (attributionGap === 'landingPath') return { landingPath: null };

  return null;
}

export function buildEnquiryAttributionGapQuery(
  attributionGap: EnquiryAttributionGap,
): string {
  const query = new URLSearchParams();
  query.set('attributionGap', attributionGap);
  return query.toString();
}
