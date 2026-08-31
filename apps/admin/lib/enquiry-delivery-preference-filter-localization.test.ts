import { describe, expect, it } from 'vitest';

import { getEnquiryDeliveryPreferenceFilterCopy } from './enquiry-delivery-preference-filter-localization';

describe('enquiry delivery-preference filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryDeliveryPreferenceFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.preference.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy structured and non-evaluative', () => {
    const copy = getEnquiryDeliveryPreferenceFilterCopy('en');

    expect(copy.intro).toContain('structured delivery preference recorded');
    expect(copy.intro).toContain('does not indicate lead quality');
    expect(copy.intro).toContain('programme recommendation');
    expect(copy.intro).toContain('clinical need');
  });
});
