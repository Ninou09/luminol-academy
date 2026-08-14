import 'server-only';
import { randomUUID } from 'node:crypto';
import { db, type Prisma } from '@luminol/database';
import {
  notificationEventSchema,
  retryDelayMs,
  shouldDeliver,
  type EmailProvider,
} from './index';

type VerifiedOrganization = { id: string };
type VerifiedMembership = { id: string };

async function loadActiveVerifiedOrganization(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<VerifiedOrganization> {
  const rows = await tx.$queryRaw<VerifiedOrganization[]>`
    SELECT "id"
    FROM "Organization"
    WHERE "id" = ${organizationId}
      AND "status" = 'ACTIVE'
      AND "archivedAt" IS NULL
    FOR SHARE
  `;
  const organization = rows[0];
  if (!organization) throw new Error('Active verified organization not found');
  return organization;
}

async function requireActiveOrganizationRecipient(
  tx: Prisma.TransactionClient,
  organizationId: string,
  recipientId: string,
) {
  const rows = await tx.$queryRaw<VerifiedMembership[]>`
    SELECT membership."id"
    FROM "OrganizationMembership" AS membership
    INNER JOIN "User" AS recipient
      ON recipient."id" = membership."userId"
    WHERE membership."organizationId" = ${organizationId}
      AND membership."userId" = ${recipientId}
      AND membership."active" = TRUE
      AND membership."endedAt" IS NULL
      AND recipient."deletedAt" IS NULL
    FOR SHARE OF membership, recipient
  `;
  if (!rows[0])
    throw new Error('Active organization recipient membership not found');
}

export async function createNotificationEvent(input: unknown) {
  const parsed = notificationEventSchema.parse(input);
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.notificationEvent.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
      include: { notifications: true },
    });
    if (existing) return existing;

    const organization = parsed.organizationId
      ? await loadActiveVerifiedOrganization(tx, parsed.organizationId)
      : null;
    if (organization)
      await requireActiveOrganizationRecipient(
        tx,
        organization.id,
        parsed.recipientId,
      );

    const preference = await tx.notificationPreference.findMany({
      where: {
        userId: parsed.recipientId,
        category: parsed.category.toUpperCase() as
          'TRANSACTIONAL' | 'MARKETING',
        ...(organization
          ? {
              OR: [
                { organizationId: organization.id },
                { organizationId: null },
              ],
            }
          : { organizationId: null }),
      },
    });
    const channels = parsed.channels.filter((channel) => {
      const dbChannel = channel.toUpperCase() as 'IN_APP' | 'EMAIL';
      const scopedPreference = organization
        ? preference.find(
            (item) =>
              item.channel === dbChannel &&
              item.organizationId === organization.id,
          )
        : undefined;
      const globalPreference = preference.find(
        (item) => item.channel === dbChannel && item.organizationId === null,
      );
      return shouldDeliver(
        parsed.category,
        (scopedPreference ?? globalPreference)?.enabled ??
          parsed.category === 'transactional',
      );
    });
    return tx.notificationEvent.create({
      data: {
        idempotencyKey: parsed.idempotencyKey,
        recipientId: parsed.recipientId,
        ...(organization
          ? {
              organizationId: organization.id,
              organizationRecordId: organization.id,
            }
          : {}),
        templateKey: parsed.templateKey,
        category: parsed.category.toUpperCase() as
          'TRANSACTIONAL' | 'MARKETING',
        payload: parsed.payload,
        notifications: {
          create: channels.map((channel) => ({
            recipient: { connect: { id: parsed.recipientId } },
            ...(organization
              ? {
                  organizationId: organization.id,
                  organizationRecordId: organization.id,
                }
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
  existingLockToken?: string,
) {
  const item = await db.notification.findUnique({
    where: { id: notificationId },
    include: { recipient: { select: { email: true } } },
  });
  if (!item || item.channel !== 'EMAIL')
    throw new Error('Email notification not found');
  if (item.status === 'DELIVERED' || item.status === 'DEAD_LETTER') return item;
  const lockToken = existingLockToken ?? randomUUID();
  if (!existingLockToken) {
    const claimed = await db.notification.updateMany({
      where: {
        id: item.id,
        status: { in: ['PENDING', 'RETRY_SCHEDULED'] },
        scheduledAt: { lte: new Date() },
      },
      data: {
        status: 'PROCESSING',
        lockToken,
        lockedUntil: new Date(Date.now() + 5 * 60_000),
      },
    });
    if (claimed.count !== 1)
      return db.notification.findUniqueOrThrow({ where: { id: item.id } });
  } else if (item.status !== 'PROCESSING' || item.lockToken !== lockToken) {
    return item;
  }
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
          lockToken: null,
          lockedUntil: null,
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
          lockToken: null,
          lockedUntil: null,
        },
      });
    });
  }
}

export async function claimDueEmailDeliveries(batchSize: number) {
  const limit = Math.max(1, Math.min(100, Math.trunc(batchSize)));
  const lockToken = randomUUID();
  const lockedUntil = new Date(Date.now() + 5 * 60_000);
  const rows = await db.$queryRaw<Array<{ id: string }>>`
    WITH candidates AS (
      SELECT "id" FROM "Notification"
      WHERE "channel" = 'EMAIL'
        AND "scheduledAt" <= NOW()
        AND (
          "status" IN ('PENDING', 'RETRY_SCHEDULED')
          OR ("status" = 'PROCESSING' AND "lockedUntil" < NOW())
        )
      ORDER BY "scheduledAt", "id"
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE "Notification" AS n
    SET "status" = 'PROCESSING', "lockToken" = ${lockToken},
        "lockedUntil" = ${lockedUntil}, "updatedAt" = NOW()
    FROM candidates
    WHERE n."id" = candidates."id"
    RETURNING n."id"
  `;
  return { ids: rows.map(({ id }) => id), lockToken };
}
