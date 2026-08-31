import { describe, expect, it } from 'vitest';

import {
  buildEnquiryQualificationGapQuery,
  ENQUIRY_QUALIFICATION_GAPS,
  getEnquiryQualificationGapWhere,
  parseEnquiryQualificationGapFilter,
} from './enquiry-qualification-gap-filter';

describe('enquiry qualification gap filter', () => {
  it('accepts only the supported persisted-field gap tokens', () => {
    for (const gap of ENQUIRY_QUALIFICATION_GAPS) {
      expect(parseEnquiryQualificationGapFilter(gap)).toBe(gap);
    }
  });

  it('fails closed for missing, blank, repeated, normalized-looking or unsupported values', () => {
    expect(parseEnquiryQualificationGapFilter(undefined)).toBeNull();
    expect(parseEnquiryQualificationGapFilter('')).toBeNull();
    expect(parseEnquiryQualificationGapFilter(' city')).toBeNull();
    expect(parseEnquiryQualificationGapFilter('CITY')).toBeNull();
    expect(parseEnquiryQualificationGapFilter('programme')).toBeNull();
    expect(
      parseEnquiryQualificationGapFilter(['city', 'preferredContact']),
    ).toBeNull();
  });

  it('maps each supported gap to one exact null predicate', () => {
    expect(getEnquiryQualificationGapWhere('city')).toEqual({ city: null });
    expect(getEnquiryQualificationGapWhere('preferredContact')).toEqual({
      preferredContact: null,
    });
    expect(getEnquiryQualificationGapWhere('deliveryPreference')).toEqual({
      deliveryPreference: null,
    });
    expect(getEnquiryQualificationGapWhere('timingPreference')).toEqual({
      timingPreference: null,
    });
    expect(getEnquiryQualificationGapWhere(null)).toBeNull();
  });

  it('encodes the protected qualification-gap query deterministically', () => {
    expect(buildEnquiryQualificationGapQuery('preferredContact')).toBe(
      'qualificationGap=preferredContact',
    );
  });
});
