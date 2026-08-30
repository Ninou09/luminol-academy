import { describe, expect, it } from 'vitest';

import {
  MAX_ENQUIRY_CAMPAIGN_CONTENT_ITEMS,
  normalizeEnquiryCampaignContentMix,
} from './enquiry-campaign-content-reporting';

describe('normalizeEnquiryCampaignContentMix', () => {
  it('keeps non-null persisted content values in deterministic count order', () => {
    expect(
      normalizeEnquiryCampaignContentMix(
        [
          { utmContent: 'reel-a', _count: { _all: 4 } },
          { utmContent: 'story-b', _count: { _all: 7 } },
          { utmContent: 'carousel-a', _count: { _all: 4 } },
          { utmContent: null, _count: { _all: 8 } },
        ],
        23,
        15,
      ),
    ).toEqual({
      total: 23,
      recorded: 15,
      missing: 8,
      items: [
        { utmContent: 'story-b', count: 7 },
        { utmContent: 'carousel-a', count: 4 },
        { utmContent: 'reel-a', count: 4 },
      ],
    });
  });

  it('bounds the mix to six values after deterministic sorting', () => {
    const groups = Array.from({ length: 8 }, (_, index) => ({
      utmContent: `content-${index}`,
      _count: { _all: 8 - index },
    }));

    const summary = normalizeEnquiryCampaignContentMix(groups, 36, 36);

    expect(summary.items).toHaveLength(MAX_ENQUIRY_CAMPAIGN_CONTENT_ITEMS);
    expect(summary.items.map((item) => item.utmContent)).toEqual([
      'content-0',
      'content-1',
      'content-2',
      'content-3',
      'content-4',
      'content-5',
    ]);
  });

  it('omits invalid group counts while keeping cohort reconciliation safe', () => {
    expect(
      normalizeEnquiryCampaignContentMix(
        [
          { utmContent: 'reel-a', _count: { _all: 0 } },
          { utmContent: 'story-a', _count: { _all: Number.NaN } },
        ],
        5,
        9,
      ),
    ).toEqual({ total: 5, recorded: 5, missing: 0, items: [] });
  });

  it('handles zero and invalid cohort totals safely', () => {
    expect(normalizeEnquiryCampaignContentMix([], 0, 0)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryCampaignContentMix([], Number.NaN, 3)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
  });
});
