import { describe, expect, it } from 'vitest';
import {
  AuthorizationError,
  hasPermission,
  requirePermission,
  requireRole,
  type Principal,
} from './authorization';

const trainer: Principal = {
  userId: 'user',
  clerkId: 'clerk',
  roles: ['TRAINER'],
  permissions: ['content.manage'],
};

describe('RBAC', () => {
  it('grants explicitly assigned permissions', () =>
    expect(hasPermission(trainer, 'content.manage')).toBe(true));
  it('denies unassigned permissions', () =>
    expect(() => requirePermission(trainer, 'users.manage')).toThrow(
      AuthorizationError,
    ));
  it('guards protected roles server-side', () =>
    expect(() => requireRole(trainer, ['ADMIN'])).toThrow(AuthorizationError));
  it('never permits an anonymous principal', () =>
    expect(() => requirePermission(null, 'content.manage')).toThrow(
      AuthorizationError,
    ));
});
