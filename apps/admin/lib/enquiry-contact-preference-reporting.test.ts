import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_CONTACT_PREFERENCES,
  normalizeEnquiryContactPreferenceMix,
} from './enquiry-contact-preference-reporting';

describe('normalizeEnquiryContactPreferenceMix', () => {
  it('keeps only structured contact preferences in deterministic channel order', () => {
    expect(
      normalizeEnquiryContactPreferenceMix(
        [
          { preferredContact: 'WHATSAPP', _count: { _all: 7 } },
          { preferredContact: 'EMAIL', _count: { _all: 4 } },
          { preferredContact: 'PHONE', _count: { _all: 5 } },
          { preferredContact: null, _count: { _all: 3 } },
          { preferredContact: 'UNKNOWN', _count: { _all: 9 } },
        ],
        19,
      ),
    ).toEqual({
      total: 19,
      missing: 3,
      items: [
        { preferredContact: 'EMAIL', count: 4 },
        { preferredContact: 'PHONE', count: 5 },
        { preferredContact: 'WHATSAPP', count: 7 },
      ],
    });
  });

  it('omits zero and invalid counts while preserving the cohort total', () => {
    expect(
      normalizeEnquiryContactPreferenceMix(
        [
          { preferredContact: 'EMAIL', _count: { _all: 0 } },
          { preferredContact: 'PHONE', _count: { _all: -2 } },
          { preferredContact: 'WHATSAPP', _count: { _all: Number.NaN } },
        ],
        6,
      ),
    ).toEqual({ total: 6, missing: 6, items: [] });
  });

  it('safely handles zero, invalid and over-counted cohorts', () => {
    expect(normalizeEnquiryContactPreferenceMix([], 0)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryContactPreferenceMix([], Number.NaN)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
    expect(
      normalizeEnquiryContactPreferenceMix(
        [{ preferredContact: 'EMAIL', _count: { _all: 8 } }],
        3,
      ),
    ).toEqual({
      total: 3,
      missing: 0,
      items: [{ preferredContact: 'EMAIL', count: 8 }],
    });
  });

  it('documents the supported persisted contact methods', () => {
    expect(ENQUIRY_CONTACT_PREFERENCES).toEqual([
      'EMAIL',
      'PHONE',
      'WHATSAPP',
    ]);
  });
});
