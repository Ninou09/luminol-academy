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

  test(
    'rejects new organization-scoped invoices without a verified relation',
    async () => {
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
    },
  );

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

  test(
    'keeps corporate billing on the same verified organization as its invoice',
    async () => {
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
    },
  );

  test(
    'requires verified organization linkage for new organization notifications',
    async () => {
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
    },
  );
});
