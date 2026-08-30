import type { Prisma } from '@luminol/database';

export const ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT = 160;

export type EnquiryCampaignAttributionFilter = {
  utmSource: string;
  utmCampaign: string | null;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFilterValue(
  value: string | string[] | undefined,
): string | null {
  const candidate = firstParam(value)?.trim();
  if (!candidate) return null;
  if (candidate.length > ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT) return null;
  return candidate;
}

export function parseEnquiryCampaignAttributionFilter(
  utmSource: string | string[] | undefined,
  utmCampaign: string | string[] | undefined,
): EnquiryCampaignAttributionFilter | null {
  const source = normalizeFilterValue(utmSource);
  const campaignCandidate = firstParam(utmCampaign)?.trim();

  if (!source) return null;

  if (campaignCandidate) {
    if (campaignCandidate.length > ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT) {
      return null;
    }

    return {
      utmSource: source,
      utmCampaign: campaignCandidate,
    };
  }

  return {
    utmSource: source,
    utmCampaign: null,
  };
}

export function getEnquiryCampaignAttributionWhere(
  filter: EnquiryCampaignAttributionFilter | null,
): Prisma.EnquiryWhereInput | null {
  if (!filter) return null;

  return {
    utmSource: filter.utmSource,
    ...(filter.utmCampaign ? { utmCampaign: filter.utmCampaign } : {}),
  };
}

export function buildEnquiryCampaignAttributionQuery(
  filter: EnquiryCampaignAttributionFilter,
): string {
  const query = new URLSearchParams();
  query.set('utmSource', filter.utmSource);
  if (filter.utmCampaign) query.set('utmCampaign', filter.utmCampaign);
  return query.toString();
}
