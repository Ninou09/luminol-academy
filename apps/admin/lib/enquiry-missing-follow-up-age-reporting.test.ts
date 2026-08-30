import { describe, expect, it } from 'vitest';

import {
  getMissingFollowUpPlanAgeWhere,
  summarizeMissingFollowUpPlanAge,
} from './enquiry-missing-follow-up-age-reporting';

describe('getMissingFollowUpPlanAgeWhere', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');

  it('requires the established active-age predicate and an incomplete recorded plan', () => {
    expect(getMissingFollowUpPlanAgeWhere(now, 'under24Hours')).toEqual({
      AND: [
        {
          status: { notIn: ['CLOSED', 'SPAM'] },
          createdAt: { gte: new Date('2026-08-29T12:00:00.000Z') },
        },
        { OR: [{ nextFollowUpAt: null }, { nextAction: null }] },
      ],
    });
  });

  it('reuses the exact established age boundaries for older buckets', () => {
    expect(getMissingFollowUpPlanAgeWhere(now, 'oneToThreeDays')).toEqual({
      AND: [
        {
          status: { notIn: ['CLOSED', 'SPAM'] },
          createdAt: {
            gte: new Date('2026-08-26T12:00:00.000Z'),
            lt: new Date('2026-08-29T12:00:00.000Z'),
          },
        },
        { OR: [{ nextFollowUpAt: null }, { nextAction: null }] },
      ],
    });
    expect(getMissingFollowUpPlanAgeWhere(now, 'fourToSevenDays')).toEqual({
      AND: [
        {
          status: { notIn: ['CLOSED', 'SPAM'] },
          createdAt: {
            gte: new Date('2026-08-22T12:00:00.000Z'),
            lt: new Date('2026-08-26T12:00:00.000Z'),
          },
        },
        { OR: [{ nextFollowUpAt: null }, { nextAction: null }] },
      ],
    });
    expect(getMissingFollowUpPlanAgeWhere(now, 'overSevenDays')).toEqual({
      AND: [
        {
          status: { notIn: ['CLOSED', 'SPAM'] },
          createdAt: { lt: new Date('2026-08-22T12:00:00.000Z') },
        },
        { OR: [{ nextFollowUpAt: null }, { nextAction: null }] },
      ],
    });
  });
});

describe('summarizeMissingFollowUpPlanAge', () => {
  it('reconciles the missing-plan total from the four age buckets', () => {
    expect(
      summarizeMissingFollowUpPlanAge({
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

  it('handles zero, negative, fractional and invalid counts safely', () => {
    expect(
      summarizeMissingFollowUpPlanAge({
        under24Hours: Number.NaN,
        oneToThreeDays: -3,
        fourToSevenDays: 2.9,
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
