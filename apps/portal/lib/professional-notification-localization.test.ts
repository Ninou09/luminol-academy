import { describe, expect, it } from 'vitest';

import {
  getProfessionalNotificationCopy,
  getProfessionalNotificationHref,
  PROFESSIONAL_NOTIFICATION_TEMPLATE_KEYS,
} from './professional-notification-localization';

const locales = ['en', 'fr', 'ar'] as const;

describe('professional notification localization', () => {
  it.each(locales)('localizes every professional notification for %s', (locale) => {
    for (const templateKey of PROFESSIONAL_NOTIFICATION_TEMPLATE_KEYS) {
      const copy = getProfessionalNotificationCopy(locale, templateKey);

      expect(copy?.title.trim()).not.toBe('');
      expect(copy?.message.trim()).not.toBe('');
      expect(copy?.action.trim()).not.toBe('');
    }
  });

  it('routes reviewer notices to reviews and learner notices to projects', () => {
    expect(
      getProfessionalNotificationHref('professional_submission_submitted'),
    ).toBe('/reviews');
    expect(getProfessionalNotificationHref('professional_review_started')).toBe(
      '/projects',
    );
    expect(getProfessionalNotificationHref('account_notice')).toBeNull();
  });

  it('does not reinterpret unrelated notification templates', () => {
    expect(getProfessionalNotificationCopy('en', 'account_notice')).toBeNull();
  });
});
