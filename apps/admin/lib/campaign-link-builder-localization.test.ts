import { describe, expect, it } from 'vitest';

import { getCampaignLinkBuilderCopy } from './campaign-link-builder-localization';

describe('campaign link builder localization', () => {
  it('provides complete EN, FR and AR copy', () => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      const copy = getCampaignLinkBuilderCopy(locale);

      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(0);
      expect(copy.pathname.length).toBeGreaterThan(0);
      expect(copy.source.length).toBeGreaterThan(0);
      expect(copy.medium.length).toBeGreaterThan(0);
      expect(copy.campaign.length).toBeGreaterThan(0);
      expect(copy.content.length).toBeGreaterThan(0);
      expect(copy.build.length).toBeGreaterThan(0);
      expect(copy.result.length).toBeGreaterThan(0);
      expect(copy.boundary.length).toBeGreaterThan(0);
    }
  });

  it('localizes every validation code', () => {
    const errors = [
      'path-required',
      'path-too-long',
      'path-unsafe',
      'source-required',
      'source-too-long',
      'medium-too-long',
      'campaign-too-long',
      'content-too-long',
    ] as const;

    for (const locale of ['en', 'fr', 'ar'] as const) {
      const copy = getCampaignLinkBuilderCopy(locale);
      for (const error of errors) {
        expect(copy.error(error).length).toBeGreaterThan(0);
      }
    }
  });

  it('states that the builder does not establish conversions', () => {
    expect(getCampaignLinkBuilderCopy('en').boundary).toContain(
      'does not track clicks',
    );
    expect(getCampaignLinkBuilderCopy('en').boundary).toContain(
      'prove conversions',
    );
  });
});
