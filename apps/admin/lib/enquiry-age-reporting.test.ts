import { describe, expect, it } from 'vitest';

import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
} from './enquiry-age-reporting';

describe('active enquiry age reporting', () => {
  const now = new Date('2026-08-29T12:00:00.000Z');
  const active = { status: { notIn: ['CLOSED', 'SPAM'] } };

  it('defines deterministic non-overlapping age predicates', () => {
    expect(getActiveEnquiryAgeWhere(now, 'under24Hours')).toEqual({
      ...active,
      createdAt: { gte: new Date('2026-08-28T12:00:00.000Z') },
    });
    expect(getActiveEnquiryAgeWhere(now, 'oneToThreeDays')).toEqual({
      ...active,
      createdAt: {
        gte: new Date('2026-08-25T12:00:00.000Z'),
        lt: new Date('2026-08-28T12:00:00.000Z'),
      },
    });
    expect(getActiveEnquiryAgeWhere(now, 'fourToSevenDays')).toEqual({
      ...active,
      createdAt: {
        gte: new Date('2026-08-21T12:00:00.000Z'),
        lt: new Date('2026-08-25T12:00:00.000Z'),
      },
    });
    expect(getActiveEnquiryAgeWhere(now, 'overSevenDays')).toEqual({
      ...active,
      createdAt: { lt: new Date('2026-08-21T12:00:00.000Z') },
    });
  });

  it('derives active total exactly from the age buckets', () => {
    expect(
      summarizeActiveEnquiryAge({
        under24Hours: 3,
        oneToThreeDays: 4,
        fourToSevenDays: 2,
        overSevenDays: 1,
      }),
    ).toEqual({
      activeTotal: 10,
      buckets: {
        under24Hours: 3,
        oneToThreeDays: 4,
        fourToSevenDays: 2,
        overSevenDays: 1,
      },
    });
  });

  it('keeps zero and anomalous count inputs safe', () => {
    expect(
      summarizeActiveEnquiryAge({
        under24Hours: 0,
        oneToThreeDays: 0,
        fourToSevenDays: 0,
        overSevenDays: 0,
      }).activeTotal,
    ).toBe(0);

    expect(
      summarizeActiveEnquiryAge({
        under24Hours: -4,
        oneToThreeDays: 2.9,
        fourToSevenDays: Number.NaN,
        overSevenDays: 1,
      }),
    ).toEqual({
      activeTotal: 3,
      buckets: {
        under24Hours: 0,
        oneToThreeDays: 2,
        fourToSevenDays: 0,
        overSevenDays: 1,
      },
    });
  });

  it('places future-dated anomalies in the youngest bucket rather than creating negative age', () => {
    expect(getActiveEnquiryAgeWhere(now, 'under24Hours')).toMatchObject({
      createdAt: { gte: new Date('2026-08-28T12:00:00.000Z') },
    });
  });
});
