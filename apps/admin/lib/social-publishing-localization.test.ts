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
      expect(copy.contentRevision).toBeTruthy();
      expect(copy.schedule).toBeTruthy();
      expect(copy.notScheduled).toBeTruthy();
      expect(copy.platformName.INSTAGRAM).toBeTruthy();
      expect(copy.platformName.FACEBOOK).toBeTruthy();
      expect(copy.eventType.ACTIVATION_CHANGED).toBeTruthy();
      expect(copy.deliveryError.revisionMismatch).toBeTruthy();
      expect(copy.deliveryError.accountInactive).toBeTruthy();
      expect(copy.noCredentials).toBeTruthy();
      expect(copy.attemptLedger).toBeTruthy();
      expect(copy.planAttempt).toBeTruthy();
      expect(copy.planAttemptHelp).toBeTruthy();
      expect(copy.attemptStatus.PLANNED).toBeTruthy();
      expect(copy.attemptStatus.RETRY_SCHEDULED).toBeTruthy();
      expect(copy.attemptStatus.DEAD_LETTER).toBeTruthy();
      expect(copy.attemptEventType.PROVIDER_FAILED).toBeTruthy();
      expect(copy.attemptEventType.INVALIDATED).toBeTruthy();
    },
  );

  test('keeps the external-publishing boundary explicit in English', () => {
    const copy = getSocialPublishingCopy('en');

    expect(copy.noCredentials).toContain('No Meta credentials');
    expect(copy.noCredentials).toContain('publishing remains disabled');
    expect(copy.planAttemptHelp).toContain('does not publish');
    expect(copy.attemptLedgerIntro).toContain('never stores captions');
  });

  test('does not fall back to English blockers or attempt controls in French or Arabic', () => {
    const english = getSocialPublishingCopy('en');
    const french = getSocialPublishingCopy('fr');
    const arabic = getSocialPublishingCopy('ar');

    expect(french.deliveryError.notReady).not.toBe(
      english.deliveryError.notReady,
    );
    expect(arabic.deliveryError.notReady).not.toBe(
      english.deliveryError.notReady,
    );
    expect(french.notScheduled).not.toBe(english.notScheduled);
    expect(arabic.notScheduled).not.toBe(english.notScheduled);
    expect(french.attemptLedger).not.toBe(english.attemptLedger);
    expect(arabic.attemptLedger).not.toBe(english.attemptLedger);
    expect(french.attemptStatus.DEAD_LETTER).not.toBe(
      english.attemptStatus.DEAD_LETTER,
    );
    expect(arabic.attemptStatus.DEAD_LETTER).not.toBe(
      english.attemptStatus.DEAD_LETTER,
    );
  });
});
