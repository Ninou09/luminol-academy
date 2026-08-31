import { describe, expect, it } from 'vitest';

import {
  buildEnquiryContactPreferenceQuery,
  getEnquiryContactPreferenceWhere,
  parseEnquiryContactPreferenceFilter,
} from './enquiry-contact-preference-filter';

describe('enquiry contact-preference filter', () => {
  it.each(['EMAIL', 'PHONE', 'WHATSAPP'] as const)('accepts %s', (value) =>
    expect(parseEnquiryContactPreferenceFilter(value)).toBe(value),
  );

  it('fails closed for repeated values', () => {
    expect(parseEnquiryContactPreferenceFilter(['EMAIL', 'PHONE'])).toBeNull();
    expect(parseEnquiryContactPreferenceFilter(['WHATSAPP'])).toBeNull();
  });

  it('fails closed for invalid values', () => {
    expect(parseEnquiryContactPreferenceFilter(undefined)).toBeNull();
    expect(parseEnquiryContactPreferenceFilter('')).toBeNull();
    expect(parseEnquiryContactPreferenceFilter('email')).toBeNull();
    expect(parseEnquiryContactPreferenceFilter('SMS')).toBeNull();
  });

  it('builds an exact Prisma predicate', () => {
    expect(getEnquiryContactPreferenceWhere('EMAIL')).toEqual({
      preferredContact: 'EMAIL',
    });
    expect(getEnquiryContactPreferenceWhere(null)).toBeNull();
  });

  it('builds the deterministic query', () => {
    expect(buildEnquiryContactPreferenceQuery('PHONE')).toBe(
      'preferredContact=PHONE',
    );
  });
});
