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
      utmContent: null,
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
      utmContent: null,
    });
  });

  it('allows a bounded medium-only filter without inventing source context', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        ' paid_social ',
      ),
    ).toEqual({
      utmSource: '',
      utmCampaign: null,
      utmMedium: 'paid_social',
      utmContent: null,
    });
  });

  it('allows a bounded content-only filter without inventing source context', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        undefined,
        ' reel-a ',
      ),
    ).toEqual({
      utmSource: '',
      utmCampaign: null,
      utmMedium: null,
      utmContent: 'reel-a',
    });
  });

  it('combines content with source-scoped campaign and medium context', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        'instagram',
        'self-hypnosis-august',
        'paid_social',
        'reel-a',
      ),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
      utmMedium: 'paid_social',
      utmContent: 'reel-a',
    });
  });

  it('fails closed when campaign exists without a source', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        'campaign-a',
        undefined,
        undefined,
      ),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(
        '   ',
        'campaign-a',
        'paid_social',
        'reel-a',
      ),
    ).toBeNull();
  });

  it('fails closed when all attribution filter values are blank or missing', () => {
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(' ', ' ', ' ', ' '),
    ).toBeNull();
  });

  it('fails closed when any attribution filter value exceeds the bound', () => {
    const tooLong = 'x'.repeat(ENQUIRY_CAMPAIGN_FILTER_VALUE_LIMIT + 1);

    expect(
      parseEnquiryCampaignAttributionFilter(
        tooLong,
        undefined,
        undefined,
        undefined,
      ),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(
        'instagram',
        tooLong,
        undefined,
        undefined,
      ),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        tooLong,
        undefined,
      ),
    ).toBeNull();
    expect(
      parseEnquiryCampaignAttributionFilter(
        undefined,
        undefined,
        undefined,
        tooLong,
      ),
    ).toBeNull();
  });

  it('creates exact structured Prisma predicates only', () => {
    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: null,
        utmMedium: null,
        utmContent: null,
      }),
    ).toEqual({ utmSource: 'instagram' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: '',
        utmCampaign: null,
        utmMedium: 'paid_social',
        utmContent: null,
      }),
    ).toEqual({ utmMedium: 'paid_social' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: '',
        utmCampaign: null,
        utmMedium: null,
        utmContent: 'reel-a',
      }),
    ).toEqual({ utmContent: 'reel-a' });

    expect(
      getEnquiryCampaignAttributionWhere({
        utmSource: 'instagram',
        utmCampaign: 'self-hypnosis-august',
        utmMedium: 'paid_social',
        utmContent: 'reel-a',
      }),
    ).toEqual({
      utmSource: 'instagram',
      utmCampaign: 'self-hypnosis-august',
      utmMedium: 'paid_social',
      utmContent: 'reel-a',
    });

    expect(getEnquiryCampaignAttributionWhere(null)).toBeNull();
  });

  it('encodes supported drill-down query keys deterministically', () => {
    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: 'instagram paid',
        utmCampaign: 'august / launch',
        utmMedium: 'paid social',
        utmContent: 'reel A',
      }),
    ).toBe(
      'utmSource=instagram+paid&utmCampaign=august+%2F+launch&utmMedium=paid+social&utmContent=reel+A',
    );
  });

  it('encodes source-less drill-downs without emitting an empty source', () => {
    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: '',
        utmCampaign: null,
        utmMedium: 'paid_social',
        utmContent: null,
      }),
    ).toBe('utmMedium=paid_social');

    expect(
      buildEnquiryCampaignAttributionQuery({
        utmSource: null,
        utmCampaign: null,
        utmMedium: null,
        utmContent: 'reel-a',
      }),
    ).toBe('utmContent=reel-a');
  });
});
