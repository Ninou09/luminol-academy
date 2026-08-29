export type EnquiryCampaignAttribution = {
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

const CAMPAIGN_VALUE_LIMIT = 160;
const LANDING_PATH_LIMIT = 240;

function boundedValue(value: string | null, limit: number) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, limit) : undefined;
}

export function getCurrentEnquiryAttribution(location: {
  pathname: string;
  search: string;
}): EnquiryCampaignAttribution {
  const search = new URLSearchParams(location.search);
  const landingPath = location.pathname.startsWith('/')
    ? location.pathname.slice(0, LANDING_PATH_LIMIT)
    : undefined;

  return {
    landingPath: boundedValue(landingPath ?? null, LANDING_PATH_LIMIT),
    utmSource: boundedValue(search.get('utm_source'), CAMPAIGN_VALUE_LIMIT),
    utmMedium: boundedValue(search.get('utm_medium'), CAMPAIGN_VALUE_LIMIT),
    utmCampaign: boundedValue(search.get('utm_campaign'), CAMPAIGN_VALUE_LIMIT),
    utmContent: boundedValue(search.get('utm_content'), CAMPAIGN_VALUE_LIMIT),
  };
}
