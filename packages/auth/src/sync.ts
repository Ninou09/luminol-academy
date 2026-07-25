import { getDatabase } from '@luminol/database';
import { z } from 'zod';

export const clerkUserSchema = z.object({
  id: z.string().min(1),
  email_addresses: z
    .array(z.object({ id: z.string(), email_address: z.email() }))
    .min(1),
  primary_email_address_id: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  image_url: z.url().nullable(),
});

export async function synchronizeClerkUser(input: unknown): Promise<void> {
  const user = clerkUserSchema.parse(input);
  const database = getDatabase();
  const primaryEmail =
    user.email_addresses.find(
      ({ id }) => id === user.primary_email_address_id,
    ) ?? user.email_addresses[0];
  if (!primaryEmail) throw new Error('Clerk user has no email address');

  await database.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: primaryEmail.email_address,
      deletedAt: null,
      profile: {
        upsert: {
          create: {
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.image_url,
          },
          update: {
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.image_url,
          },
        },
      },
    },
    create: {
      clerkId: user.id,
      email: primaryEmail.email_address,
      profile: {
        create: {
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.image_url,
        },
      },
      roles: { create: { role: { connect: { name: 'STUDENT' } } } },
    },
  });
}

export async function deactivateClerkUser(clerkId: string): Promise<void> {
  const database = getDatabase();
  await database.user.update({
    where: { clerkId },
    data: { deletedAt: new Date() },
  });
}
