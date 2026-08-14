import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `m16e-parent-opaque-user-${suffix}`;

suite('Milestone 16 opaque parent identity constraints', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-parent-opaque-clerk-${suffix}`,
        email: `m16e-parent-opaque-${suffix}@example.test`,
      },
    });
  });

  test('rejects changing an opaque invoice organization after corporate billing exists', async () => {
    const organizationId = `opaque-invoice-parent-${suffix}`;
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-OPAQUE-PARENT-${suffix}`,
        customerId: userId,
        organizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true },
    });

    await db.corporateBillingRecord.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        billingContactName: 'Opaque Billing Parent',
        billingContactEmail: `opaque-billing-parent-${suffix}@example.test`,
        seatCount: 1,
        pricePerSeatMinor: 100,
        paymentTermsDays: 30,
      },
    });

    await expect(
      db.invoice.update({
        where: { id: invoice.id },
        data: { organizationId: `opaque-invoice-moved-${suffix}` },
      }),
    ).rejects.toThrow('Invoice organization identity is immutable');
  });

  test('rejects changing an opaque event recipient after a notification exists', async () => {
    const organizationId = `opaque-event-recipient-org-${suffix}`;
    const otherUserId = `m16e-parent-opaque-other-user-${suffix}`;
    await db.user.create({
      data: {
        id: otherUserId,
        clerkId: `m16e-parent-opaque-other-clerk-${suffix}`,
        email: `m16e-parent-opaque-other-${suffix}@example.test`,
      },
    });

    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-parent-opaque-event-recipient-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque event recipient',
          message: 'Child notification fixes the parent recipient identity.',
        },
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId,
        channel: 'IN_APP',
        title: 'Opaque event recipient',
        preview: 'Parent recipient must remain stable.',
        body: 'Parent recipient must remain stable.',
      },
    });

    await expect(
      db.notificationEvent.update({
        where: { id: event.id },
        data: { recipientId: otherUserId },
      }),
    ).rejects.toThrow('Notification event recipient identity is immutable');
  });

  test('rejects changing an opaque event organization after a notification exists', async () => {
    const organizationId = `opaque-event-organization-${suffix}`;
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-parent-opaque-event-org-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque event organization',
          message: 'Child notification fixes the parent organization identity.',
        },
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId,
        channel: 'IN_APP',
        title: 'Opaque event organization',
        preview: 'Parent organization must remain stable.',
        body: 'Parent organization must remain stable.',
      },
    });

    await expect(
      db.notificationEvent.update({
        where: { id: event.id },
        data: { organizationId: `opaque-event-organization-moved-${suffix}` },
      }),
    ).rejects.toThrow('Notification event organization identity is immutable');
  });
});
