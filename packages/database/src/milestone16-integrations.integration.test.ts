import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const organizationId = `m16e-db-org-${suffix}`;
const userId = `m16e-db-user-${suffix}`;

suite('Milestone 16 verified organization integration constraints', () => {
  beforeAll(async () => {
    await db.organization.create({
      data: {
        id: organizationId,
        name: 'Verified Integration Organization',
        seatLimit: 5,
      },
    });
    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-db-clerk-${suffix}`,
        email: `m16e-db-${suffix}@example.test`,
      },
    });
    await db.organizationMembership.create({
      data: {
        organizationId,
        userId,
        role: 'OWNER',
        active: true,
      },
    });
  });

  test('rejects new organization-scoped invoices without a verified relation', async () => {
    await expect(
      db.invoice.create({
        data: {
          number: `M16E-DB-UNVERIFIED-${suffix}`,
          customerId: userId,
          organizationId,
          currency: 'DZD',
          subtotalMinor: 100,
          taxMinor: 0,
          totalMinor: 100,
        },
      }),
    ).rejects.toThrow(
      'New organization-scoped records require a verified organization',
    );
  });

  test('rejects mismatched verified organization identities', async () => {
    const otherOrganization = await db.organization.create({
      data: {
        id: `m16e-db-other-org-${suffix}`,
        name: 'Other Integration Organization',
        seatLimit: 5,
      },
      select: { id: true },
    });

    await expect(
      db.invoice.create({
        data: {
          number: `M16E-DB-MISMATCH-${suffix}`,
          customerId: userId,
          organizationId,
          organizationRecordId: otherOrganization.id,
          currency: 'DZD',
          subtotalMinor: 100,
          taxMinor: 0,
          totalMinor: 100,
        },
      }),
    ).rejects.toThrow(
      'Organization identity does not match verified organization',
    );
  });

  test('keeps corporate billing on the same verified organization as its invoice', async () => {
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-DB-VERIFIED-${suffix}`,
        customerId: userId,
        organizationId,
        organizationRecordId: organizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true },
    });
    const otherOrganization = await db.organization.create({
      data: {
        id: `m16e-db-corporate-other-${suffix}`,
        name: 'Other Corporate Organization',
        seatLimit: 5,
      },
      select: { id: true },
    });

    await expect(
      db.corporateBillingRecord.create({
        data: {
          organizationId: otherOrganization.id,
          organizationRecordId: otherOrganization.id,
          invoiceId: invoice.id,
          billingContactName: 'Billing Contact',
          billingContactEmail: `billing-${suffix}@example.test`,
          seatCount: 1,
          pricePerSeatMinor: 100,
          paymentTermsDays: 30,
        },
      }),
    ).rejects.toThrow(
      'Corporate billing organization must match invoice organization',
    );
  });

  test('requires verified organization linkage for new organization notifications', async () => {
    await expect(
      db.notificationEvent.create({
        data: {
          idempotencyKey: `m16e-db-event-unverified-${suffix}`,
          organizationId,
          recipientId: userId,
          templateKey: 'account_notice',
          category: 'TRANSACTIONAL',
          payload: {
            subject: 'Unverified event',
            message: 'Should fail before persistence.',
          },
        },
      }),
    ).rejects.toThrow(
      'New organization-scoped records require a verified organization',
    );
  });

  test('rejects verified organization events for recipients without membership', async () => {
    const outsiderId = `m16e-db-event-outsider-${suffix}`;
    await db.user.create({
      data: {
        id: outsiderId,
        clerkId: `m16e-db-event-outsider-clerk-${suffix}`,
        email: `m16e-db-event-outsider-${suffix}@example.test`,
      },
    });

    await expect(
      db.notificationEvent.create({
        data: {
          idempotencyKey: `m16e-db-event-outsider-${suffix}`,
          organizationId,
          organizationRecordId: organizationId,
          recipientId: outsiderId,
          templateKey: 'account_notice',
          category: 'TRANSACTIONAL',
          payload: {
            subject: 'Invalid recipient event',
            message: 'The recipient has no active organization membership.',
          },
        },
      }),
    ).rejects.toThrow(
      'Verified notification event requires an active organization recipient',
    );
  });

  test('rejects unscoped notifications beneath verified organization events', async () => {
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-scoped-${suffix}`,
        organizationId,
        organizationRecordId: organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Scoped event',
          message: 'The child notification must keep organization scope.',
        },
      },
      select: { id: true },
    });

    await expect(
      db.notification.create({
        data: {
          eventId: event.id,
          recipientId: userId,
          channel: 'IN_APP',
          title: 'Scoped event',
          preview: 'Organization scope is required.',
          body: 'Organization scope is required.',
        },
      }),
    ).rejects.toThrow(
      'Notification organization must match notification event organization',
    );
  });

  test('rejects a different recipient beneath a verified notification event', async () => {
    const outsiderId = `m16e-db-outsider-${suffix}`;
    await db.user.create({
      data: {
        id: outsiderId,
        clerkId: `m16e-db-outsider-clerk-${suffix}`,
        email: `m16e-db-outsider-${suffix}@example.test`,
      },
    });
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-recipient-${suffix}`,
        organizationId,
        organizationRecordId: organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Recipient event',
          message: 'The child notification must keep the event recipient.',
        },
      },
      select: { id: true },
    });

    await expect(
      db.notification.create({
        data: {
          eventId: event.id,
          recipientId: outsiderId,
          organizationId,
          organizationRecordId: organizationId,
          channel: 'IN_APP',
          title: 'Recipient event',
          preview: 'Recipient identity is required.',
          body: 'Recipient identity is required.',
        },
      }),
    ).rejects.toThrow(
      'Notification recipient must match notification event recipient',
    );
  });

  test('rejects new verified notifications after recipient membership ends', async () => {
    const revokedOrganizationId = `m16e-db-revoked-org-${suffix}`;
    const revokedUserId = `m16e-db-revoked-user-${suffix}`;
    await db.organization.create({
      data: {
        id: revokedOrganizationId,
        name: 'Revoked Notification Organization',
        seatLimit: 2,
      },
    });
    await db.user.create({
      data: {
        id: revokedUserId,
        clerkId: `m16e-db-revoked-clerk-${suffix}`,
        email: `m16e-db-revoked-${suffix}@example.test`,
      },
    });
    const membership = await db.organizationMembership.create({
      data: {
        organizationId: revokedOrganizationId,
        userId: revokedUserId,
        role: 'LEARNER',
        active: true,
      },
      select: { id: true },
    });
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-revoked-event-${suffix}`,
        organizationId: revokedOrganizationId,
        organizationRecordId: revokedOrganizationId,
        recipientId: revokedUserId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Membership ending',
          message: 'This event was valid while membership was active.',
        },
      },
      select: { id: true },
    });

    await db.organizationMembership.update({
      where: { id: membership.id },
      data: { active: false, endedAt: new Date() },
    });

    await expect(
      db.notification.create({
        data: {
          eventId: event.id,
          recipientId: revokedUserId,
          organizationId: revokedOrganizationId,
          organizationRecordId: revokedOrganizationId,
          channel: 'IN_APP',
          title: 'Membership ended',
          preview: 'Delivery is no longer allowed.',
          body: 'Delivery is no longer allowed.',
        },
      }),
    ).rejects.toThrow(
      'Verified notification requires an active organization recipient',
    );
  });
});
