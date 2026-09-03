export type EnquiryCampaignAttribution = {
  landingPath?: string | undefined;
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
};

const CAMPAIGN_VALUE_LIMIT = 160;
const LANDING_PATH_LIMIT = 240;

function boundedValue(value: string | null, limit: number) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, limit) : undefined;
}

function isGenericContactPath(pathname: string) {
  return /^\/(?:ar|fr|en\/)?contact\/?$/i.test(pathname);
}

export function getSameOriginReferrerPath(
  referrer: string,
  origin: string,
): string | undefined {
  if (!referrer.trim() || !origin.trim()) return undefined;

  try {
    const url = new URL(referrer);
    if (url.origin !== new URL(origin).origin) return undefined;
    return url.pathname.startsWith('/')
      ? url.pathname.slice(0, LANDING_PATH_LIMIT)
      : undefined;
  } catch {
    return undefined;
  }
}

export function getCurrentEnquiryAttribution(location: {
  pathname: string;
  search: string;
  referrerPathname?: string | undefined;
}): EnquiryCampaignAttribution {
  const search = new URLSearchParams(location.search);
  const preferredLandingPath =
    isGenericContactPath(location.pathname) &&
    location.referrerPathname?.startsWith('/')
      ? location.referrerPathname
      : location.pathname;
  const landingPath = preferredLandingPath.startsWith('/')
    ? preferredLandingPath.slice(0, LANDING_PATH_LIMIT)
    : undefined;

  return {
    landingPath: boundedValue(landingPath ?? null, LANDING_PATH_LIMIT),
    utmSource: boundedValue(search.get('utm_source'), CAMPAIGN_VALUE_LIMIT),
    utmMedium: boundedValue(search.get('utm_medium'), CAMPAIGN_VALUE_LIMIT),
    utmCampaign: boundedValue(search.get('utm_campaign'), CAMPAIGN_VALUE_LIMIT),
    utmContent: boundedValue(search.get('utm_content'), CAMPAIGN_VALUE_LIMIT),
  };
}
