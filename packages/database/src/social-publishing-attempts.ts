import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';

import {
  AiOperatorProposalEventType,
  AiOperatorProposalStatus,
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

type SocialPublishingProviderInput = {
  plan: SocialPublishingDeliveryPlan;
  idempotencyKey: string;
};

export type SingleStepSocialPublishingProvider = {
  publish(
    input: SocialPublishingProviderInput,
  ): Promise<{ providerReference: string }>;
};

export type ResumableSocialPublishingProvider = {
  begin(
    input: SocialPublishingProviderInput,
  ): Promise<{ sessionReference: string }>;
  complete(
    input: SocialPublishingProviderInput & { sessionReference: string },
  ): Promise<{ providerReference: string }>;
};

export type SocialPublishingProvider =
  SingleStepSocialPublishingProvider | ResumableSocialPublishingProvider;

export type SocialPublishingProviderPhase =
  'NOT_STARTED' | 'SESSION_READY' | 'PUBLISHED';

export type ExecuteSocialPublishingAttemptResult = {
  attempt: SocialPublishingAttempt;
  providerInvoked: boolean;
};

function isResumableSocialPublishingProvider(
  provider: SocialPublishingProvider,
): provider is ResumableSocialPublishingProvider {
  return 'begin' in provider && 'complete' in provider;
}

export function getSocialPublishingProviderPhase(
  attempt: Pick<SocialPublishingAttempt, 'status' | 'providerReference'>,
): SocialPublishingProviderPhase {
  if (attempt.status === SocialPublishingAttemptStatus.SUCCEEDED) {
    return 'PUBLISHED';
  }
  if (attempt.providerReference) return 'SESSION_READY';
  return 'NOT_STARTED';
}

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
    throw new Error(
      'Social publishing attempt no longer matches delivery plan',
    );
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

  const plan = await materializeSocialPublishingDeliveryPlan(
    client,
    proposalId,
  );
  const idempotencyKey = buildSocialPublishingIdempotencyKey(plan);

  let attempt: SocialPublishingAttempt;
  try {
    attempt = await client.socialPublishingAttempt.create({
      data: {
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
  } catch (error) {
    const existing = await client.socialPublishingAttempt.findFirst({
      where: {
        OR: [{ proposalId: plan.proposalId }, { idempotencyKey }],
      },
    });
    if (!existing) throw error;
    attempt = existing;
  }

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

async function recordProviderSessionCheckpoint(
  client: PrismaClient,
  input: {
    attemptId: string;
    lockToken: string;
    actorUserId: string | null;
    attemptNumber: number;
    sessionReference: string;
    now: Date;
  },
) {
  return client.$transaction(async (transaction: Prisma.TransactionClient) => {
    const updated = await transaction.socialPublishingAttempt.updateMany({
      where: {
        id: input.attemptId,
        status: SocialPublishingAttemptStatus.IN_PROGRESS,
        lockToken: input.lockToken,
        providerReference: null,
      },
      data: { providerReference: input.sessionReference },
    });
    if (updated.count !== 1) {
      throw new Error('Social publishing provider checkpoint claim was lost');
    }

    await transaction.socialPublishingAttemptEvent.create({
      data: {
        attemptId: input.attemptId,
        eventType: SocialPublishingAttemptEventType.STARTED,
        actorUserId: input.actorUserId,
        fromStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
        toStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
        attemptNumber: input.attemptNumber,
        providerReference: input.sessionReference,
        occurredAt: input.now,
      },
    });

    return transaction.socialPublishingAttempt.findUniqueOrThrow({
      where: { id: input.attemptId },
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
  if (
    initial.status === SocialPublishingAttemptStatus.IN_PROGRESS &&
    (!initial.lockedUntil || initial.lockedUntil.getTime() > now.getTime())
  ) {
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
  const claimedResult = await client.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const update = await transaction.socialPublishingAttempt.updateMany({
        where: {
          id: initial.id,
          OR: [
            {
              status: {
                in: [
                  SocialPublishingAttemptStatus.PLANNED,
                  SocialPublishingAttemptStatus.RETRY_SCHEDULED,
                ],
              },
              nextAttemptAt: { lte: now },
              lockToken: null,
            },
            {
              status: SocialPublishingAttemptStatus.IN_PROGRESS,
              lockedUntil: { lte: now },
            },
          ],
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

  if (!claimedResult) {
    return {
      attempt: await client.socialPublishingAttempt.findUniqueOrThrow({
        where: { id: initial.id },
      }),
      providerInvoked: false,
    };
  }

  let claimed = claimedResult;

  try {
    plan = await materializeSocialPublishingDeliveryPlan(
      client,
      claimed.proposalId,
    );
    assertAttemptMatchesPlan(
      claimed,
      plan,
      buildSocialPublishingIdempotencyKey(plan),
    );
  } catch {
    return {
      attempt: await invalidateAttempt(client, claimed, actorUserId, now),
      providerInvoked: false,
    };
  }

  try {
    let providerReference: string;

    if (isResumableSocialPublishingProvider(input.provider)) {
      let sessionReference = claimed.providerReference;
      if (!sessionReference) {
        const session = await input.provider.begin({
          plan,
          idempotencyKey: claimed.idempotencyKey,
        });
        sessionReference = providerReferenceSchema.parse(
          session.sessionReference,
        );
        claimed = await recordProviderSessionCheckpoint(client, {
          attemptId: claimed.id,
          lockToken,
          actorUserId,
          attemptNumber,
          sessionReference,
          now,
        });
      }

      plan = await materializeSocialPublishingDeliveryPlan(
        client,
        claimed.proposalId,
      );
      assertAttemptMatchesPlan(
        claimed,
        plan,
        buildSocialPublishingIdempotencyKey(plan),
      );

      const result = await input.provider.complete({
        plan,
        idempotencyKey: claimed.idempotencyKey,
        sessionReference,
      });
      providerReference = providerReferenceSchema.parse(
        result.providerReference,
      );
    } else {
      const result = await input.provider.publish({
        plan,
        idempotencyKey: claimed.idempotencyKey,
      });
      providerReference = providerReferenceSchema.parse(
        result.providerReference,
      );
    }

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

        const completedProposal =
          await transaction.aiOperatorProposal.updateMany({
            where: {
              id: claimed.proposalId,
              status: AiOperatorProposalStatus.APPROVED,
              executedAt: null,
            },
            data: {
              status: AiOperatorProposalStatus.EXECUTED,
              executedByUserId: actorUserId,
              executedAt: now,
            },
          });
        if (completedProposal.count !== 1) {
          throw new Error(
            'AI Operator social publish proposal completion failed',
          );
        }

        await transaction.aiOperatorProposalEvent.create({
          data: {
            proposalId: claimed.proposalId,
            eventType: AiOperatorProposalEventType.EXECUTED,
            actorUserId,
            fromStatus: AiOperatorProposalStatus.APPROVED,
            toStatus: AiOperatorProposalStatus.EXECUTED,
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
