import { describe, expect, it } from 'vitest';

import { getEnquiryCampaignContentCopy } from './enquiry-campaign-content-localization';

describe('getEnquiryCampaignContentCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s campaign-content copy',
    (locale) => {
      const copy = getEnquiryCampaignContentCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(30);
      expect(copy.recorded.length).toBeGreaterThan(0);
      expect(copy.missing.length).toBeGreaterThan(0);
      expect(copy.topContent.length).toBeGreaterThan(0);
      expect(copy.noContent.length).toBeGreaterThan(0);
      expect(copy.count('8')).toContain('8');
    },
  );

  it('keeps English framing limited to stored attribution context', () => {
    const copy = getEnquiryCampaignContentCopy('en');

    expect(copy.intro).toContain('stored attribution context');
    expect(copy.intro).toContain('not creative performance');
    expect(copy.intro).toContain('lead quality');
  });
});
