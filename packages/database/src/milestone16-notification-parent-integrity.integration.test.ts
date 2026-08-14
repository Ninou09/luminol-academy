import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const organizationId = `m16e-parent-org-${suffix}`;
const firstUserId = `m16e-parent-user-a-${suffix}`;
const secondUserId = `m16e-parent-user-b-${suffix}`;

suite('Milestone 16 notification parent identity constraints', () => {
  beforeAll(async () => {
    await db.organization.create({
      data: {
        id: organizationId,
        name: 'Notification Parent Integrity Organization',
        seatLimit: 4,
      },
    });

    await db.user.createMany({
      data: [
        {
          id: firstUserId,
          clerkId: `m16e-parent-clerk-a-${suffix}`,
          email: `m16e-parent-a-${suffix}@example.test`,
        },
        {
          id: secondUserId,
          clerkId: `m16e-parent-clerk-b-${suffix}`,
          email: `m16e-parent-b-${suffix}@example.test`,
        },
      ],
    });

    await db.organizationMembership.createMany({
      data: [
        {
          organizationId,
          userId: firstUserId,
          role: 'LEARNER',
          active: true,
        },
        {
          organizationId,
          userId: secondUserId,
          role: 'LEARNER',
          active: true,
        },
      ],
    });
  });

  test(
    'allows a verified event recipient change before any child notification exists',
    async () => {
      const event = await db.notificationEvent.create({
        data: {
          idempotencyKey: `m16e-parent-empty-event-${suffix}`,
          organizationId,
          organizationRecordId: organizationId,
          recipientId: firstUserId,
          templateKey: 'account_notice',
          category: 'TRANSACTIONAL',
          payload: {
            subject: 'Recipient can still change',
            message: 'No notification has been materialized yet.',
          },
        },
        select: { id: true },
      });

      const updated = await db.notificationEvent.update({
        where: { id: event.id },
        data: { recipientId: secondUserId },
        select: { recipientId: true },
      });

      expect(updated.recipientId).toBe(secondUserId);
    },
  );

  test(
    'rejects changing a verified event recipient after a child notification exists',
    async () => {
      const event = await db.notificationEvent.create({
        data: {
          idempotencyKey: `m16e-parent-child-event-${suffix}`,
          organizationId,
          organizationRecordId: organizationId,
          recipientId: firstUserId,
          templateKey: 'account_notice',
          category: 'TRANSACTIONAL',
          payload: {
            subject: 'Recipient becomes fixed',
            message: 'A child notification will preserve this recipient identity.',
          },
        },
        select: { id: true },
      });

      await db.notification.create({
        data: {
          eventId: event.id,
          recipientId: firstUserId,
          organizationId,
          organizationRecordId: organizationId,
          channel: 'IN_APP',
          title: 'Recipient becomes fixed',
          preview: 'The child must remain aligned with its parent event.',
          body: 'The child must remain aligned with its parent event.',
        },
      });

      await expect(
        db.notificationEvent.update({
          where: { id: event.id },
          data: { recipientId: secondUserId },
        }),
      ).rejects.toThrow(
        'Notification event recipient is immutable once notifications exist',
      );
    },
  );
});
