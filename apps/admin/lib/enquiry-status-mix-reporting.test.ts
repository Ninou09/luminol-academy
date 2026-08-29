import { describe, expect, it } from 'vitest';

import { normalizeActiveEnquiryStatusMix } from './enquiry-status-mix-reporting';

describe('active enquiry status mix reporting', () => {
  it('keeps only active structured statuses in workflow order', () => {
    expect(
      normalizeActiveEnquiryStatusMix([
        { status: 'CONTACTED', _count: { _all: 4 } },
        { status: 'CLOSED', _count: { _all: 99 } },
        { status: 'NEW', _count: { _all: 7 } },
        { status: 'SPAM', _count: { _all: 99 } },
        { status: 'IN_REVIEW', _count: { _all: 5 } },
        { status: 'UNKNOWN', _count: { _all: 99 } },
      ]),
    ).toEqual({
      activeTotal: 16,
      items: [
        { status: 'NEW', count: 7 },
        { status: 'IN_REVIEW', count: 5 },
        { status: 'CONTACTED', count: 4 },
      ],
    });
  });

  it('omits zero and anomalous groups without inventing volume', () => {
    expect(
      normalizeActiveEnquiryStatusMix([
        { status: 'NEW', _count: { _all: 0 } },
        { status: 'IN_REVIEW', _count: { _all: -3 } },
        { status: 'CONTACTED', _count: { _all: Number.NaN } },
      ]),
    ).toEqual({ activeTotal: 0, items: [] });
  });

  it('keeps the displayed total equal to the displayed status counts', () => {
    const result = normalizeActiveEnquiryStatusMix([
      { status: 'NEW', _count: { _all: 2.9 } },
      { status: 'CONTACTED', _count: { _all: 3 } },
    ]);

    expect(result.activeTotal).toBe(5);
    expect(result.items.reduce((total, item) => total + item.count, 0)).toBe(
      result.activeTotal,
    );
  });
});
