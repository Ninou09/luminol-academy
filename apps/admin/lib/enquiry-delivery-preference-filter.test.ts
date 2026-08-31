import { describe, expect, it } from 'vitest';

import {
  buildEnquiryDeliveryPreferenceQuery,
  getEnquiryDeliveryPreferenceWhere,
  parseEnquiryDeliveryPreferenceFilter,
} from './enquiry-delivery-preference-filter';

describe('enquiry delivery-preference filter', () => {
  it.each(['IN_PERSON', 'ONLINE', 'FLEXIBLE', 'NOT_SURE'] as const)(
    'accepts %s',
    (value) => expect(parseEnquiryDeliveryPreferenceFilter(value)).toBe(value),
  );

  it('fails closed for repeated values', () => {
    expect(
      parseEnquiryDeliveryPreferenceFilter(['IN_PERSON', 'ONLINE']),
    ).toBeNull();
    expect(parseEnquiryDeliveryPreferenceFilter(['FLEXIBLE'])).toBeNull();
  });

  it('fails closed for invalid values', () => {
    expect(parseEnquiryDeliveryPreferenceFilter(undefined)).toBeNull();
    expect(parseEnquiryDeliveryPreferenceFilter('')).toBeNull();
    expect(parseEnquiryDeliveryPreferenceFilter('online')).toBeNull();
    expect(parseEnquiryDeliveryPreferenceFilter('HYBRID')).toBeNull();
  });

  it('builds an exact Prisma predicate', () => {
    expect(getEnquiryDeliveryPreferenceWhere('ONLINE')).toEqual({
      deliveryPreference: 'ONLINE',
    });
    expect(getEnquiryDeliveryPreferenceWhere(null)).toBeNull();
  });

  it('builds the deterministic query', () => {
    expect(buildEnquiryDeliveryPreferenceQuery('IN_PERSON')).toBe(
      'deliveryPreference=IN_PERSON',
    );
  });
});
