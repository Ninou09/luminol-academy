import { describe, expect, it } from 'vitest';

import { summarizeEnquiryFirstContactTurnaround } from './enquiry-contact-turnaround';

describe('enquiry first-contact turnaround', () => {
  it('uses the earliest recorded contact event when multiple events exist', () => {
    const summary = summarizeEnquiryFirstContactTurnaround([
      {
        createdAt: new Date('2026-08-29T08:00:00.000Z'),
        statusEvents: [
          { createdAt: new Date('2026-08-29T12:30:00.000Z') },
          { createdAt: new Date('2026-08-29T08:45:00.000Z') },
          { createdAt: new Date('2026-08-29T10:00:00.000Z') },
        ],
      },
    ]);

    expect(summary).toMatchObject({
      total: 1,
      contacted: 1,
      uncontacted: 0,
      medianMinutes: 45,
      buckets: {
        underOneHour: 1,
        oneToFourHours: 0,
        fourToTwentyFourHours: 0,
        overTwentyFourHours: 0,
      },
    });
  });

  it('keeps enquiries without a contact event explicitly uncontacted', () => {
    const summary = summarizeEnquiryFirstContactTurnaround([
      {
        createdAt: new Date('2026-08-29T08:00:00.000Z'),
        statusEvents: [],
      },
      {
        createdAt: new Date('2026-08-29T09:00:00.000Z'),
        statusEvents: [{ createdAt: new Date('2026-08-29T10:00:00.000Z') }],
      },
    ]);

    expect(summary.total).toBe(2);
    expect(summary.contacted).toBe(1);
    expect(summary.uncontacted).toBe(1);
    expect(summary.medianMinutes).toBe(60);
  });

  it('calculates deterministic median and turnaround buckets', () => {
    const createdAt = new Date('2026-08-29T00:00:00.000Z');
    const summary = summarizeEnquiryFirstContactTurnaround([
      {
        createdAt,
        statusEvents: [{ createdAt: new Date('2026-08-29T00:30:00.000Z') }],
      },
      {
        createdAt,
        statusEvents: [{ createdAt: new Date('2026-08-29T02:00:00.000Z') }],
      },
      {
        createdAt,
        statusEvents: [{ createdAt: new Date('2026-08-29T12:00:00.000Z') }],
      },
      {
        createdAt,
        statusEvents: [{ createdAt: new Date('2026-08-30T06:00:00.000Z') }],
      },
    ]);

    expect(summary.medianMinutes).toBe(420);
    expect(summary.buckets).toEqual({
      underOneHour: 1,
      oneToFourHours: 1,
      fourToTwentyFourHours: 1,
      overTwentyFourHours: 1,
    });
  });

  it('handles zero-contact and zero-enquiry cohorts safely', () => {
    expect(summarizeEnquiryFirstContactTurnaround([])).toEqual({
      total: 0,
      contacted: 0,
      uncontacted: 0,
      medianMinutes: null,
      buckets: {
        underOneHour: 0,
        oneToFourHours: 0,
        fourToTwentyFourHours: 0,
        overTwentyFourHours: 0,
      },
    });

    expect(
      summarizeEnquiryFirstContactTurnaround([
        {
          createdAt: new Date('2026-08-29T08:00:00.000Z'),
          statusEvents: [],
        },
      ]).medianMinutes,
    ).toBeNull();
  });

  it('clamps anomalous pre-creation event timestamps to zero minutes', () => {
    const summary = summarizeEnquiryFirstContactTurnaround([
      {
        createdAt: new Date('2026-08-29T08:00:00.000Z'),
        statusEvents: [{ createdAt: new Date('2026-08-29T07:59:00.000Z') }],
      },
    ]);

    expect(summary.medianMinutes).toBe(0);
    expect(summary.buckets.underOneHour).toBe(1);
  });
});
