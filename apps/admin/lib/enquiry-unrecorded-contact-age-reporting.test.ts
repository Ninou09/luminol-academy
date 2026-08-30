import { describe, expect, it } from 'vitest';

import {
  getUnrecordedContactAgeWhere,
  summarizeUnrecordedContactAge,
} from './enquiry-unrecorded-contact-age-reporting';

describe('getUnrecordedContactAgeWhere', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');
  const oneDayAgo = new Date('2026-08-29T12:00:00.000Z');
  const fourDaysAgo = new Date('2026-08-26T12:00:00.000Z');
  const eightDaysAgo = new Date('2026-08-22T12:00:00.000Z');

  it('keeps the established active and no-recorded-contact semantics', () => {
    expect(getUnrecordedContactAgeWhere(now, 'under24Hours')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      statusEvents: { none: { toStatus: 'CONTACTED' } },
      createdAt: { gte: oneDayAgo },
    });
  });

  it('uses the same non-overlapping age boundaries as active enquiry age reporting', () => {
    expect(getUnrecordedContactAgeWhere(now, 'oneToThreeDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      statusEvents: { none: { toStatus: 'CONTACTED' } },
      createdAt: { gte: fourDaysAgo, lt: oneDayAgo },
    });

    expect(getUnrecordedContactAgeWhere(now, 'fourToSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      statusEvents: { none: { toStatus: 'CONTACTED' } },
      createdAt: { gte: eightDaysAgo, lt: fourDaysAgo },
    });

    expect(getUnrecordedContactAgeWhere(now, 'overSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      statusEvents: { none: { toStatus: 'CONTACTED' } },
      createdAt: { lt: eightDaysAgo },
    });
  });

  it('leaves the under-24-hours bucket open-ended for future-dated anomalies', () => {
    const where = getUnrecordedContactAgeWhere(now, 'under24Hours');
    expect(where.createdAt).toEqual({ gte: oneDayAgo });
  });
});

describe('summarizeUnrecordedContactAge', () => {
  it('reconciles the total from all four buckets', () => {
    expect(
      summarizeUnrecordedContactAge({
        under24Hours: 1,
        oneToThreeDays: 2,
        fourToSevenDays: 3,
        overSevenDays: 4,
      }),
    ).toEqual({
      activeTotal: 10,
      buckets: {
        under24Hours: 1,
        oneToThreeDays: 2,
        fourToSevenDays: 3,
        overSevenDays: 4,
      },
    });
  });

  it('safely floors positive fractions and clamps zero or invalid values', () => {
    expect(
      summarizeUnrecordedContactAge({
        under24Hours: 3.8,
        oneToThreeDays: -1,
        fourToSevenDays: Number.NaN,
        overSevenDays: 0,
      }),
    ).toEqual({
      activeTotal: 3,
      buckets: {
        under24Hours: 3,
        oneToThreeDays: 0,
        fourToSevenDays: 0,
        overSevenDays: 0,
      },
    });
  });
});
