import { describe, expect, it } from 'vitest';

import {
  buildEnquiryActiveAgeQuery,
  ENQUIRY_ACTIVE_AGE_BUCKETS,
  getEnquiryActiveAgeWhere,
  parseEnquiryActiveAgeFilter,
} from './enquiry-active-age-filter';

describe('enquiry active age filter', () => {
  it('accepts only the established active-age buckets', () => {
    for (const bucket of ENQUIRY_ACTIVE_AGE_BUCKETS) {
      expect(parseEnquiryActiveAgeFilter(bucket)).toBe(bucket);
    }
  });

  it('fails closed for missing, repeated, malformed or unsupported query state', () => {
    expect(parseEnquiryActiveAgeFilter(undefined)).toBeNull();
    expect(parseEnquiryActiveAgeFilter('')).toBeNull();
    expect(parseEnquiryActiveAgeFilter(' under24Hours')).toBeNull();
    expect(parseEnquiryActiveAgeFilter('UNDER24HOURS')).toBeNull();
    expect(parseEnquiryActiveAgeFilter('eightToThirtyDays')).toBeNull();
    expect(
      parseEnquiryActiveAgeFilter(['under24Hours', 'overSevenDays']),
    ).toBeNull();
  });

  it('reuses the established active-age predicate and boundaries', () => {
    const now = new Date('2026-09-01T12:00:00.000Z');

    expect(getEnquiryActiveAgeWhere(now, 'under24Hours')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: { gte: new Date('2026-08-31T12:00:00.000Z') },
    });
    expect(getEnquiryActiveAgeWhere(now, 'oneToThreeDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: {
        gte: new Date('2026-08-28T12:00:00.000Z'),
        lt: new Date('2026-08-31T12:00:00.000Z'),
      },
    });
    expect(getEnquiryActiveAgeWhere(now, 'fourToSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: {
        gte: new Date('2026-08-24T12:00:00.000Z'),
        lt: new Date('2026-08-28T12:00:00.000Z'),
      },
    });
    expect(getEnquiryActiveAgeWhere(now, 'overSevenDays')).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      createdAt: { lt: new Date('2026-08-24T12:00:00.000Z') },
    });
    expect(getEnquiryActiveAgeWhere(now, null)).toBeNull();
  });

  it('encodes the active-age query deterministically', () => {
    expect(buildEnquiryActiveAgeQuery('fourToSevenDays')).toBe(
      'activeAge=fourToSevenDays',
    );
  });
});
