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
