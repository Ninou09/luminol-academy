import { describe, expect, it } from 'vitest';

import {
  CAMPAIGN_PATH_LIMIT,
  CAMPAIGN_VALUE_LIMIT,
  buildCampaignTaggedPath,
} from './campaign-link-builder';

describe('campaign link builder', () => {
  it('builds supported UTM parameters in deterministic order', () => {
    expect(
      buildCampaignTaggedPath({
        pathname: '/programmes/self-hypnosis',
        source: 'instagram',
        medium: 'paid social',
        campaign: 'september launch',
        content: 'reel A',
      }),
    ).toEqual({
      ok: true,
      value:
        '/programmes/self-hypnosis?utm_source=instagram&utm_medium=paid+social&utm_campaign=september+launch&utm_content=reel+A',
    });
  });

  it('requires source and omits blank optional fields', () => {
    expect(
      buildCampaignTaggedPath({
        pathname: '/programmes',
        source: 'facebook',
        medium: ' ',
        campaign: '',
        content: '',
      }),
    ).toEqual({
      ok: true,
      value: '/programmes?utm_source=facebook',
    });

    expect(
      buildCampaignTaggedPath({
        pathname: '/programmes',
        source: ' ',
        medium: '',
        campaign: '',
        content: '',
      }),
    ).toEqual({ ok: false, error: 'source-required' });
  });

  it('fails closed for unsafe pathname forms', () => {
    for (const pathname of [
      'programmes',
      '//example.test/path',
      '/programmes?existing=1',
      '/programmes#section',
      '/programmes\\item',
      '/https:example',
      '/programmes with space',
    ]) {
      expect(
        buildCampaignTaggedPath({
          pathname,
          source: 'instagram',
          medium: '',
          campaign: '',
          content: '',
        }),
      ).toEqual({ ok: false, error: 'path-unsafe' });
    }
  });

  it('enforces the existing pathname length limit', () => {
    expect(
      buildCampaignTaggedPath({
        pathname: `/${'a'.repeat(CAMPAIGN_PATH_LIMIT)}`,
        source: 'instagram',
        medium: '',
        campaign: '',
        content: '',
      }),
    ).toEqual({ ok: false, error: 'path-too-long' });
  });

  it('enforces the existing UTM value limit for every field', () => {
    const overLimit = 'a'.repeat(CAMPAIGN_VALUE_LIMIT + 1);
    const base = {
      pathname: '/programmes',
      source: 'instagram',
      medium: '',
      campaign: '',
      content: '',
    };

    expect(buildCampaignTaggedPath({ ...base, source: overLimit })).toEqual({
      ok: false,
      error: 'source-too-long',
    });
    expect(buildCampaignTaggedPath({ ...base, medium: overLimit })).toEqual({
      ok: false,
      error: 'medium-too-long',
    });
    expect(buildCampaignTaggedPath({ ...base, campaign: overLimit })).toEqual({
      ok: false,
      error: 'campaign-too-long',
    });
    expect(buildCampaignTaggedPath({ ...base, content: overLimit })).toEqual({
      ok: false,
      error: 'content-too-long',
    });
  });

  it('trims fields without inventing additional attribution parameters', () => {
    const result = buildCampaignTaggedPath({
      pathname: ' /programmes ',
      source: ' instagram ',
      medium: ' paid-social ',
      campaign: '',
      content: '',
    });

    expect(result).toEqual({
      ok: true,
      value:
        '/programmes?utm_source=instagram&utm_medium=paid-social',
    });
    if (result.ok) {
      expect(result.value).not.toContain('referrer');
      expect(result.value).not.toContain('click');
    }
  });
});
