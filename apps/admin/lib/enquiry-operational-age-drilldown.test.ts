import { describe, expect, it } from 'vitest';

import { ENQUIRY_ACTIVE_AGE_BUCKETS } from './enquiry-active-age-filter';
import {
  buildEnquiryOperationalAgeQuery,
  ENQUIRY_OPERATIONAL_AGE_ATTENTION_FILTERS,
} from './enquiry-operational-age-drilldown';

describe('buildEnquiryOperationalAgeQuery', () => {
  it('builds canonical attention plus active-age queries for every supported pair', () => {
    for (const attention of ENQUIRY_OPERATIONAL_AGE_ATTENTION_FILTERS) {
      for (const activeAge of ENQUIRY_ACTIVE_AGE_BUCKETS) {
        const query = buildEnquiryOperationalAgeQuery(attention, activeAge);
        const params = new URLSearchParams(query);

        expect([...params.keys()]).toEqual(['attention', 'activeAge']);
        expect(params.get('attention')).toBe(attention);
        expect(params.get('activeAge')).toBe(activeAge);
        expect(params.size).toBe(2);
      }
    }
  });

  it('does not include the closed-without-outcome attention scope', () => {
    expect(ENQUIRY_OPERATIONAL_AGE_ATTENTION_FILTERS).not.toContain(
      'closed-without-outcome',
    );
  });
});
