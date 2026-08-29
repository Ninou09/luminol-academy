import { describe, expect, it } from 'vitest';

import {
  RECENT_ENQUIRY_STATUS_SEQUENCE,
  normalizeRecentEnquiryStatusMix,
} from './enquiry-recent-status-mix-reporting';

describe('normalizeRecentEnquiryStatusMix', () => {
  it('keeps the five persisted workflow states in deterministic order', () => {
    expect(
      normalizeRecentEnquiryStatusMix([
        { status: 'SPAM', _count: { _all: 2 } },
        { status: 'CLOSED', _count: { _all: 4 } },
        { status: 'NEW', _count: { _all: 5 } },
        { status: 'CONTACTED', _count: { _all: 3 } },
        { status: 'IN_REVIEW', _count: { _all: 6 } },
      ]),
    ).toEqual({
      total: 20,
      items: [
        { status: 'NEW', count: 5 },
        { status: 'IN_REVIEW', count: 6 },
        { status: 'CONTACTED', count: 3 },
        { status: 'CLOSED', count: 4 },
        { status: 'SPAM', count: 2 },
      ],
    });
  });

  it('omits unknown, zero and invalid groups', () => {
    expect(
      normalizeRecentEnquiryStatusMix([
        { status: 'UNKNOWN', _count: { _all: 9 } },
        { status: 'NEW', _count: { _all: 0 } },
        { status: 'CLOSED', _count: { _all: -2 } },
        { status: 'SPAM', _count: { _all: Number.NaN } },
      ]),
    ).toEqual({ total: 0, items: [] });
  });

  it('safely handles an empty recent cohort', () => {
    expect(normalizeRecentEnquiryStatusMix([])).toEqual({
      total: 0,
      items: [],
    });
  });

  it('documents the full persisted status sequence', () => {
    expect(RECENT_ENQUIRY_STATUS_SEQUENCE).toEqual([
      'NEW',
      'IN_REVIEW',
      'CONTACTED',
      'CLOSED',
      'SPAM',
    ]);
  });
});
