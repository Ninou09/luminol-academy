import { describe, expect, it } from 'vitest';

import {
  MAX_ENQUIRY_CAMPAIGN_MEDIUM_ITEMS,
  normalizeEnquiryCampaignMediumMix,
} from './enquiry-campaign-medium-reporting';

describe('normalizeEnquiryCampaignMediumMix', () => {
  it('keeps non-null persisted medium values in deterministic count order', () => {
    expect(
      normalizeEnquiryCampaignMediumMix(
        [
          { utmMedium: 'social', _count: { _all: 4 } },
          { utmMedium: 'paid_social', _count: { _all: 7 } },
          { utmMedium: 'email', _count: { _all: 4 } },
          { utmMedium: null, _count: { _all: 8 } },
        ],
        23,
        15,
      ),
    ).toEqual({
      total: 23,
      recorded: 15,
      missing: 8,
      items: [
        { utmMedium: 'paid_social', count: 7 },
        { utmMedium: 'email', count: 4 },
        { utmMedium: 'social', count: 4 },
      ],
    });
  });

  it('bounds the mix to six values after deterministic sorting', () => {
    const groups = Array.from({ length: 8 }, (_, index) => ({
      utmMedium: `medium-${index}`,
      _count: { _all: 8 - index },
    }));

    const summary = normalizeEnquiryCampaignMediumMix(groups, 36, 36);

    expect(summary.items).toHaveLength(MAX_ENQUIRY_CAMPAIGN_MEDIUM_ITEMS);
    expect(summary.items.map((item) => item.utmMedium)).toEqual([
      'medium-0',
      'medium-1',
      'medium-2',
      'medium-3',
      'medium-4',
      'medium-5',
    ]);
  });

  it('omits invalid group counts while keeping cohort reconciliation safe', () => {
    expect(
      normalizeEnquiryCampaignMediumMix(
        [
          { utmMedium: 'social', _count: { _all: 0 } },
          { utmMedium: 'email', _count: { _all: Number.NaN } },
        ],
        5,
        9,
      ),
    ).toEqual({ total: 5, recorded: 5, missing: 0, items: [] });
  });

  it('handles zero and invalid cohort totals safely', () => {
    expect(normalizeEnquiryCampaignMediumMix([], 0, 0)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryCampaignMediumMix([], Number.NaN, 3)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
  });
});
