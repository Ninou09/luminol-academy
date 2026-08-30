import { describe, expect, it } from 'vitest';

import {
  buildEnquiryCampaignAttributionQuery,
  ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT,
  getEnquiryCampaignAttributionWhere,
  parseEnquiryCampaignAttributionFilter,
} from './enquiry-campaign-filter';

describe('enquiry campaign attribution filters', () => {
  it('parses a bounded source-only filter', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(' instagram ', undefined),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: null,
    });
  });

  it('parses source and campaign together from the first query values', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        ['instagram', 'ignored'],
        ['self-hypnosis-august', 'ignored'],
      ),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
    });
  });

  it('fails closed without a source even when a campaign is present', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(undefined, 'campaign-a'),
    ).toBeNull();
    expect(parseEnquiryCampaignAttributionFilter('   ', 'campaign-a')).toBeNull();
  });

  it('fails closed when either persisted attribution value exceeds the bound', () => {
    const tooLong = 'x'.repeat(ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT + 1);

    expect(parseEnquiryCampaignAttributionFilter(tooLong, undefined)).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter('instagram', tooLong),
    ).toBeNull();
  });

  it('creates exact structured Prisma predicates only', () => {
    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: null,
      }),
    ).toEqual({ utmSource: 'instagram' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: 'self-hypnosis-august',
      }),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
    });

    expect(getEnquiryCampaignAttributionWhere(null)).toBeNull();
  });

  it('encodes only the supported drill-down query keys deterministically', () => {
    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: 'instagram paid',
        utmCampaign: 'august / launch',
      }),
    ).toBe(
      'utmSource=instagram+paid&utmCampaign=august+%2F+launch',
    );
  });
});
