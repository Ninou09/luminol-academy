import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_DELIVERY_PREFERENCES,
  normalizeEnquiryDeliveryPreferenceMix,
} from './enquiry-delivery-preference-reporting';

describe('normalizeEnquiryDeliveryPreferenceMix', () => {
  it('keeps structured delivery preferences in deterministic order including explicit not-sure', () => {
    expect(
      normalizeEnquiryDeliveryPreferenceMix(
        [
          { deliveryPreference: 'NOT_SURE', _count: { _all: 2 } },
          { deliveryPreference: 'ONLINE', _count: { _all: 8 } },
          { deliveryPreference: 'IN_PERSON', _count: { _all: 5 } },
          { deliveryPreference: 'FLEXIBLE', _count: { _all: 3 } },
          { deliveryPreference: null, _count: { _all: 4 } },
          { deliveryPreference: 'UNKNOWN', _count: { _all: 9 } },
        ],
        22,
      ),
    ).toEqual({
      total: 22,
      missing: 4,
      items: [
        { deliveryPreference: 'IN_PERSON', count: 5 },
        { deliveryPreference: 'ONLINE', count: 8 },
        { deliveryPreference: 'FLEXIBLE', count: 3 },
        { deliveryPreference: 'NOT_SURE', count: 2 },
      ],
    });
  });

  it('omits zero and invalid counts while preserving missing cohort volume', () => {
    expect(
      normalizeEnquiryDeliveryPreferenceMix(
        [
          { deliveryPreference: 'IN_PERSON', _count: { _all: 0 } },
          { deliveryPreference: 'ONLINE', _count: { _all: -4 } },
          { deliveryPreference: 'FLEXIBLE', _count: { _all: Number.NaN } },
        ],
        7,
      ),
    ).toEqual({ total: 7, missing: 7, items: [] });
  });

  it('safely handles zero and invalid cohort totals', () => {
    expect(normalizeEnquiryDeliveryPreferenceMix([], 0)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
    expect(normalizeEnquiryDeliveryPreferenceMix([], Number.NaN)).toEqual({
      total: 0,
      missing: 0,
      items: [],
    });
  });

  it('documents the supported persisted delivery answers', () => {
    expect(ENQUIRY_DELIVERY_PREFERENCES).toEqual([
      'IN_PERSON',
      'ONLINE',
      'FLEXIBLE',
      'NOT_SURE',
    ]);
  });
});
