import { describe, expect, it } from 'vitest';

import {
  WORKSHOP_TALLY_REGISTRATION_URL,
  buildWorkshopRegistrationHref,
} from './workshop-attribution';

describe('workshop Tally attribution', () => {
  it('passes through only fields already governed by the live Tally form', () => {
    const url = new URL(
      buildWorkshopRegistrationHref({
        utm_source: 'facebook',
        utm_medium: 'paid_social',
        utm_campaign: 'LUM_FREE_250926_TRAFFIC',
        utm_content: 'poster_01',
        meta_campaign_id: '120260600000000059',
        meta_adset_id: '120260600000000060',
        meta_ad_id: '120260634590040059',
        fbclid: 'must-not-pass-through',
        email: 'private@example.com',
      }),
    );

    expect(url.origin + url.pathname).toBe(WORKSHOP_TALLY_REGISTRATION_URL);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'LUM_FREE_250926_TRAFFIC',
      utm_content: 'poster_01',
      meta_campaign_id: '120260600000000059',
      meta_adset_id: '120260600000000060',
      meta_ad_id: '120260634590040059',
    });
  });

  it('fails closed when an allowed field has an invalid value', () => {
    expect(
      buildWorkshopRegistrationHref({
        utm_source: 'facebook\nunsafe',
        meta_ad_id: 'not-a-meta-id',
      }),
    ).toBe(WORKSHOP_TALLY_REGISTRATION_URL);
  });

  it('ignores repeated query values instead of choosing one implicitly', () => {
    expect(
      buildWorkshopRegistrationHref({
        utm_source: ['facebook', 'spoofed'],
      }),
    ).toBe(WORKSHOP_TALLY_REGISTRATION_URL);
  });
});
