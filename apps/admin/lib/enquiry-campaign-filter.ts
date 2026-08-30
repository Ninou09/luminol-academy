import type { Prisma } from '@luminol/database';

export const ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT = 160;

export type EnquiryCampaignAttributionFilter = {
  // Empty string is the internal no-source sentinel for source-less drill-downs.
  // It is never emitted as a query value or Prisma predicate.
  utmSource: string;
  utmCampaign: string | null;
  utmMedium: string | null;
  utmContent: string | null;
};

type EnquiryCampaignAttributionQuery = {
  utmSource: string | null;
  utmCampaign: string | null;
  utmMedium: string | null;
  utmContent: string | null;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilterValue(value: string | string[] | undefined): {
  value: string | null;
  invalid: boolean;
} {
  const candidate = firstParam(value)?.trim();
  if (!candidate) return { value: null, invalid: false };
  if (candidate.length > ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT) {
    return { value: null, invalid: true };
  }
  return { value: candidate, invalid: false };
}

export function parseEnquiryCampaignAttributionFilter(
  utmSource: string | string[] | undefined,
  utmCampaign: string | string[] | undefined,
  utmMedium: string | string[] | undefined = undefined,
  utmContent: string | string[] | undefined = undefined,
): EnquiryCampaignAttributionFilter | null {
  const source = parseFilterValue(utmSource);
  const campaign = parseFilterValue(utmCampaign);
  const medium = parseFilterValue(utmMedium);
  const content = parseFilterValue(utmContent);

  if (source.invalid || campaign.invalid || medium.invalid || content.invalid) {
    return null;
  }
  if (campaign.value && !source.value) return null;
  if (!source.value && !medium.value && !content.value) return null;

  return {
    utmSource: source.value ?? '',
    utmCampaign: campaign.value,
    utmMedium: medium.value,
    utmContent: content.value,
  };
}

export function getEnquiryCampaignAttributionWhere(
  filter: EnquiryCampaignAttributionFilter | null,
): Prisma.EnquiryWhereInput | null {
  if (!filter) return null;

  return {
    ...(filter.utmSource ? { utmSource: filter.utmSource } : {}),
    ...(filter.utmCampaign ? { utmCampaign: filter.utmCampaign } : {}),
    ...(filter.utmMedium ? { utmMedium: filter.utmMedium } : {}),
    ...(filter.utmContent ? { utmContent: filter.utmContent } : {}),
  };
}

export function buildEnquiryCampaignAttributionQuery(
  filter: EnquiryCampaignAttributionQuery,
): string {
  const query = new URLSearchParams();
  if (filter.utmSource) query.set('utmSource', filter.utmSource);
  if (filter.utmCampaign) query.set('utmCampaign', filter.utmCampaign);
  if (filter.utmMedium) query.set('utmMedium', filter.utmMedium);
  if (filter.utmContent) query.set('utmContent', filter.utmContent);
  return query.toString();
}
