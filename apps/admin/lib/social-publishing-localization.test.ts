import { describe, expect, test } from 'vitest';

import { getSocialPublishingCopy } from './social-publishing-localization';

describe('social publishing localization', () => {
  test.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s delivery review copy',
    (locale) => {
      const copy = getSocialPublishingCopy(locale);

      expect(copy.title).toBeTruthy();
      expect(copy.accountRegistry).toBeTruthy();
      expect(copy.deliveryReview).toBeTruthy();
      expect(copy.platformName.INSTAGRAM).toBeTruthy();
      expect(copy.platformName.FACEBOOK).toBeTruthy();
      expect(copy.noCredentials).toBeTruthy();
    },
  );

  test('keeps the external-publishing boundary explicit in English', () => {
    const copy = getSocialPublishingCopy('en');

    expect(copy.noCredentials).toContain('No Meta credentials');
    expect(copy.noCredentials).toContain('publishing remains disabled');
  });
});
