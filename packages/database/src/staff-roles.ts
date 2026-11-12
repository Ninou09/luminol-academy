import {
  StaffRoleAuditAction,
  type PrismaClient,
} from '../generated/prisma/client';

/**
 * Roles the owner may grant from the administration team page. `admin` is
 * deliberately excluded: platform administration is never granted through a
 * browser workflow.
 */
export const STAFF_ROLE_KEYS = ['staff', 'enquiry-agent'] as const;
export type StaffRoleKey = (typeof STAFF_ROLE_KEYS)[number];

export class StaffRoleError extends Error {
  constructor(
    readonly code:
      'invalid-role' | 'self-change' | 'unknown-user' | 'role-missing',
    message: string,
  ) {
    super(message);
    this.name = 'StaffRoleError';
  }
}

export function isStaffRoleKey(value: string): value is StaffRoleKey {
  return (STAFF_ROLE_KEYS as readonly string[]).includes(value);
}

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

export interface StaffRoleChange {
  actorUserId: string;
  targetUserId: string;
  roleKey: string;
}

async function changeStaffRole(
  client: PrismaClient,
  input: StaffRoleChange,
  action: StaffRoleAuditAction,
) {
  const actorUserId = requireIdentifier(input.actorUserId, 'Actor');
  const targetUserId = requireIdentifier(input.targetUserId, 'Target user');
  const roleKey = input.roleKey.trim();

  if (!isStaffRoleKey(roleKey)) {
    throw new StaffRoleError(
      'invalid-role',
      'Role is not a governed staff role',
    );
  }
  if (actorUserId === targetUserId) {
    throw new StaffRoleError(
      'self-change',
      'Staff roles cannot be changed on your own account',
    );
  }

  return client.$transaction(async (tx) => {
    const target = await tx.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    });
    if (!target) {
      throw new StaffRoleError('unknown-user', 'User account was not found');
    }

    const role = await tx.role.findUnique({
      where: { key: roleKey },
      select: { id: true },
    });
    if (!role) {
      throw new StaffRoleError('role-missing', 'Staff role is not provisioned');
    }

    const existing = await tx.userRole.findUnique({
      where: { userId_roleId: { userId: target.id, roleId: role.id } },
      select: { userId: true },
    });

    if (action === StaffRoleAuditAction.GRANTED) {
      if (existing) return { changed: false };
      await tx.userRole.create({
        data: { userId: target.id, roleId: role.id },
      });
    } else {
      if (!existing) return { changed: false };
      await tx.userRole.delete({
        where: { userId_roleId: { userId: target.id, roleId: role.id } },
      });
    }

    await tx.staffRoleAuditEvent.create({
      data: { actorUserId, targetUserId: target.id, roleKey, action },
    });

    return { changed: true };
  });
}

export function grantStaffRole(client: PrismaClient, input: StaffRoleChange) {
  return changeStaffRole(client, input, StaffRoleAuditAction.GRANTED);
}

export function revokeStaffRole(client: PrismaClient, input: StaffRoleChange) {
  return changeStaffRole(client, input, StaffRoleAuditAction.REVOKED);
}
