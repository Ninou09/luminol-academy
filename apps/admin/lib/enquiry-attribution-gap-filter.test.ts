import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_ATTRIBUTION_GAPS,
  buildEnquiryAttributionGapQuery,
  getEnquiryAttributionGapWhere,
  parseEnquiryAttributionGapFilter,
} from './enquiry-attribution-gap-filter';

describe('enquiry attribution gap filter', () => {
  it('accepts only the supported persisted attribution fields', () => {
    for (const field of ENQUIRY_ATTRIBUTION_GAPS) {
      expect(parseEnquiryAttributionGapFilter(field)).toBe(field);
    }

    expect(parseEnquiryAttributionGapFilter(undefined)).toBeNull();
    expect(parseEnquiryAttributionGapFilter('')).toBeNull();
    expect(parseEnquiryAttributionGapFilter(' utmSource')).toBeNull();
    expect(parseEnquiryAttributionGapFilter('UTMSOURCE')).toBeNull();
    expect(parseEnquiryAttributionGapFilter('message')).toBeNull();
    expect(parseEnquiryAttributionGapFilter(['utmSource'])).toBeNull();
  });

  it.each([
    ['utmSource', { utmSource: null }],
    ['utmMedium', { utmMedium: null }],
    ['utmCampaign', { utmCampaign: null }],
    ['utmContent', { utmContent: null }],
    ['landingPath', { landingPath: null }],
  ] as const)(
    'maps %s to its exact persisted-null predicate',
    (field, where) => {
      expect(getEnquiryAttributionGapWhere(field)).toEqual(where);
    },
  );

  it('returns no predicate without a valid gap', () => {
    expect(getEnquiryAttributionGapWhere(null)).toBeNull();
  });

  it('builds one deterministic closed-set query value', () => {
    expect(buildEnquiryAttributionGapQuery('utmSource')).toBe(
      'attributionGap=utmSource',
    );
    expect(buildEnquiryAttributionGapQuery('landingPath')).toBe(
      'attributionGap=landingPath',
    );
  });
});
