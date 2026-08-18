import { describe, expect, it } from 'vitest';

import {
  isQuietTime,
  notificationEventSchema,
  retryDelayMs,
  shouldDeliver,
} from './index';

const professionalTemplateKeys = [
  'professional_submission_submitted',
  'professional_submission_resubmitted',
  'professional_review_started',
  'professional_revision_requested',
  'professional_submission_approved',
  'professional_submission_rejected',
] as const;

describe('notification policy', () => {
  it('never suppresses mandatory transactional messages', () =>
    expect(shouldDeliver('transactional', false)).toBe(true));
  it('honours marketing opt-out', () =>
    expect(shouldDeliver('marketing', false)).toBe(false));
  it('handles overnight quiet time in the configured timezone', () =>
    expect(
      isQuietTime(new Date('2026-08-02T22:30:00Z'), 'UTC', 22 * 60, 7 * 60),
    ).toBe(true));
  it('bounds retries and terminates', () => {
    expect(retryDelayMs(1)).toBe(30_000);
    expect(retryDelayMs(5)).toBeNull();
  });

  it.each(professionalTemplateKeys)(
    'accepts the professional transition template %s',
    (templateKey) => {
      expect(
        notificationEventSchema.safeParse({
          idempotencyKey: `professional-${templateKey}`,
          recipientId: 'learner-1',
          templateKey,
          category: 'transactional',
          payload: {
            subject: 'Professional project update',
            message: 'A privacy-safe professional project update is available.',
          },
          channels: ['in_app'],
        }).success,
      ).toBe(true);
    },
  );
});
