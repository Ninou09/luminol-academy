import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_QUALIFICATION_GAP_FIELDS,
  getRecentActiveQualificationGapWhere,
  summarizeRecentActiveQualificationGaps,
} from './enquiry-qualification-gap-reporting';

describe('getRecentActiveQualificationGapWhere', () => {
  const now = new Date('2026-08-29T12:00:00.000Z');
  const start = new Date('2026-07-30T12:00:00.000Z');

  it.each(ENQUIRY_QUALIFICATION_GAP_FIELDS)(
    'uses the recent-active cohort and null %s only',
    (field) => {
      expect(getRecentActiveQualificationGapWhere(now, field)).toEqual({
        createdAt: { gte: start },
        status: { notIn: ['CLOSED', 'SPAM'] },
        [field]: null,
      });
    },
  );
});

describe('summarizeRecentActiveQualificationGaps', () => {
  it('keeps independent overlapping field gaps bounded by the active cohort', () => {
    expect(
      summarizeRecentActiveQualificationGaps({
        activeTotal: 10,
        cityMissing: 7,
        preferredContactMissing: 5,
        deliveryPreferenceMissing: 12,
        timingPreferenceMissing: 3,
      }),
    ).toEqual({
      activeTotal: 10,
      cityMissing: 7,
      preferredContactMissing: 5,
      deliveryPreferenceMissing: 10,
      timingPreferenceMissing: 3,
    });
  });

  it('safely handles zero, negative and invalid counts', () => {
    expect(
      summarizeRecentActiveQualificationGaps({
        activeTotal: Number.NaN,
        cityMissing: 4,
        preferredContactMissing: -2,
        deliveryPreferenceMissing: Number.NaN,
        timingPreferenceMissing: 1,
      }),
    ).toEqual({
      activeTotal: 0,
      cityMissing: 0,
      preferredContactMissing: 0,
      deliveryPreferenceMissing: 0,
      timingPreferenceMissing: 0,
    });
  });

  it('documents the four structured qualification fields', () => {
    expect(ENQUIRY_QUALIFICATION_GAP_FIELDS).toEqual([
      'city',
      'preferredContact',
      'deliveryPreference',
      'timingPreference',
    ]);
  });
});
