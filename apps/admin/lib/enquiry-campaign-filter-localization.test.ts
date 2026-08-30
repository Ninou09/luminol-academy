import { describe, expect, it } from 'vitest';

import { getEnquiryCampaignFilterCopy } from './enquiry-campaign-filter-localization';

describe('enquiry campaign filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides campaign filtering context for %s',
    (locale) => {
      const copy = getEnquiryCampaignFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.source.length).toBeGreaterThan(0);
      expect(copy.campaign.length).toBeGreaterThan(0);
      expect(copy.medium.length).toBeGreaterThan(0);
      expect(copy.clear.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
    },
  );

  it('keeps the English copy explicitly operational rather than evaluative', () => {
    const copy = getEnquiryCampaignFilterCopy('en');

    expect(copy.intro).toContain('persisted UTM values');
    expect(copy.intro).toContain('does not measure conversion');
    expect(copy.intro).toContain('traffic volume');
    expect(copy.intro).toContain('lead quality');
  });
});
