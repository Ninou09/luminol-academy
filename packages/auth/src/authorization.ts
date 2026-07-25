export const ROLE_NAMES = [
  'SUPER_ADMIN',
  'ADMIN',
  'ACADEMIC_DIRECTOR',
  'PSYCHOLOGY_DIRECTOR',
  'LANGUAGE_DIRECTOR',
  'TRAINER',
  'STUDENT',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];
export type Principal = Readonly<{
  userId: string;
  clerkId: string;
  roles: readonly string[];
  permissions: readonly string[];
}>;

export class AuthorizationError extends Error {
  override readonly name = 'AuthorizationError';

  constructor(message = 'You are not authorized to perform this action') {
    super(message);
  }
}

export function hasRole(
  principal: Principal,
  roles: readonly RoleName[],
): boolean {
  return principal.roles.some((role) => roles.includes(role as RoleName));
}

export function hasPermission(
  principal: Principal,
  permission: string,
): boolean {
  return (
    principal.roles.includes('SUPER_ADMIN') ||
    principal.permissions.includes(permission)
  );
}

export function requireRole(
  principal: Principal | null,
  roles: readonly RoleName[],
): Principal {
  if (!principal || !hasRole(principal, roles)) throw new AuthorizationError();
  return principal;
}

export function requirePermission(
  principal: Principal | null,
  permission: string,
): Principal {
  if (!principal || !hasPermission(principal, permission))
    throw new AuthorizationError();
  return principal;
}
