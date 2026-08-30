import { describe, expect, it } from 'vitest';

import {
  getUnassignedActiveEnquiryAgeWhere,
  summarizeUnassignedActiveEnquiryAge,
} from './enquiry-unassigned-age-reporting';

describe('getUnassignedActiveEnquiryAgeWhere', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');

  it('uses the established under-24-hours active boundary and requires no owner', () => {
    expect(getUnassignedActiveEnquiryAgeWhere(now, 'under24Hours')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: { gte: new Date('2026-08-29T12:00:00.000Z') },
      ownerUserId: null,
    });
  });

  it('uses the established 1–3 day non-overlapping boundaries', () => {
    expect(getUnassignedActiveEnquiryAgeWhere(now, 'oneToThreeDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: {
        gte: new Date('2026-08-26T12:00:00.000Z'),
        lt: new Date('2026-08-29T12:00:00.000Z'),
      },
      ownerUserId: null,
    });
  });

  it('uses the established 4–7 day and over-7-day boundaries', () => {
    expect(getUnassignedActiveEnquiryAgeWhere(now, 'fourToSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: {
        gte: new Date('2026-08-22T12:00:00.000Z'),
        lt: new Date('2026-08-26T12:00:00.000Z'),
      },
      ownerUserId: null,
    });
    expect(getUnassignedActiveEnquiryAgeWhere(now, 'overSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: { lt: new Date('2026-08-22T12:00:00.000Z') },
      ownerUserId: null,
    });
  });
});

describe('summarizeUnassignedActiveEnquiryAge', () => {
  it('reconciles the exact unassigned total from all age buckets', () => {
    expect(
      summarizeUnassignedActiveEnquiryAge({
        under24Hours: 4,
        oneToThreeDays: 3,
        fourToSevenDays: 2,
        overSevenDays: 1,
      }),
    ).toEqual({
      activeTotal: 10,
      buckets: {
        under24Hours: 4,
        oneToThreeDays: 3,
        fourToSevenDays: 2,
        overSevenDays: 1,
      },
    });
  });

  it('inherits safe zero and invalid-count handling from active age reporting', () => {
    expect(
      summarizeUnassignedActiveEnquiryAge({
        under24Hours: Number.NaN,
        oneToThreeDays: -3,
        fourToSevenDays: 2.8,
        overSevenDays: 0,
      }),
    ).toEqual({
      activeTotal: 2,
      buckets: {
        under24Hours: 0,
        oneToThreeDays: 0,
        fourToSevenDays: 2,
        overSevenDays: 0,
      },
    });
  });
});
