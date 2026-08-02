'use server';
import { AuthorizationError, requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
const readSchema = z.object({
  notificationId: z.string().min(1),
  read: z.enum(['true', 'false']),
});
export async function setNotificationRead(formData: FormData) {
  const user = await requireUser();
  const input = readSchema.parse({
    notificationId: formData.get('notificationId'),
    read: formData.get('read'),
  });
  const result = await db.notification.updateMany({
    where: {
      id: input.notificationId,
      recipientId: user.id,
      channel: 'IN_APP',
    },
    data: { readAt: input.read === 'true' ? new Date() : null },
  });
  if (result.count !== 1) throw new AuthorizationError();
  revalidatePath('/notifications');
}
const preferenceSchema = z.object({
  enabled: z.enum(['on']).optional(),
  timeZone: z.string().min(1).max(100),
});
export async function updateMarketingPreference(formData: FormData) {
  const user = await requireUser();
  const input = preferenceSchema.parse({
    enabled: formData.get('enabled') ?? undefined,
    timeZone: formData.get('timeZone'),
  });
  new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format();
  await db.$transaction(async (transaction) => {
    const update = await transaction.notificationPreference.updateMany({
      where: {
        userId: user.id,
        organizationId: null,
        channel: 'EMAIL',
        category: 'MARKETING',
      },
      data: {
        enabled: input.enabled === 'on',
        timeZone: input.timeZone,
        consentedAt: input.enabled === 'on' ? new Date() : null,
      },
    });
    if (update.count === 0)
      await transaction.notificationPreference.create({
        data: {
          userId: user.id,
          channel: 'EMAIL',
          category: 'MARKETING',
          enabled: input.enabled === 'on',
          timeZone: input.timeZone,
          consentedAt: input.enabled === 'on' ? new Date() : null,
        },
      });
  });
  revalidatePath('/notifications');
}
