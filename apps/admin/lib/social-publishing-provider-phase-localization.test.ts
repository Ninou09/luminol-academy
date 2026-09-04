import { describe, expect, test } from 'vitest';

import { getSocialPublishingProviderPhaseCopy } from './social-publishing-provider-phase-localization';

describe('social publishing provider phase localization', () => {
  test.each(['en', 'fr', 'ar'] as const)(
    'provides complete provider checkpoint copy for %s',
    (locale) => {
      const copy = getSocialPublishingProviderPhaseCopy(locale);

      expect(copy.providerPhase.length).toBeGreaterThan(0);
      expect(copy.providerCheckpoint.length).toBeGreaterThan(0);
      expect(copy.phaseName.NOT_STARTED.length).toBeGreaterThan(0);
      expect(copy.phaseName.SESSION_READY.length).toBeGreaterThan(0);
      expect(copy.phaseName.PUBLISHED.length).toBeGreaterThan(0);
    },
  );
});
