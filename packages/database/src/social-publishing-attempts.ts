import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';

import {
  SocialPublishingAttemptEventType,
  SocialPublishingAttemptStatus,
  type Prisma,
  type PrismaClient,
  type SocialPublishingAttempt,
} from '../generated/prisma/client';
import {
  materializeSocialPublishingDeliveryPlan,
  type SocialPublishingDeliveryPlan,
} from './social-publishing-delivery';

const identifierSchema = z.string().trim().min(1).max(255);
const providerReferenceSchema = z.string().trim().min(1).max(255);

export const SOCIAL_PUBLISHING_LOCK_MS = 5 * 60_000;
const SOCIAL_PUBLISHING_RETRY_DELAYS_MS = [60_000, 5 * 60_000] as const;

export type SocialPublishingProvider = {
  publish(input: {
    plan: SocialPublishingDeliveryPlan;
    idempotencyKey: string;
  }): Promise<{ providerReference: string }>;
};

export type ExecuteSocialPublishingAttemptResult = {
  attempt: SocialPublishingAttempt;
  providerInvoked: boolean;
};

export function socialPublishingRetryDelayMs(attemptNumber: number) {
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) return null;
  return SOCIAL_PUBLISHING_RETRY_DELAYS_MS[attemptNumber - 1] ?? null;
}

export function buildSocialPublishingIdempotencyKey(
  plan: Pick<
    SocialPublishingDeliveryPlan,
    | 'actionId'
    | 'platform'
    | 'accountRef'
    | 'externalAccountId'
    | 'contentCalendarItemId'
    | 'contentRevision'
  >,
) {
  const identity = [
    'v1',
    plan.actionId,
    plan.platform,
    plan.accountRef,
    plan.externalAccountId,
    plan.contentCalendarItemId,
    String(plan.contentRevision),
  ].join('\u001f');
  const digest = createHash('sha256').update(identity).digest('hex');
  return `social-publish:v1:${digest}`;
}

function assertAttemptMatchesPlan(
  attempt: SocialPublishingAttempt,
  plan: SocialPublishingDeliveryPlan,
  idempotencyKey: string,
) {
  if (
    attempt.idempotencyKey !== idempotencyKey ||
    attempt.proposalId !== plan.proposalId ||
    attempt.actionId !== plan.actionId ||
    attempt.contentCalendarItemId !== plan.contentCalendarItemId ||
    attempt.contentRevision !== plan.contentRevision ||
    attempt.platform !== plan.platform ||
    attempt.accountRef !== plan.accountRef ||
    attempt.externalAccountId !== plan.externalAccountId
  ) {
    throw new Error('Social publishing attempt no longer matches delivery plan');
  }
}

export async function planSocialPublishingAttempt(
  client: PrismaClient,
  input: {
    proposalId: string;
    actorUserId: string;
    now?: Date;
  },
) {
  const proposalId = identifierSchema.parse(input.proposalId);
  const actorUserId = identifierSchema.parse(input.actorUserId);
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing attempt plan time is invalid');
  }

  const plan = await materializeSocialPublishingDeliveryPlan(client, proposalId);
  const idempotencyKey = buildSocialPublishingIdempotencyKey(plan);

  const attempt = await client.socialPublishingAttempt.upsert({
    where: { proposalId: plan.proposalId },
    update: {},
    create: {
      idempotencyKey,
      proposalId: plan.proposalId,
      actionId: plan.actionId,
      contentCalendarItemId: plan.contentCalendarItemId,
      contentRevision: plan.contentRevision,
      platform: plan.platform,
      accountRef: plan.accountRef,
      externalAccountId: plan.externalAccountId,
      status: SocialPublishingAttemptStatus.PLANNED,
      nextAttemptAt: now,
      events: {
        create: {
          eventType: SocialPublishingAttemptEventType.PLANNED,
          actorUserId,
          fromStatus: null,
          toStatus: SocialPublishingAttemptStatus.PLANNED,
          attemptNumber: 0,
          occurredAt: now,
        },
      },
    },
  });

  assertAttemptMatchesPlan(attempt, plan, idempotencyKey);
  return attempt;
}

async function invalidateAttempt(
  client: PrismaClient,
  attempt: SocialPublishingAttempt,
  actorUserId: string | null,
  now: Date,
) {
  if (
    attempt.status === SocialPublishingAttemptStatus.SUCCEEDED ||
    attempt.status === SocialPublishingAttemptStatus.DEAD_LETTER
  ) {
    return attempt;
  }

  return client.$transaction(async (transaction: Prisma.TransactionClient) => {
    const updated = await transaction.socialPublishingAttempt.updateMany({
      where: {
        id: attempt.id,
        status: attempt.status,
      },
      data: {
        status: SocialPublishingAttemptStatus.DEAD_LETTER,
        completedAt: now,
        lastErrorCode: 'DELIVERY_PLAN_INVALID',
        lockToken: null,
        lockedUntil: null,
      },
    });
    if (updated.count !== 1) {
      return transaction.socialPublishingAttempt.findUniqueOrThrow({
        where: { id: attempt.id },
      });
    }

    await transaction.socialPublishingAttemptEvent.create({
      data: {
        attemptId: attempt.id,
        eventType: SocialPublishingAttemptEventType.INVALIDATED,
        actorUserId,
        fromStatus: attempt.status,
        toStatus: SocialPublishingAttemptStatus.DEAD_LETTER,
        attemptNumber: attempt.attemptCount,
        errorCode: 'DELIVERY_PLAN_INVALID',
        occurredAt: now,
      },
    });

    return transaction.socialPublishingAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    });
  });
}

