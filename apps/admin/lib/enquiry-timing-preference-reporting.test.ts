import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_TIMING_PREFERENCES,
  normalizeEnquiryTimingPreferenceMix,
} from './enquiry-timing-preference-reporting';

describe('normalizeEnquiryTimingPreferenceMix', () => {
  it('keeps structured timing preferences in deterministic order including explicit not-sure', () => {
    expect(
      normalizeEnquiryTimingPreferenceMix(
        [
          { timingPreference: 'NOT_SURE', _count: { _all: 2 } },
          { timingPreference: 'LATER', _count: { _all: 4 } },
          { timingPreference: 'SOON', _count: { _all: 5 } },
          { timingPreference: 'WITHIN_MONTH', _count: { _all: 7 } },
          { timingPreference: null, _count: { _all: 3 } },
          { timingPreference: 'UNKNOWN', _count: { _all: 9 } },
        ],
        21,
      ),
    ).toEqual({
      total: 21,
      missing: 3,
      items: [
        { timingPreference: 'SOON', count: 5 },
        { timingPreference: 'WITHIN_MONTH', count: 7 },
        { timingPreference: 'LATER', count: 4 },
        { timingPreference: 'NOT_SURE', count: 2 },
      ],
    });
  });

  it('omits zero and invalid counts while preserving missing cohort volume', () => {
    expect(
      normalizeEnquiryTimingPreferenceMix(
        [
          { timingPreference: 'SOON', _count: { _all: 0 } },
          { timingPreference: 'WITHIN_MONTH', _count: { _all: -4 } },
          { timingPreference: 'LATER', _count: { _all: Number.NaN } },
        ],
        6,
      ),
    ).toEqual({ total: 6, missing: 6, items: [] });
  });

  it('safely handles zero and invalid cohort totals', () => {
    expect(normalizeEnquiryTimingPreferenceMix([], 0)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryTimingPreferenceMix([], Number.NaN)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
  });

  it('documents the supported persisted timing answers', () => {
    expect(ENQUIRY_TIMING_PREFERENCES).toEqual([
      'SOON',
      'WITHIN_MONTH',
      'LATER',
      'NOT_SURE',
    ]);
  });
});
