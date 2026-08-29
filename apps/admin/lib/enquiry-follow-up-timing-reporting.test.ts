import { describe, expect, it } from 'vitest';

import {
  getActiveEnquiryFollowUpTimingWhere,
  summarizeFollowUpTiming,
} from './enquiry-follow-up-timing-reporting';

describe('active enquiry follow-up timing reporting', () => {
  const now = new Date('2026-08-29T12:00:00.000Z');
  const active = { status: { notIn: ['CLOSED', 'SPAM'] } };

  it('keeps incomplete follow-up plans explicitly separate', () => {
    expect(getActiveEnquiryFollowUpTimingWhere(now, 'missingPlan')).toEqual({
      ...active,
      OR: [{ nextFollowUpAt: null }, { nextAction: null }],
    });
  });

  it('defines deterministic non-overlapping complete-plan timing buckets', () => {
    const nextDay = new Date('2026-08-30T12:00:00.000Z');
    const nextThreeDays = new Date('2026-09-01T12:00:00.000Z');

    expect(getActiveEnquiryFollowUpTimingWhere(now, 'pastDue')).toEqual({
      ...active,
      nextAction: { not: null },
      nextFollowUpAt: { not: null, lt: now },
    });
    expect(getActiveEnquiryFollowUpTimingWhere(now, 'next24Hours')).toEqual({
      ...active,
      nextAction: { not: null },
      nextFollowUpAt: { not: null, gte: now, lt: nextDay },
    });
    expect(getActiveEnquiryFollowUpTimingWhere(now, 'oneToThreeDays')).toEqual({
      ...active,
      nextAction: { not: null },
      nextFollowUpAt: { not: null, gte: nextDay, lt: nextThreeDays },
    });
    expect(getActiveEnquiryFollowUpTimingWhere(now, 'later')).toEqual({
      ...active,
      nextAction: { not: null },
      nextFollowUpAt: { not: null, gte: nextThreeDays },
    });
  });

  it('reconciles the active cohort exactly from missing and scheduled buckets', () => {
    expect(
      summarizeFollowUpTiming({
        missingPlan: 2,
        pastDue: 1,
        next24Hours: 3,
        oneToThreeDays: 4,
        later: 5,
      }),
    ).toEqual({
      activeTotal: 15,
      buckets: {
        missingPlan: 2,
        pastDue: 1,
        next24Hours: 3,
        oneToThreeDays: 4,
        later: 5,
      },
    });
  });

  it('keeps zero and anomalous counts safe', () => {
    expect(
      summarizeFollowUpTiming({
        missingPlan: 0,
        pastDue: 0,
        next24Hours: 0,
        oneToThreeDays: 0,
        later: 0,
      }).activeTotal,
    ).toBe(0);

    expect(
      summarizeFollowUpTiming({
        missingPlan: -1,
        pastDue: Number.NaN,
        next24Hours: 2.9,
        oneToThreeDays: 1,
        later: 0,
      }),
    ).toEqual({
      activeTotal: 3,
      buckets: {
        missingPlan: 0,
        pastDue: 0,
        next24Hours: 2,
        oneToThreeDays: 1,
        later: 0,
      },
    });
  });
});
