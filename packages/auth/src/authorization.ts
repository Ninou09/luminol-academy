import type { PermissionKey } from '@luminol/types';

export interface PermissionAssignment {
  permission: { key: string };
}

export interface RoleAssignment {
  role: { key: string; permissions: PermissionAssignment[] };
}

export function hasPlatformPermission(
  roles: RoleAssignment[],
  permission: PermissionKey,
): boolean {
  return roles.some(
    ({ role }) =>
      role.key === 'admin' &&
      role.permissions.some(
        ({ permission: assigned }) => assigned.key === permission,
      ),
  );
}

/**
 * True when any persisted role grants the permission. Use for scoped staff
 * capabilities; deliberately cross-organization work keeps using
 * {@link hasPlatformPermission}.
 */
export function hasPermission(
  roles: RoleAssignment[],
  permission: PermissionKey,
): boolean {
  return roles.some(({ role }) =>
    role.permissions.some(
      ({ permission: assigned }) => assigned.key === permission,
    ),
  );
}
