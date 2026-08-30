export const CAMPAIGN_PATH_LIMIT = 240;
export const CAMPAIGN_VALUE_LIMIT = 160;

export type CampaignLinkInput = {
  pathname: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
};

export type CampaignLinkError =
  | 'path-required'
  | 'path-too-long'
  | 'path-unsafe'
  | 'source-required'
  | 'source-too-long'
  | 'medium-too-long'
  | 'campaign-too-long'
  | 'content-too-long';

export type CampaignLinkResult =
  | { ok: true; value: string }
  | { ok: false; error: CampaignLinkError };

function clean(value: string): string {
  return value.trim();
}

function isUnsafePath(pathname: string): boolean {
  return (
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    pathname.includes('\\') ||
    pathname.includes(':') ||
    /\s/.test(pathname)
  );
}

export function buildCampaignTaggedPath(
  input: CampaignLinkInput,
): CampaignLinkResult {
  const pathname = clean(input.pathname);
  const source = clean(input.source);
  const medium = clean(input.medium);
  const campaign = clean(input.campaign);
  const content = clean(input.content);

  if (!pathname) return { ok: false, error: 'path-required' };
  if (pathname.length > CAMPAIGN_PATH_LIMIT) {
    return { ok: false, error: 'path-too-long' };
  }
  if (isUnsafePath(pathname)) return { ok: false, error: 'path-unsafe' };

  if (!source) return { ok: false, error: 'source-required' };
  if (source.length > CAMPAIGN_VALUE_LIMIT) {
    return { ok: false, error: 'source-too-long' };
  }
  if (medium.length > CAMPAIGN_VALUE_LIMIT) {
    return { ok: false, error: 'medium-too-long' };
  }
  if (campaign.length > CAMPAIGN_VALUE_LIMIT) {
    return { ok: false, error: 'campaign-too-long' };
  }
  if (content.length > CAMPAIGN_VALUE_LIMIT) {
    return { ok: false, error: 'content-too-long' };
  }

  const query = new URLSearchParams();
  query.set('utm_source', source);
  if (medium) query.set('utm_medium', medium);
  if (campaign) query.set('utm_campaign', campaign);
  if (content) query.set('utm_content', content);

  return { ok: true, value: `${pathname}?${query.toString()}` };
}
