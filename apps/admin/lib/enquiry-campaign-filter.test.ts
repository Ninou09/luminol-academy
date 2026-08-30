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
      utmMedium: null,
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
      utmMedium: null,
    });
  });

  it('allows a bounded medium-only filter', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        ' paid_social ',
      ),
    ).toEqual({
      utmSource: null,
      utmCampaign: null,
      utmMedium: 'paid_social',
    });
  });

  it('combines medium with source-scoped campaign context', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        'instagram',
        'self-hypnosis-august',
        'paid_social',
      ),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
      utmMedium: 'paid_social',
    });
  });

  it('fails closed when campaign exists without a source', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(undefined, 'campaign-a', undefined),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter('   ', 'campaign-a', 'paid_social'),
    ).toBeNull();
  });

  it('fails closed when all attribution filter values are blank or missing', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(undefined, undefined, undefined),
    ).toBeNull();
    expect(parseEnquiryCampaignAttributionFilter(' ', ' ', ' ')).toBeNull();
  });

  it('fails closed when any attribution filter value exceeds the bound', () => {
    const tooLong = 'x'.repeat(ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT + 1);

    expect(
      parseEnquiryCampaignAttributionFilter(tooLong, undefined, undefined),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter('instagram', tooLong, undefined),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(undefined, undefined, tooLong),
    ).toBeNull();
  });

  it('creates exact structured Prisma predicates only', () => {
    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: null,
        utmMedium: null,
      }),
    ).toEqual({ utmSource: 'instagram' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: null,
        utmCampaign: null,
        utmMedium: 'paid_social',
      }),
    ).toEqual({ utmMedium: 'paid_social' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: 'self-hypnosis-august',
        utmMedium: 'paid_social',
      }),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
      utmMedium: 'paid_social',
    });

    expect(getEnquiryCampaignAttributionWhere(null)).toBeNull();
  });

  it('encodes supported drill-down query keys deterministically', () => {
    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: 'instagram paid',
        utmCampaign: 'august / launch',
        utmMedium: 'paid social',
      }),
    ).toBe(
      'utmSource=instagram+paid&utmCampaign=august+%2F+launch&utmMedium=paid+social',
    );
  });

  it('encodes a medium-only drill-down without inventing source context', () => {
    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: null,
        utmCampaign: null,
        utmMedium: 'paid_social',
      }),
    ).toBe('utmMedium=paid_social');
  });
});
