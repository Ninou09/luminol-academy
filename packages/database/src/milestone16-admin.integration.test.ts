import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `m16-admin-user-${suffix}`;
const organizationId = `m16-admin-org-${suffix}`;
let auditId: string;

suite('Milestone 16 organization administration audit invariants', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16-admin-clerk-${suffix}`,
        email: `m16-admin-${suffix}@example.test`,
      },
    });
    await db.organization.create({
      data: {
        id: organizationId,
        name: `Milestone 16 Admin ${suffix}`,
        seatLimit: 2,
      },
    });
    const audit = await db.organizationAuditEvent.create({
      data: {
        organizationId,
        actorUserId: userId,
        action: 'organization.created',
        subjectType: 'organization',
        subjectId: organizationId,
      },
      select: { id: true },
    });
    auditId = audit.id;
  });

  test('rejects empty audit dimensions', async () => {
    await expect(
      db.organizationAuditEvent.create({
        data: {
          organizationId,
          actorUserId: userId,
          action: '',
          subjectType: 'organization',
          subjectId: organizationId,
        },
      }),
    ).rejects.toThrow();
  });

  test('keeps organization audit history append-only', async () => {
    await expect(
      db.organizationAuditEvent.update({
        where: { id: auditId },
        data: { action: 'organization.archived' },
      }),
    ).rejects.toThrow('Organization audit history is immutable');

    await expect(
      db.organizationAuditEvent.delete({ where: { id: auditId } }),
    ).rejects.toThrow('Organization audit history is immutable');
  });
});
