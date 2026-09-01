import { describe, expect, it } from 'vitest';

import { enquiryStatuses } from './operations';
import { buildEnquiryStatusQuery } from './enquiry-status-filter';

describe('buildEnquiryStatusQuery', () => {
  it.each(enquiryStatuses)('builds a canonical %s status query', (status) => {
    const params = new URLSearchParams(buildEnquiryStatusQuery(status));

    expect([...params.keys()]).toEqual(['status']);
    expect(params.get('status')).toBe(status);
    expect(params.size).toBe(1);
  });
});
