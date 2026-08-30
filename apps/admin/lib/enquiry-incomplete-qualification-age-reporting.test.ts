import { describe, expect, it } from 'vitest';

import {
  getIncompleteQualificationAgeWhere,
  summarizeIncompleteQualificationAge,
} from './enquiry-incomplete-qualification-age-reporting';

describe('getIncompleteQualificationAgeWhere', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');
  const oneDayAgo = new Date('2026-08-29T12:00:00.000Z');
  const fourDaysAgo = new Date('2026-08-26T12:00:00.000Z');
  const eightDaysAgo = new Date('2026-08-22T12:00:00.000Z');

  it('keeps the established active and incomplete qualification semantics', () => {
    expect(getIncompleteQualificationAgeWhere(now, 'under24Hours')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      OR: [
        { city: null },
        { preferredContact: null },
        { deliveryPreference: null },
        { timingPreference: null },
      ],
      createdAt: { gte: oneDayAgo },
    });
  });

  it('uses the same non-overlapping age boundaries as active enquiry age reporting', () => {
    expect(getIncompleteQualificationAgeWhere(now, 'oneToThreeDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      OR: [
        { city: null },
        { preferredContact: null },
        { deliveryPreference: null },
        { timingPreference: null },
      ],
      createdAt: { gte: fourDaysAgo, lt: oneDayAgo },
    });

    expect(getIncompleteQualificationAgeWhere(now, 'fourToSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      OR: [
        { city: null },
        { preferredContact: null },
        { deliveryPreference: null },
        { timingPreference: null },
      ],
      createdAt: { gte: eightDaysAgo, lt: fourDaysAgo },
    });

    expect(getIncompleteQualificationAgeWhere(now, 'overSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      OR: [
        { city: null },
        { preferredContact: null },
        { deliveryPreference: null },
        { timingPreference: null },
      ],
      createdAt: { lt: eightDaysAgo },
    });
  });

  it('leaves the under-24-hours bucket open-ended for future-dated anomalies', () => {
    const where = getIncompleteQualificationAgeWhere(now, 'under24Hours');
    expect(where.createdAt).toEqual({ gte: oneDayAgo });
  });
});

describe('summarizeIncompleteQualificationAge', () => {
  it('reconciles the total from all four buckets', () => {
    expect(
      summarizeIncompleteQualificationAge({
        under24Hours: 2,
        oneToThreeDays: 3,
        fourToSevenDays: 4,
        overSevenDays: 5,
      }),
    ).toEqual({
      activeTotal: 14,
      buckets: {
        under24Hours: 2,
        oneToThreeDays: 3,
        fourToSevenDays: 4,
        overSevenDays: 5,
      },
    });
  });

  it('safely floors positive fractions and clamps zero or invalid values', () => {
    expect(
      summarizeIncompleteQualificationAge({
        under24Hours: 2.9,
        oneToThreeDays: -4,
        fourToSevenDays: Number.NaN,
        overSevenDays: 0,
      }),
    ).toEqual({
      activeTotal: 2,
      buckets: {
        under24Hours: 2,
        oneToThreeDays: 0,
        fourToSevenDays: 0,
        overSevenDays: 0,
      },
    });
  });
});
