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

  test('derives verified organization linkage for legacy invoice writers', async () => {
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-DB-LEGACY-${suffix}`,
        customerId: userId,
        organizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { organizationRecordId: true },
    });

    expect(invoice.organizationRecordId).toBe(organizationId);
  });

  test('preserves opaque legacy invoice organization identifiers as unverified', async () => {
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-DB-OPAQUE-${suffix}`,
        customerId: userId,
        organizationId: `legacy-opaque-org-${suffix}`,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { organizationRecordId: true },
    });

    expect(invoice.organizationRecordId).toBeNull();
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

  test('derives verified organization linkage for legacy corporate billing writers', async () => {
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-DB-LEGACY-BILLING-${suffix}`,
        customerId: userId,
        organizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true },
    });

    const billing = await db.corporateBillingRecord.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        billingContactName: 'Legacy Billing Contact',
        billingContactEmail: `legacy-billing-${suffix}@example.test`,
        seatCount: 1,
        pricePerSeatMinor: 100,
        paymentTermsDays: 30,
      },
      select: { organizationRecordId: true },
    });

    expect(billing.organizationRecordId).toBe(organizationId);
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

  test('derives verified organization linkage for legacy notification event writers', async () => {
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-legacy-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Legacy event',
          message: 'The verified relation should be derived safely.',
        },
      },
      select: { organizationRecordId: true },
    });

    expect(event.organizationRecordId).toBe(organizationId);
  });

  test('preserves unmatched opaque legacy notification writers during expansion', async () => {
    const opaqueOrganizationId = `legacy-notification-org-${suffix}`;
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-opaque-${suffix}`,
        organizationId: opaqueOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque legacy event',
          message: 'The opaque legacy identity remains unverified.',
        },
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(event.organizationRecordId).toBeNull();

    const notification = await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId: opaqueOrganizationId,
        channel: 'IN_APP',
        title: 'Opaque legacy event',
        preview: 'The opaque legacy identity remains unverified.',
        body: 'The opaque legacy identity remains unverified.',
      },
      select: { organizationRecordId: true },
    });

    expect(notification.organizationRecordId).toBeNull();
  });

  test('rejects opaque notification children with a different organization than their parent event', async () => {
    const parentOrganizationId = `legacy-parent-notification-org-${suffix}`;
    const childOrganizationId = `legacy-child-notification-org-${suffix}`;
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-opaque-org-mismatch-${suffix}`,
        organizationId: parentOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque parent event',
          message: 'The child must keep the parent legacy organization identity.',
        },
      },
      select: { id: true },
    });

    await expect(
      db.notification.create({
        data: {
          eventId: event.id,
          recipientId: userId,
          organizationId: childOrganizationId,
          channel: 'IN_APP',
          title: 'Opaque mismatched child',
          preview: 'The child organization must match the parent event.',
          body: 'The child organization must match the parent event.',
        },
      }),
    ).rejects.toThrow(
      'Notification organization must match notification event organization',
    );
  });

  test('rejects opaque notification children with a different recipient than their parent event', async () => {
    const opaqueOrganizationId = `legacy-recipient-notification-org-${suffix}`;
    const outsiderId = `m16e-db-opaque-recipient-outsider-${suffix}`;
    await db.user.create({
      data: {
        id: outsiderId,
        clerkId: `m16e-db-opaque-recipient-outsider-clerk-${suffix}`,
        email: `m16e-db-opaque-recipient-outsider-${suffix}@example.test`,
      },
    });
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-opaque-recipient-mismatch-${suffix}`,
        organizationId: opaqueOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque recipient parent event',
          message: 'The child must keep the parent recipient identity.',
        },
      },
      select: { id: true },
    });

    await expect(
      db.notification.create({
        data: {
          eventId: event.id,
          recipientId: outsiderId,
          organizationId: opaqueOrganizationId,
          channel: 'IN_APP',
          title: 'Opaque recipient mismatch',
          preview: 'The child recipient must match the parent event.',
          body: 'The child recipient must match the parent event.',
        },
      }),
    ).rejects.toThrow(
      'Notification recipient must match notification event recipient',
    );
  });

  test('rejects legacy-form first-class organization events when membership cannot be proven', async () => {
    const outsiderId = `m16e-db-legacy-event-outsider-${suffix}`;
    await db.user.create({
      data: {
        id: outsiderId,
        clerkId: `m16e-db-legacy-event-outsider-clerk-${suffix}`,
        email: `m16e-db-legacy-event-outsider-${suffix}@example.test`,
      },
    });

    await expect(
      db.notificationEvent.create({
        data: {
          idempotencyKey: `m16e-db-event-legacy-outsider-${suffix}`,
          organizationId,
          recipientId: outsiderId,
          templateKey: 'account_notice',
          category: 'TRANSACTIONAL',
          payload: {
            subject: 'Invalid first-class legacy-form event',
            message: 'Membership cannot be proven during the expand phase.',
          },
        },
      }),
    ).rejects.toThrow(
      'First-class organization scope requires a verified relationship',
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

  test('derives verified organization linkage for legacy child notification writers', async () => {
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-db-event-legacy-child-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Legacy child event',
          message: 'The parent scope should be derived first.',
        },
      },
      select: { id: true },
    });

    const notification = await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId,
        channel: 'IN_APP',
        title: 'Legacy child notification',
        preview: 'The verified scope should be derived safely.',
        body: 'The verified scope should be derived safely.',
      },
      select: { organizationRecordId: true },
    });

    expect(notification.organizationRecordId).toBe(organizationId);
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
