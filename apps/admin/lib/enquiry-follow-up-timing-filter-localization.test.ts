import { describe, expect, it } from 'vitest';

import { ENQUIRY_FOLLOW_UP_TIMING_BUCKETS } from './enquiry-follow-up-timing-filter';
import { getEnquiryFollowUpTimingFilterCopy } from './enquiry-follow-up-timing-filter-localization';

describe('getEnquiryFollowUpTimingFilterCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s follow-up timing copy',
    (locale) => {
      const copy = getEnquiryFollowUpTimingFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(40);
      expect(copy.clear.length).toBeGreaterThan(0);
      for (const bucket of ENQUIRY_FOLLOW_UP_TIMING_BUCKETS) {
        expect(copy.label(bucket).length).toBeGreaterThan(0);
      }
    },
  );

  it('frames past due and missing plans as workflow context rather than scoring', () => {
    const copy = getEnquiryFollowUpTimingFilterCopy('en');

    expect(copy.intro).toContain('workflow timing');
    expect(copy.intro).toContain('not inferred urgency');
    expect(copy.intro).toContain('operational incompleteness');
    expect(copy.intro).toContain('not low intent');
  });
});
