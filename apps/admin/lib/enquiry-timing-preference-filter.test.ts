import { describe, expect, it } from 'vitest';

import {
  buildEnquiryTimingPreferenceQuery,
  getEnquiryTimingPreferenceWhere,
  parseEnquiryTimingPreferenceFilter,
} from './enquiry-timing-preference-filter';

describe('enquiry timing-preference filter', () => {
  it.each(['SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE'] as const)(
    'accepts %s',
    (value) => expect(parseEnquiryTimingPreferenceFilter(value)).toBe(value),
  );

  it('fails closed for repeated values', () => {
    expect(parseEnquiryTimingPreferenceFilter(['SOON', 'LATER'])).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter(['NOT_SURE'])).toBeNull();
  });

  it('fails closed for invalid values', () => {
    expect(parseEnquiryTimingPreferenceFilter(undefined)).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('')).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('soon')).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('IMMEDIATE')).toBeNull();
  });

  it('builds an exact Prisma predicate', () => {
    expect(getEnquiryTimingPreferenceWhere('WITHIN_MONTH')).toEqual({
      timingPreference: 'WITHIN_MONTH',
    });
    expect(getEnquiryTimingPreferenceWhere(null)).toBeNull();
  });

  it('builds the deterministic query', () => {
    expect(buildEnquiryTimingPreferenceQuery('NOT_SURE')).toBe(
      'timingPreference=NOT_SURE',
    );
  });
});
