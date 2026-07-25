import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@luminol/database';
import type { Principal } from './authorization';

export async function getCurrentPrincipal(): Promise<Principal | null> {
  const { userId: clerkId } = await auth();
  const database = getDatabase();
  if (!clerkId) return null;

  const user = await database.user.findFirst({
    where: { clerkId, deletedAt: null },
    select: {
      id: true,
      clerkId: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
              permissions: {
                select: { permission: { select: { key: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!user) return null;

  return {
    userId: user.id,
    clerkId: user.clerkId,
    roles: user.roles.map(({ role }) => role.name),
    permissions: [
      ...new Set(
        user.roles.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.key),
        ),
      ),
    ],
  };
}

export async function requireAuthenticatedUser(): Promise<Principal> {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new Error('Authentication required');
  return principal;
}
