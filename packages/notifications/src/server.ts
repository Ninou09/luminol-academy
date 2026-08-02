import 'server-only';
import { db, type Prisma } from '@luminol/database';
import {
  notificationEventSchema,
  retryDelayMs,
  shouldDeliver,
  type EmailProvider,
} from './index';

export async function createNotificationEvent(input: unknown) {
  const parsed = notificationEventSchema.parse(input);
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.notificationEvent.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
      include: { notifications: true },
    });
    if (existing) return existing;
    const preference = await tx.notificationPreference.findMany({
      where: {
        userId: parsed.recipientId,
        category: parsed.category.toUpperCase() as
          'TRANSACTIONAL' | 'MARKETING',
      },
    });
    const channels = parsed.channels.filter((channel) =>
      shouldDeliver(
        parsed.category,
        preference.find((item) => item.channel === channel.toUpperCase())
          ?.enabled ?? parsed.category === 'transactional',
      ),
    );
    return tx.notificationEvent.create({
      data: {
        idempotencyKey: parsed.idempotencyKey,
        recipientId: parsed.recipientId,
        ...(parsed.organizationId
          ? { organizationId: parsed.organizationId }
          : {}),
        templateKey: parsed.templateKey,
        category: parsed.category.toUpperCase() as
          'TRANSACTIONAL' | 'MARKETING',
        payload: parsed.payload,
        notifications: {
          create: channels.map((channel) => ({
            recipient: { connect: { id: parsed.recipientId } },
            ...(parsed.organizationId
              ? { organizationId: parsed.organizationId }
              : {}),
            channel: channel.toUpperCase() as 'IN_APP' | 'EMAIL',
            title: parsed.payload.subject,
            preview: parsed.payload.message.slice(0, 140),
            body: parsed.payload.message,
          })),
        },
      },
      include: { notifications: true },
    });
  });
}

export async function deliverEmail(
  notificationId: string,
  provider: EmailProvider,
) {
  const item = await db.notification.findUnique({
    where: { id: notificationId },
    include: { recipient: { select: { email: true } } },
  });
  if (!item || item.channel !== 'EMAIL')
    throw new Error('Email notification not found');
  if (item.status === 'DELIVERED' || item.status === 'DEAD_LETTER') return item;
  const claimed = await db.notification.updateMany({
    where: {
      id: item.id,
      status: { in: ['PENDING', 'RETRY_SCHEDULED'] },
      scheduledAt: { lte: new Date() },
    },
    data: { status: 'PROCESSING' },
  });
  if (claimed.count !== 1)
    return db.notification.findUniqueOrThrow({ where: { id: item.id } });
  const attempt = item.attemptCount + 1;
  try {
    const result = await provider.send({
      to: item.recipient.email,
      subject: item.title,
      text: item.body,
      idempotencyKey: `${item.eventId}:email`,
    });
    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.notificationDeliveryAttempt.create({
        data: {
          notificationId: item.id,
          attemptNumber: attempt,
          status: 'SUCCEEDED',
          providerReference: result.providerReference,
        },
      });
      return tx.notification.update({
        where: { id: item.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          attemptCount: attempt,
          providerReference: result.providerReference,
          lastErrorCode: null,
        },
      });
    });
  } catch {
    const delay = retryDelayMs(attempt);
    return db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.notificationDeliveryAttempt.create({
        data: {
          notificationId: item.id,
          attemptNumber: attempt,
          status: 'FAILED',
          errorCode: 'PROVIDER_ERROR',
        },
      });
      return tx.notification.update({
        where: { id: item.id },
        data: {
          status: delay == null ? 'DEAD_LETTER' : 'RETRY_SCHEDULED',
          scheduledAt:
            delay == null ? item.scheduledAt : new Date(Date.now() + delay),
          attemptCount: attempt,
          lastErrorCode: 'PROVIDER_ERROR',
        },
      });
    });
  }
}
