import { aiOperatorPublishSocialContentActionSchema } from '@luminol/validation/ai-operator';
import {
  contentCalendarAccountRefSchema,
  contentCalendarPlatformSchema,
} from '@luminol/validation/content-calendar';

import {
  AiOperatorProposalStatus,
  ContentCalendarStatus,
  SocialPublishingAccountEventType,
  type AiOperatorProposal,
  type ContentCalendarItem,
  type PrismaClient,
  type SocialPublishingAccount,
} from '../generated/prisma/client';
import { evaluateAiOperatorExecutionReadiness } from './ai-operator-execution-readiness';

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function requireDisplayName(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 160) {
    throw new Error('Social publishing account display name is invalid');
  }
  return normalized;
}

function requireExternalAccountId(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error('Social publishing external account ID is invalid');
  }
  return normalized;
}

export async function createSocialPublishingAccount(
  client: PrismaClient,
  input: {
    actorUserId: string;
    accountRef: string;
    platform: string;
    displayName: string;
    externalAccountId: string;
    now?: Date;
  },
) {
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Social publishing actor user ID',
  );
  const accountRef = contentCalendarAccountRefSchema.parse(input.accountRef);
  const platform = contentCalendarPlatformSchema.parse(input.platform);
  const displayName = requireDisplayName(input.displayName);
  const externalAccountId = requireExternalAccountId(input.externalAccountId);
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing account change time is invalid');
  }

  return client.$transaction(async (transaction) => {
    const account = await transaction.socialPublishingAccount.create({
      data: {
        accountRef,
        platform,
        displayName,
        externalAccountId,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      },
    });

    await transaction.socialPublishingAccountEvent.create({
      data: {
        accountId: account.id,
        eventType: SocialPublishingAccountEventType.CREATED,
        actorUserId,
        fromActive: null,
        toActive: true,
        occurredAt: now,
      },
    });

    return account;
  });
}

export async function setSocialPublishingAccountActive(
  client: PrismaClient,
  input: {
    accountId: string;
    expectedActive: boolean;
    active: boolean;
    actorUserId: string;
    now?: Date;
  },
) {
  const accountId = requireIdentifier(input.accountId, 'Social publishing account ID');
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Social publishing actor user ID',
  );
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing account change time is invalid');
  }

  return client.$transaction(async (transaction) => {
    const current = await transaction.socialPublishingAccount.findUnique({
      where: { id: accountId },
    });
    if (!current) throw new Error('Social publishing account not found');
    if (current.active !== input.expectedActive) {
      throw new Error('Social publishing account was updated by another operator');
    }
    if (current.active === input.active) return current;

    const updated = await transaction.socialPublishingAccount.updateMany({
      where: { id: current.id, active: input.expectedActive },
      data: {
        active: input.active,
        updatedByUserId: actorUserId,
      },
    });
    if (updated.count !== 1) {
      throw new Error('Social publishing account was updated by another operator');
    }

    await transaction.socialPublishingAccountEvent.create({
      data: {
        accountId: current.id,
        eventType: SocialPublishingAccountEventType.ACTIVATION_CHANGED,
        actorUserId,
        fromActive: current.active,
        toActive: input.active,
        occurredAt: now,
      },
    });

    return transaction.socialPublishingAccount.findUniqueOrThrow({
      where: { id: current.id },
    });
  });
}

export type SocialPublishingDeliveryPlan = {
  proposalId: string;
  actionId: string;
  platform: 'INSTAGRAM' | 'FACEBOOK';
  accountRef: string;
  externalAccountId: string;
  contentCalendarItemId: string;
  contentRevision: number;
  format: string;
  caption: string;
  assetReference: string;
  scheduledFor: Date | null;
  timezone: string | null;
};

type DeliveryProposal = Pick<
  AiOperatorProposal,
  | 'id'
  | 'actionId'
  | 'actionVersion'
  | 'actionKind'
  | 'executionPolicy'
  | 'sourceSurface'
  | 'sourceReference'
  | 'actionEnvelope'
  | 'status'
>;

type DeliveryContent = Pick<
  ContentCalendarItem,
  | 'id'
  | 'revision'
  | 'status'
  | 'platform'
  | 'accountRef'
  | 'format'
  | 'caption'
  | 'assetReference'
  | 'scheduledFor'
  | 'timezone'
>;

type DeliveryAccount = Pick<
  SocialPublishingAccount,
  'accountRef' | 'platform' | 'externalAccountId' | 'active'
>;

export function buildSocialPublishingDeliveryPlan(input: {
  proposal: DeliveryProposal;
  content: DeliveryContent;
  account: DeliveryAccount;
}): SocialPublishingDeliveryPlan {
  const readiness = evaluateAiOperatorExecutionReadiness(input.proposal);
  if (readiness.status !== 'READY_FOR_EXECUTOR') {
    throw new Error(`Social publishing proposal is not ready: ${readiness.status}`);
  }
  if (input.proposal.status !== AiOperatorProposalStatus.APPROVED) {
    throw new Error('Social publishing proposal is not approved');
  }

  const action = aiOperatorPublishSocialContentActionSchema.parse(
    input.proposal.actionEnvelope,
  );
  if (action.actionId !== input.proposal.actionId) {
    throw new Error('Social publishing proposal action ID mismatch');
  }
  if (
    input.content.status !== ContentCalendarStatus.READY &&
    input.content.status !== ContentCalendarStatus.SCHEDULED
  ) {
    throw new Error('Social publishing content is no longer publishable');
  }
  if (
    input.content.id !== action.payload.contentCalendarItemId ||
    input.content.revision !== action.payload.contentRevision
  ) {
    throw new Error('Social publishing content revision no longer matches approval');
  }
  if (
    input.content.platform !== action.target.platform ||
    input.content.accountRef !== action.target.accountRef
  ) {
    throw new Error('Social publishing content target no longer matches approval');
  }
  if (!input.account.active) {
    throw new Error('Social publishing account is inactive');
  }
  if (
    input.account.platform !== action.target.platform ||
    input.account.accountRef !== action.target.accountRef
  ) {
    throw new Error('Social publishing account target mismatch');
  }
  if (!input.content.assetReference) {
    throw new Error('Social publishing content requires an asset reference');
  }

  return {
    proposalId: input.proposal.id,
    actionId: action.actionId,
    platform: action.target.platform,
    accountRef: action.target.accountRef,
    externalAccountId: input.account.externalAccountId,
    contentCalendarItemId: input.content.id,
    contentRevision: input.content.revision,
    format: input.content.format,
    caption: input.content.caption,
    assetReference: input.content.assetReference,
    scheduledFor: input.content.scheduledFor,
    timezone: input.content.timezone,
  };
}

export async function materializeSocialPublishingDeliveryPlan(
  client: PrismaClient,
  proposalId: string,
) {
  const normalizedProposalId = requireIdentifier(
    proposalId,
    'AI Operator proposal ID',
  );
  const proposal = await client.aiOperatorProposal.findUnique({
    where: { id: normalizedProposalId },
  });
  if (!proposal) throw new Error('AI Operator proposal not found');

  const action = aiOperatorPublishSocialContentActionSchema.parse(
    proposal.actionEnvelope,
  );
  const [content, account] = await Promise.all([
    client.contentCalendarItem.findUnique({
      where: { id: action.payload.contentCalendarItemId },
    }),
    client.socialPublishingAccount.findUnique({
      where: { accountRef: action.target.accountRef },
    }),
  ]);

  if (!content) throw new Error('Social publishing content not found');
  if (!account) throw new Error('Social publishing account not found');

  return buildSocialPublishingDeliveryPlan({ proposal, content, account });
}
