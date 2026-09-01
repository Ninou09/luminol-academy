import { describe, expect, it } from 'vitest';

import { getContentCalendarCopy } from './content-calendar-localization';

describe('content calendar localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete bounded calendar copy for %s',
    (locale) => {
      const copy = getContentCalendarCopy(locale);

      expect(copy.title).toBeTruthy();
      expect(copy.noExternalPublish).toBeTruthy();
      expect(copy.statusLabel).toEqual(
        expect.objectContaining({
          DRAFT: expect.any(String),
          READY: expect.any(String),
          SCHEDULED: expect.any(String),
          ARCHIVED: expect.any(String),
        }),
      );
      expect(copy.formatLabel.REEL).toBeTruthy();
      expect(copy.platformName.INSTAGRAM).toBeTruthy();
      expect(copy.platformName.FACEBOOK).toBeTruthy();
    },
  );

  it('states the external publishing boundary in English', () => {
    expect(getContentCalendarCopy('en').noExternalPublish).toContain(
      'does not publish externally',
    );
  });
});