export async function executeSocialPublishingAttempt(
  client: PrismaClient,
  input: {
    attemptId: string;
    actorUserId?: string | null;
    provider: SocialPublishingProvider;
    now?: Date;
  },
): Promise<ExecuteSocialPublishingAttemptResult> {
  const attemptId = identifierSchema.parse(input.attemptId);
  const actorUserId = input.actorUserId
    ? identifierSchema.parse(input.actorUserId)
    : null;
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing execution time is invalid');
  }

  const initial = await client.socialPublishingAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!initial) throw new Error('Social publishing attempt not found');
  if (
    initial.status === SocialPublishingAttemptStatus.SUCCEEDED ||
    initial.status === SocialPublishingAttemptStatus.DEAD_LETTER
  ) {
    return { attempt: initial, providerInvoked: false };
  }
  if (initial.status === SocialPublishingAttemptStatus.IN_PROGRESS) {
    return { attempt: initial, providerInvoked: false };
  }
  if (initial.nextAttemptAt.getTime() > now.getTime()) {
    return { attempt: initial, providerInvoked: false };
  }

  let plan: SocialPublishingDeliveryPlan;
  try {
    plan = await materializeSocialPublishingDeliveryPlan(
      client,
      initial.proposalId,
    );
    assertAttemptMatchesPlan(
      initial,
      plan,
      buildSocialPublishingIdempotencyKey(plan),
    );
  } catch {
    return {
      attempt: await invalidateAttempt(client, initial, actorUserId, now),
      providerInvoked: false,
    };
  }

  const lockToken = randomUUID();
  const attemptNumber = initial.attemptCount + 1;
  const claimed = await client.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const update = await transaction.socialPublishingAttempt.updateMany({
        where: {
          id: initial.id,
          status: {
            in: [
              SocialPublishingAttemptStatus.PLANNED,
              SocialPublishingAttemptStatus.RETRY_SCHEDULED,
            ],
          },
          nextAttemptAt: { lte: now },
          lockToken: null,
        },
        data: {
          status: SocialPublishingAttemptStatus.IN_PROGRESS,
          attemptCount: attemptNumber,
          lockToken,
          lockedUntil: new Date(now.getTime() + SOCIAL_PUBLISHING_LOCK_MS),
          startedAt: now,
          completedAt: null,
        },
      });
      if (update.count !== 1) return null;

      await transaction.socialPublishingAttemptEvent.create({
        data: {
          attemptId: initial.id,
          eventType: SocialPublishingAttemptEventType.STARTED,
          actorUserId,
          fromStatus: initial.status,
          toStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
          attemptNumber,
          occurredAt: now,
        },
      });

      return transaction.socialPublishingAttempt.findUniqueOrThrow({
        where: { id: initial.id },
      });
    },
  );

  if (!claimed) {
    return {
      attempt: await client.socialPublishingAttempt.findUniqueOrThrow({
        where: { id: initial.id },
      }),
      providerInvoked: false,
    };
  }

  try {
    const result = await input.provider.publish({
      plan,
      idempotencyKey: claimed.idempotencyKey,
    });
    const providerReference = providerReferenceSchema.parse(
      result.providerReference,
    );

    const succeeded = await client.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const update = await transaction.socialPublishingAttempt.updateMany({
          where: {
            id: claimed.id,
            status: SocialPublishingAttemptStatus.IN_PROGRESS,
            lockToken,
          },
          data: {
            status: SocialPublishingAttemptStatus.SUCCEEDED,
            providerReference,
            lastErrorCode: null,
            completedAt: now,
            lockToken: null,
            lockedUntil: null,
          },
        });
        if (update.count !== 1) {
          return transaction.socialPublishingAttempt.findUniqueOrThrow({
            where: { id: claimed.id },
          });
        }

        await transaction.socialPublishingAttemptEvent.create({
          data: {
            attemptId: claimed.id,
            eventType: SocialPublishingAttemptEventType.SUCCEEDED,
            actorUserId,
            fromStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
            toStatus: SocialPublishingAttemptStatus.SUCCEEDED,
            attemptNumber,
            providerReference,
            occurredAt: now,
          },
        });

        return transaction.socialPublishingAttempt.findUniqueOrThrow({
          where: { id: claimed.id },
        });
      },
    );

    return { attempt: succeeded, providerInvoked: true };
  } catch {
    const retryDelay = socialPublishingRetryDelayMs(attemptNumber);
    const nextStatus =
      retryDelay == null
        ? SocialPublishingAttemptStatus.DEAD_LETTER
        : SocialPublishingAttemptStatus.RETRY_SCHEDULED;
    const failed = await client.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const update = await transaction.socialPublishingAttempt.updateMany({
          where: {
            id: claimed.id,
            status: SocialPublishingAttemptStatus.IN_PROGRESS,
            lockToken,
          },
          data: {
            status: nextStatus,
            nextAttemptAt:
              retryDelay == null
                ? claimed.nextAttemptAt
                : new Date(now.getTime() + retryDelay),
            lastErrorCode: 'PROVIDER_ERROR',
            completedAt: retryDelay == null ? now : null,
            lockToken: null,
            lockedUntil: null,
          },
        });
        if (update.count !== 1) {
          return transaction.socialPublishingAttempt.findUniqueOrThrow({
            where: { id: claimed.id },
          });
        }

        await transaction.socialPublishingAttemptEvent.create({
          data: {
            attemptId: claimed.id,
            eventType: SocialPublishingAttemptEventType.PROVIDER_FAILED,
            actorUserId,
            fromStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
            toStatus: nextStatus,
            attemptNumber,
            errorCode: 'PROVIDER_ERROR',
            occurredAt: now,
          },
        });

        return transaction.socialPublishingAttempt.findUniqueOrThrow({
          where: { id: claimed.id },
        });
      },
    );

    return { attempt: failed, providerInvoked: true };
  }
}
