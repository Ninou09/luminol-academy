import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `m16e-finance-user-${suffix}`;
const activeOrganizationId = `m16e-finance-active-org-${suffix}`;
const otherOrganizationId = `m16e-finance-other-org-${suffix}`;
const suspendedOrganizationId = `m16e-finance-suspended-org-${suffix}`;

suite('Milestone 16 finance expand-phase fail-closed constraints', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-finance-clerk-${suffix}`,
        email: `m16e-finance-${suffix}@example.test`,
      },
    });

    await db.organization.createMany({
      data: [
        {
          id: activeOrganizationId,
          name: 'Active Finance Organization',
          seatLimit: 5,
        },
        {
          id: otherOrganizationId,
          name: 'Other Finance Organization',
          seatLimit: 5,
        },
        {
          id: suspendedOrganizationId,
          name: 'Suspended Finance Organization',
          seatLimit: 5,
          status: 'SUSPENDED',
        },
      ],
    });
  });

  test('rejects a legacy-form invoice naming an inactive first-class organization', async () => {
    await expect(
      db.invoice.create({
        data: {
          number: `M16E-FINANCE-SUSPENDED-${suffix}`,
          customerId: userId,
          organizationId: suspendedOrganizationId,
          currency: 'DZD',
          subtotalMinor: 100,
          taxMinor: 0,
          totalMinor: 100,
        },
      }),
    ).rejects.toThrow(
      'First-class organization scope requires a verified relationship',
    );
  });

  test('rejects legacy-form corporate billing that disagrees with its verified invoice organization', async () => {
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-FINANCE-PARENT-${suffix}`,
        customerId: userId,
        organizationId: activeOrganizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(invoice.organizationRecordId).toBe(activeOrganizationId);

    await expect(
      db.corporateBillingRecord.create({
        data: {
          organizationId: otherOrganizationId,
          invoiceId: invoice.id,
          billingContactName: 'Mismatched Billing Contact',
          billingContactEmail: `m16e-finance-mismatch-${suffix}@example.test`,
          seatCount: 1,
          pricePerSeatMinor: 100,
          paymentTermsDays: 30,
        },
      }),
    ).rejects.toThrow(
      'First-class organization scope requires a verified relationship',
    );
  });

  test('keeps truly opaque legacy finance identifiers unverified during expansion', async () => {
    const opaqueOrganizationId = `opaque-finance-org-${suffix}`;
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-FINANCE-OPAQUE-${suffix}`,
        customerId: userId,
        organizationId: opaqueOrganizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true, organizationRecordId: true },
    });

    expect(invoice.organizationRecordId).toBeNull();

    const billing = await db.corporateBillingRecord.create({
      data: {
        organizationId: opaqueOrganizationId,
        invoiceId: invoice.id,
        billingContactName: 'Opaque Legacy Billing Contact',
        billingContactEmail: `m16e-finance-opaque-${suffix}@example.test`,
        seatCount: 1,
        pricePerSeatMinor: 100,
        paymentTermsDays: 30,
      },
      select: { organizationRecordId: true },
    });

    expect(billing.organizationRecordId).toBeNull();
  });
});
