import { describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

suite('Milestone 16 legacy organization identity preservation', () => {
  test('does not verify historical organization identity during a routine update', async () => {
    const userId = `m16e-legacy-user-${suffix}`;
    const futureOrganizationId = `m16e-future-org-${suffix}`;

    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-legacy-clerk-${suffix}`,
        email: `m16e-legacy-${suffix}@example.test`,
      },
    });

    const invoice = await db.invoice.create({
      data: {
        number: `M16E-LEGACY-ROUTINE-${suffix}`,
        customerId: userId,
        organizationId: futureOrganizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: {
        id: true,
        organizationRecordId: true,
      },
    });

    expect(invoice.organizationRecordId).toBeNull();

    await db.organization.create({
      data: {
        id: futureOrganizationId,
        name: 'Organization Created After Legacy Invoice',
        seatLimit: 2,
      },
    });

    const updated = await db.invoice.update({
      where: { id: invoice.id },
      data: { status: 'OPEN' },
      select: { organizationRecordId: true },
    });

    expect(updated.organizationRecordId).toBeNull();
  });

  test('revalidates an unverified corporate billing record when only its invoice changes', async () => {
    const userId = `m16e-legacy-billing-user-${suffix}`;
    const futureOrganizationId = `m16e-legacy-billing-org-${suffix}`;

    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-legacy-billing-clerk-${suffix}`,
        email: `m16e-legacy-billing-${suffix}@example.test`,
      },
    });

    const historicalInvoice = await db.invoice.create({
      data: {
        number: `M16E-LEGACY-BILLING-HISTORY-${suffix}`,
        customerId: userId,
        organizationId: futureOrganizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true },
    });

    const billing = await db.corporateBillingRecord.create({
      data: {
        organizationId: futureOrganizationId,
        invoiceId: historicalInvoice.id,
        billingContactName: 'Historical Billing Contact',
        billingContactEmail: `m16e-legacy-billing-contact-${suffix}@example.test`,
        seatCount: 1,
        pricePerSeatMinor: 100,
        paymentTermsDays: 30,
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(billing.organizationRecordId).toBeNull();

    await db.organization.create({
      data: {
        id: futureOrganizationId,
        name: 'First-Class Billing Organization',
        seatLimit: 3,
      },
    });

    const verifiedInvoice = await db.invoice.create({
      data: {
        number: `M16E-LEGACY-BILLING-VERIFIED-${suffix}`,
        customerId: userId,
        organizationId: futureOrganizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(verifiedInvoice.organizationRecordId).toBe(futureOrganizationId);

    const updated = await db.corporateBillingRecord.update({
      where: { id: billing.id },
      data: { invoiceId: verifiedInvoice.id },
      select: { organizationRecordId: true },
    });

    expect(updated.organizationRecordId).toBe(futureOrganizationId);
  });

  test('revalidates an unverified notification when only its parent event changes', async () => {
    const userId = `m16e-legacy-notification-user-${suffix}`;
    const futureOrganizationId = `m16e-legacy-notification-org-${suffix}`;

    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-legacy-notification-clerk-${suffix}`,
        email: `m16e-legacy-notification-${suffix}@example.test`,
      },
    });

    const historicalEvent = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-legacy-event-history-${suffix}`,
        organizationId: futureOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Historical opaque event',
          message: 'This event predates first-class organization verification.',
        },
      },
      select: { id: true },
    });

    const notification = await db.notification.create({
      data: {
        eventId: historicalEvent.id,
        recipientId: userId,
        organizationId: futureOrganizationId,
        channel: 'IN_APP',
        title: 'Historical opaque notification',
        preview: 'Historical opaque notification',
        body: 'Historical opaque notification',
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(notification.organizationRecordId).toBeNull();

    await db.organization.create({
      data: {
        id: futureOrganizationId,
        name: 'First-Class Notification Organization',
        seatLimit: 3,
      },
    });

    const membership = await db.organizationMembership.create({
      data: {
        organizationId: futureOrganizationId,
        userId,
        role: 'LEARNER',
        active: true,
      },
      select: { id: true },
    });

    const verifiedEvent = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-legacy-event-verified-${suffix}`,
        organizationId: futureOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Verified event',
          message: 'Membership is valid when this event is created.',
        },
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(verifiedEvent.organizationRecordId).toBe(futureOrganizationId);

    await db.organizationMembership.update({
      where: { id: membership.id },
      data: { active: false, endedAt: new Date() },
    });

    await expect(
      db.notification.update({
        where: { id: notification.id },
        data: { eventId: verifiedEvent.id },
      }),
    ).rejects.toThrow(
      'First-class organization scope requires a verified relationship',
    );
  });

  test('keeps routine delivery updates on deliberately unverified notifications compatible', async () => {
    const userId = `m16e-legacy-delivery-user-${suffix}`;
    const futureOrganizationId = `m16e-legacy-delivery-org-${suffix}`;

    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-legacy-delivery-clerk-${suffix}`,
        email: `m16e-legacy-delivery-${suffix}@example.test`,
      },
    });

    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-legacy-delivery-event-${suffix}`,
        organizationId: futureOrganizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Historical delivery event',
          message: 'This event intentionally remains unverified.',
        },
      },
      select: { id: true },
    });

    const notification = await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId: futureOrganizationId,
        channel: 'IN_APP',
        title: 'Historical delivery notification',
        preview: 'Historical delivery notification',
        body: 'Historical delivery notification',
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(notification.organizationRecordId).toBeNull();

    await db.organization.create({
      data: {
        id: futureOrganizationId,
        name: 'Organization Created After Historical Delivery',
        seatLimit: 2,
      },
    });

    const updated = await db.notification.update({
      where: { id: notification.id },
      data: { status: 'DELIVERED' },
      select: { status: true, organizationRecordId: true },
    });

    expect(updated.status).toBe('DELIVERED');
    expect(updated.organizationRecordId).toBeNull();
  });
});
