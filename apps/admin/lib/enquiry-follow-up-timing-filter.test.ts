import { describe, expect, it } from 'vitest';

import {
  buildEnquiryFollowUpTimingQuery,
  ENQUIRY_FOLLOW_UP_TIMING_BUCKETS,
  getEnquiryFollowUpTimingWhere,
  parseEnquiryFollowUpTimingFilter,
} from './enquiry-follow-up-timing-filter';
import { getActiveEnquiryFollowUpTimingWhere } from './enquiry-follow-up-timing-reporting';

describe('enquiry follow-up timing filter', () => {
  it.each(ENQUIRY_FOLLOW_UP_TIMING_BUCKETS)(
    'parses supported %s timing bucket',
    (bucket) => {
      expect(parseEnquiryFollowUpTimingFilter(bucket)).toBe(bucket);
    },
  );

  it('rejects arrays, empty values and unsupported tokens', () => {
    expect(parseEnquiryFollowUpTimingFilter(undefined)).toBeNull();
    expect(parseEnquiryFollowUpTimingFilter('')).toBeNull();
    expect(parseEnquiryFollowUpTimingFilter(['pastDue'])).toBeNull();
    expect(parseEnquiryFollowUpTimingFilter('due-today')).toBeNull();
    expect(parseEnquiryFollowUpTimingFilter('PAST_DUE')).toBeNull();
  });

  it.each(ENQUIRY_FOLLOW_UP_TIMING_BUCKETS)(
    'reuses the established reporting predicate for %s',
    (bucket) => {
      const now = new Date('2026-09-01T00:00:00.000Z');
      expect(getEnquiryFollowUpTimingWhere(now, bucket)).toEqual(
        getActiveEnquiryFollowUpTimingWhere(now, bucket),
      );
    },
  );

  it('returns no predicate without an active bucket', () => {
    expect(
      getEnquiryFollowUpTimingWhere(new Date('2026-09-01T00:00:00.000Z'), null),
    ).toBeNull();
  });

  it.each(ENQUIRY_FOLLOW_UP_TIMING_BUCKETS)(
    'builds a canonical %s query',
    (bucket) => {
      const params = new URLSearchParams(
        buildEnquiryFollowUpTimingQuery(bucket),
      );
      expect([...params.keys()]).toEqual(['followUpTiming']);
      expect(params.get('followUpTiming')).toBe(bucket);
      expect(params.size).toBe(1);
    },
  );
});
