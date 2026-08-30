import type { Prisma } from '@luminol/database';

export const ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT = 160;

export type EnquiryCampaignAttributionFilter = {
  utmSource: string | null;
  utmCampaign: string | null;
  utmMedium: string | null;
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
): EnquiryCampaignAttributionFilter | null {
  const source = parseFilterValue(utmSource);
  const campaign = parseFilterValue(utmCampaign);
  const medium = parseFilterValue(utmMedium);

  if (source.invalid || campaign.invalid || medium.invalid) return null;
  if (campaign.value && !source.value) return null;
  if (!source.value && !medium.value) return null;

  return {
    utmSource: source.value,
    utmCampaign: campaign.value,
    utmMedium: medium.value,
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
  };
}

export function buildEnquiryCampaignAttributionQuery(
  filter: EnquiryCampaignAttributionFilter,
): string {
  const query = new URLSearchParams();
  if (filter.utmSource) query.set('utmSource', filter.utmSource);
  if (filter.utmCampaign) query.set('utmCampaign', filter.utmCampaign);
  if (filter.utmMedium) query.set('utmMedium', filter.utmMedium);
  return query.toString();
}
