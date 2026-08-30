import { describe, expect, it } from 'vitest';

import { getEnquiryCampaignMediumCopy } from './enquiry-campaign-medium-localization';

describe('getEnquiryCampaignMediumCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s campaign-medium copy',
    (locale) => {
      const copy = getEnquiryCampaignMediumCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(30);
      expect(copy.recorded.length).toBeGreaterThan(0);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.topMedia.length).toBeGreaterThan(0);
      expect(copy.noMedia.length).toBeGreaterThan(0);
      expect(copy.count('8')).toContain('8');
    },
  );

  it('keeps English framing limited to stored attribution context', () => {
    const copy = getEnquiryCampaignMediumCopy('en');

    expect(copy.intro).toContain('stored attribution context');
    expect(copy.intro).toContain('not ad delivery');
    expect(copy.intro).toContain('lead quality');
  });
});
