import { describe, expect, it } from 'vitest';

import {
  MAX_ENQUIRY_LANDING_PATH_ITEMS,
  normalizeEnquiryLandingPathMix,
} from './enquiry-landing-path-reporting';

describe('normalizeEnquiryLandingPathMix', () => {
  it('keeps non-null landing paths in deterministic count order and bounds the list', () => {
    expect(
      normalizeEnquiryLandingPathMix(
        [
          { landingPath: '/programmes/zeta', _count: { _all: 2 } },
          { landingPath: '/contact', _count: { _all: 7 } },
          { landingPath: '/programmes/alpha', _count: { _all: 2 } },
          { landingPath: '/about', _count: { _all: 5 } },
          { landingPath: '/psychology', _count: { _all: 4 } },
          { landingPath: '/languages', _count: { _all: 3 } },
          { landingPath: '/professional-training', _count: { _all: 3 } },
          { landingPath: null, _count: { _all: 6 } },
        ],
        32,
        26,
      ),
    ).toEqual({
      total: 32,
      recorded: 26,
      missing: 6,
      items: [
        { landingPath: '/contact', count: 7 },
        { landingPath: '/about', count: 5 },
        { landingPath: '/psychology', count: 4 },
        { landingPath: '/languages', count: 3 },
        { landingPath: '/professional-training', count: 3 },
        { landingPath: '/programmes/alpha', count: 2 },
      ],
    });
  });

  it('omits invalid counts and safely clamps recorded and missing totals', () => {
    expect(
      normalizeEnquiryLandingPathMix(
        [
          { landingPath: '/contact', _count: { _all: 0 } },
          { landingPath: '/about', _count: { _all: -2 } },
          { landingPath: '/psychology', _count: { _all: Number.NaN } },
        ],
        4,
        9,
      ),
    ).toEqual({ total: 4, recorded: 4, missing: 0, items: [] });
  });

  it('safely handles zero and invalid cohort totals', () => {
    expect(normalizeEnquiryLandingPathMix([], 0, 0)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryLandingPathMix([], Number.NaN, Number.NaN)).toEqual({
      total: 0,
      recorded: 0,
      missing: 0,
      items: [],
    });
  });

  it('keeps the public landing-path mix bounded', () => {
    expect(MAX_ENQUIRY_LANDING_PATH_ITEMS).toBe(6);
  });
});
