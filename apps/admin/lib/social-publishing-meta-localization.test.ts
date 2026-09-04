import { describe, expect, it } from 'vitest';

import { getSocialPublishingMetaCopy } from './social-publishing-meta-localization';

describe('social publishing Meta localization', () => {
  it('keeps provider controls explicit in English, French and Arabic', () => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      const copy = getSocialPublishingMetaCopy(locale);
      expect(copy.providerHeading.trim()).not.toBe('');
      expect(copy.providerReady.trim()).not.toBe('');
      expect(copy.providerOff.trim()).not.toBe('');
      expect(copy.providerMisconfigured.trim()).not.toBe('');
      expect(copy.credentialsBoundary.trim()).not.toBe('');
      expect(copy.execute.trim()).not.toBe('');
      expect(copy.executeHelp.trim()).not.toBe('');
      expect(copy.instagramOnly.trim()).not.toBe('');
    }
  });
});
