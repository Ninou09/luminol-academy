import { describe, expect, it } from 'vitest';

import {
  getEnquiryOwnerWhere,
  parseEnquiryOwnerFilter,
} from './enquiry-owner-filter';

describe('enquiry owner filter', () => {
  it('accepts only the stable mine token and fails closed for identifiers', () => {
    expect(parseEnquiryOwnerFilter('mine')).toBe('mine');
    expect(parseEnquiryOwnerFilter(['mine', 'ignored'])).toBe('mine');
    expect(parseEnquiryOwnerFilter('user_123')).toBeNull();
    expect(parseEnquiryOwnerFilter('admin@example.com')).toBeNull();
    expect(parseEnquiryOwnerFilter(undefined)).toBeNull();
  });

  it('resolves mine to the authenticated administrator ID only on the server', () => {
    expect(getEnquiryOwnerWhere('mine', 'administrator_123')).toEqual({
      ownerUserId: 'administrator_123',
    });
    expect(getEnquiryOwnerWhere(null, 'administrator_123')).toBeNull();
  });
});
