import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { db } from '@luminol/database';
import type { PermissionKey } from '@luminol/types';
import { Webhook } from 'svix';
import { z } from 'zod';
import { hasPlatformPermission } from './authorization';

export { hasPlatformPermission } from './authorization';

export { ClerkProvider, SignIn, SignUp, UserButton } from '@clerk/nextjs';

const clerkEmailSchema = z.object({ id: z.string(), email_address: z.email() });
const clerkUserSchema = z.object({
  id: z.string().min(1),
  email_addresses: z.array(clerkEmailSchema),
  primary_email_address_id: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  image_url: z.url().nullable().optional(),
  last_sign_in_at: z.number().nullable().optional(),
});
const clerkEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.enum(['user.created', 'user.updated']),
    data: clerkUserSchema,
  }),
  z.object({
    type: z.literal('user.deleted'),
    data: z.object({ id: z.string().min(1) }),
  }),
]);

export type ClerkUserEvent = z.infer<typeof clerkEventSchema>;

export class AuthorizationError extends Error {
  constructor(message = 'You are not authorized to access this resource') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

interface PermissionAssignment {
  permission: { key: string };
}

interface RoleAssignment {
  role: { key: string; permissions: PermissionAssignment[] };
}

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new AuthorizationError('Authentication required');

  const user = await db.user.findUnique({
    where: { clerkId: userId, deletedAt: null },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  if (!user) throw new AuthorizationError('User account is not synchronized');
  return user;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireUser();
  const allowed = user.roles.some(({ role }: RoleAssignment) =>
    role.permissions.some(
      ({ permission: assigned }: PermissionAssignment) =>
        assigned.key === permission,
    ),
  );
  if (!allowed) throw new AuthorizationError();
  return user;
}

/**
 * Authorizes deliberately cross-organization administration. The trusted
 * authority is the synchronized server-side role/permission graph, never a
 * form field or organization identifier supplied by the browser.
 */
export async function requirePlatformPermission(permission: PermissionKey) {
  const user = await requireUser();
  if (!hasPlatformPermission(user.roles, permission))
    throw new AuthorizationError();
  return user;
}

export async function requireRole(roleKey: string) {
  const user = await requireUser();
  if (!user.roles.some(({ role }: RoleAssignment) => role.key === roleKey))
    throw new AuthorizationError();
  return user;
}

export function verifyClerkWebhook(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string,
): ClerkUserEvent {
  const verified: unknown = new Webhook(secret).verify(payload, {
    'svix-id': headers.id,
    'svix-timestamp': headers.timestamp,
    'svix-signature': headers.signature,
  });
  return clerkEventSchema.parse(verified);
}

export async function synchronizeClerkUser(
  event: ClerkUserEvent,
): Promise<void> {
  if (event.type === 'user.deleted') {
    await db.user.updateMany({
      where: { clerkId: event.data.id },
      data: {
        email: `deleted+${event.data.id}@invalid.local`,
        firstName: null,
        lastName: null,
        imageUrl: null,
        deletedAt: new Date(),
      },
    });
    return;
  }
  const primaryEmail = event.data.email_addresses.find(
    ({ id }) => id === event.data.primary_email_address_id,
  )?.email_address;
  if (!primaryEmail)
    throw new Error('Clerk user does not have a primary email address');

  const lastSignIn =
    event.data.last_sign_in_at != null
      ? { lastSignInAt: new Date(event.data.last_sign_in_at) }
      : {};

  const user = await db.user.upsert({
    where: { clerkId: event.data.id },
    create: {
      clerkId: event.data.id,
      email: primaryEmail,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
      imageUrl: event.data.image_url ?? null,
      ...lastSignIn,
    },
    update: {
      email: primaryEmail,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
      imageUrl: event.data.image_url ?? null,
      ...lastSignIn,
      deletedAt: null,
    },
  });
  if (event.type === 'user.created') {
    const studentRole = await db.role.upsert({
      where: { key: 'student' },
      create: { key: 'student', name: 'Student' },
      update: {},
    });
    await db.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: studentRole.id } },
      create: { userId: user.id, roleId: studentRole.id },
      update: {},
    });
  }
}
