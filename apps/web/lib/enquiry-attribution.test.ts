import { describe, expect, it } from 'vitest';

import { getCurrentEnquiryAttribution } from './enquiry-attribution';

describe('public enquiry campaign attribution', () => {
  it('captures only supported current-page UTM values and pathname', () => {
    expect(
      getCurrentEnquiryAttribution({
        pathname: '/fr/contact',
        search:
          '?utm_source=instagram&utm_medium=paid_social&utm_campaign=august-psychology&utm_content=reel-03&email=private%40example.com',
      }),
    ).toEqual({
      landingPath: '/fr/contact',
      utmSource: 'instagram',
      utmMedium: 'paid_social',
      utmCampaign: 'august-psychology',
      utmContent: 'reel-03',
    });
  });

  it('omits blank attribution and never stores the query string as landing context', () => {
    expect(
      getCurrentEnquiryAttribution({
        pathname: '/ar/contact',
        search: '?utm_source=%20%20&utm_campaign=',
      }),
    ).toEqual({
      landingPath: '/ar/contact',
      utmSource: undefined,
      utmMedium: undefined,
      utmCampaign: undefined,
      utmContent: undefined,
    });
  });

  it('bounds campaign values before submission', () => {
    const attribution = getCurrentEnquiryAttribution({
      pathname: `/pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp`,
      search: `?utm_campaign=cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc`,
    });

    expect(attribution.landingPath).toHaveLength(240);
    expect(attribution.utmCampaign).toHaveLength(160);
  });
});
