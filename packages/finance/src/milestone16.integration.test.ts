import { beforeAll, describe, expect, test } from 'vitest';

import { db } from '@luminol/database';

import { createCorporateInvoice, createInvoice } from './server';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorId = `m16e-finance-actor-${suffix}`;
const organizationId = `m16e-finance-org-${suffix}`;
const archivedOrganizationId = `m16e-finance-archived-org-${suffix}`;
const actor = { userId: actorId, permissions: ['finance:manage'] as const };

suite('Milestone 16 verified organization finance integration', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: actorId,
        clerkId: `m16e-finance-clerk-${suffix}`,
        email: `m16e-finance-${suffix}@example.test`,
      },
    });
    await db.organization.createMany({
      data: [
        {
          id: organizationId,
          name: 'Verified Finance Organization',
          seatLimit: 20,
        },
        {
          id: archivedOrganizationId,
          name: 'Archived Finance Organization',
          seatLimit: 20,
          status: 'ARCHIVED',
          archivedAt: new Date(),
        },
      ],
    });
  });

  test('rejects arbitrary organization identifiers on new invoices', async () => {
    await expect(
      createInvoice(actor, {
        number: `M16E-UNVERIFIED-${suffix}`,
        customerId: actorId,
        organizationId: `opaque-legacy-${suffix}`,
        currency: 'DZD',
        lines: [
          { description: 'Verification test', quantity: 1, unitAmountMinor: 100 },
        ],
      }),
    ).rejects.toThrow('Active verified organization not found');
  });

  test('persists both the legacy-compatible identifier and verified relation', async () => {
    const invoice = await createInvoice(actor, {
      number: `M16E-VERIFIED-${suffix}`,
      customerId: actorId,
      organizationId,
      currency: 'DZD',
      lines: [
        { description: 'Verified organization invoice', quantity: 1, unitAmountMinor: 100 },
      ],
    });

    expect(invoice.organizationId).toBe(organizationId);
    expect(invoice.organizationRecordId).toBe(organizationId);
  });

  test('creates corporate billing only for an active first-class organization', async () => {
    const result = await createCorporateInvoice(actor, {
      number: `M16E-CORPORATE-${suffix}`,
      customerId: actorId,
      organizationId,
      cohortId: `cohort-${suffix}`,
      lineDescription: 'Team learning seats',
      billingContact: {
        name: 'Billing Contact',
        email: `billing-${suffix}@example.test`,
        purchaseOrderReference: `PO-${suffix}`,
      },
      seatCount: 5,
      pricePerSeatMinor: 2_000,
      currency: 'DZD',
      taxRateBasisPoints: 0,
      creditMinor: 0,
      paymentTermsDays: 30,
    });

    expect(result.invoice.organizationRecordId).toBe(organizationId);
    expect(result.corporateBilling.organizationRecordId).toBe(organizationId);
    expect(result.corporateBilling.organizationId).toBe(organizationId);
  });

  test('rejects archived organizations and billing beyond configured capacity', async () => {
    await expect(
      createCorporateInvoice(actor, {
        number: `M16E-ARCHIVED-${suffix}`,
        customerId: actorId,
        organizationId: archivedOrganizationId,
        cohortId: `cohort-archived-${suffix}`,
        lineDescription: 'Archived team learning seats',
        billingContact: {
          name: 'Billing Contact',
          email: `billing-archived-${suffix}@example.test`,
        },
        seatCount: 1,
        pricePerSeatMinor: 1_000,
        currency: 'DZD',
      }),
    ).rejects.toThrow('Active verified organization not found');

    await expect(
      createCorporateInvoice(actor, {
        number: `M16E-CAPACITY-${suffix}`,
        customerId: actorId,
        organizationId,
        cohortId: `cohort-capacity-${suffix}`,
        lineDescription: 'Capacity test seats',
        billingContact: {
          name: 'Billing Contact',
          email: `billing-capacity-${suffix}@example.test`,
        },
        seatCount: 21,
        pricePerSeatMinor: 1_000,
        currency: 'DZD',
      }),
    ).rejects.toThrow('Corporate seat count exceeds organization seat limit');
  });
});
