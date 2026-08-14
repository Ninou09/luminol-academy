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
});
