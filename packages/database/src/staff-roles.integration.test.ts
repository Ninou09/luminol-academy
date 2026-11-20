import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';
import { grantStaffRole, revokeStaffRole, StaffRoleError } from './staff-roles';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `staff-roles-owner-${suffix}`;
const memberId = `staff-roles-member-${suffix}`;

suite('governed staff roles', () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [
        {
          id: ownerId,
          clerkId: `clerk-staff-owner-${suffix}`,
          email: `staff-owner-${suffix}@example.test`,
        },
        {
          id: memberId,
          clerkId: `clerk-staff-member-${suffix}`,
          email: `staff-member-${suffix}@example.test`,
        },
      ],
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('grants and revokes idempotently with append-only audit', async () => {
    const change = {
      actorUserId: ownerId,
      targetUserId: memberId,
      roleKey: 'enquiry-agent',
    };

    await expect(grantStaffRole(db, change)).resolves.toEqual({
      changed: true,
    });
    await expect(grantStaffRole(db, change)).resolves.toEqual({
      changed: false,
    });

    const granted = await db.userRole.findMany({
      where: { userId: memberId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    expect(granted.map(({ role }) => role.key)).toEqual(['enquiry-agent']);
    const keys =
      granted[0]?.role.permissions.map(({ permission }) => permission.key) ??
      [];
    expect(keys).toContain('enquiry:work');
    expect(keys).not.toContain('academy:manage');
    expect(keys).not.toContain('team:manage');
    expect(
      keys.filter(
        (key) =>
          key.startsWith('finance:') ||
          key.startsWith('consultation:') ||
          key.startsWith('office-payment:'),
      ),
    ).toEqual([]);

    await expect(revokeStaffRole(db, change)).resolves.toEqual({
      changed: true,
    });
    await expect(revokeStaffRole(db, change)).resolves.toEqual({
      changed: false,
    });

    const events = await db.staffRoleAuditEvent.findMany({
      where: { targetUserId: memberId },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events.map(({ action, roleKey }) => [action, roleKey])).toEqual([
      ['GRANTED', 'enquiry-agent'],
      ['REVOKED', 'enquiry-agent'],
    ]);

    await expect(
      db.staffRoleAuditEvent.delete({ where: { id: events[0]!.id } }),
    ).rejects.toThrow();
  });

  test('refuses platform admin, unknown roles and self-changes', async () => {
    await expect(
      grantStaffRole(db, {
        actorUserId: ownerId,
        targetUserId: memberId,
        roleKey: 'admin',
      }),
    ).rejects.toBeInstanceOf(StaffRoleError);

    await expect(
      grantStaffRole(db, {
        actorUserId: memberId,
        targetUserId: memberId,
        roleKey: 'staff',
      }),
    ).rejects.toMatchObject({ code: 'self-change' });

    await expect(
      grantStaffRole(db, {
        actorUserId: ownerId,
        targetUserId: `missing-${suffix}`,
        roleKey: 'staff',
      }),
    ).rejects.toMatchObject({ code: 'unknown-user' });
  });
});
