import { beforeAll, describe, expect, test } from 'vitest';

import { db } from '@luminol/database';

import { createNotificationEvent } from './server';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const organizationId = `m16e-notification-org-${suffix}`;
const memberId = `m16e-notification-member-${suffix}`;
const outsiderId = `m16e-notification-outsider-${suffix}`;

suite('Milestone 16 verified organization notification integration', () => {
  beforeAll(async () => {
    await db.organization.create({
      data: {
        id: organizationId,
        name: 'Verified Notification Organization',
        seatLimit: 5,
      },
    });
    await db.user.createMany({
      data: [
        {
          id: memberId,
          clerkId: `m16e-notification-member-clerk-${suffix}`,
          email: `m16e-member-${suffix}@example.test`,
        },
        {
          id: outsiderId,
          clerkId: `m16e-notification-outsider-clerk-${suffix}`,
          email: `m16e-outsider-${suffix}@example.test`,
        },
      ],
    });
    await db.organizationMembership.create({
      data: {
        organizationId,
        userId: memberId,
        role: 'LEARNER',
        active: true,
      },
    });
  });

  test('creates organization-scoped notifications only for verified members', async () => {
    const event = await createNotificationEvent({
      idempotencyKey: `m16e-member-notice-${suffix}`,
      organizationId,
      recipientId: memberId,
      templateKey: 'account_notice',
      category: 'transactional',
      payload: {
        subject: 'Organization learning notice',
        message: 'A verified organization learning notice is available.',
      },
      channels: ['in_app'],
    });

    expect(event.organizationId).toBe(organizationId);
    expect(event.organizationRecordId).toBe(organizationId);
    expect(event.notifications).toHaveLength(1);
    expect(event.notifications[0]?.organizationRecordId).toBe(organizationId);
  });

  test('rejects cross-organization notification recipients', async () => {
    await expect(
      createNotificationEvent({
        idempotencyKey: `m16e-outsider-notice-${suffix}`,
        organizationId,
        recipientId: outsiderId,
        templateKey: 'account_notice',
        category: 'transactional',
        payload: {
          subject: 'Organization learning notice',
          message: 'This notice must not cross the organization boundary.',
        },
        channels: ['in_app'],
      }),
    ).rejects.toThrow('Active organization recipient membership not found');
  });

  test('rejects arbitrary organization identifiers', async () => {
    await expect(
      createNotificationEvent({
        idempotencyKey: `m16e-opaque-notice-${suffix}`,
        organizationId: `opaque-legacy-${suffix}`,
        recipientId: memberId,
        templateKey: 'account_notice',
        category: 'transactional',
        payload: {
          subject: 'Unverified organization notice',
          message: 'Unverified organization identifiers are rejected.',
        },
        channels: ['in_app'],
      }),
    ).rejects.toThrow('Active verified organization not found');
  });
});
