import {
  aiOperatorActionSchema,
  aiOperatorExecutionPolicyByKind,
  type AiOperatorAction,
} from '@luminol/validation/ai-operator';

import {
  AiOperatorProposalEventType,
  AiOperatorProposalStatus,
  type AiOperatorProposal,
  Prisma,
  type PrismaClient,
} from '../generated/prisma/client';

export type ApprovalRequiredAiOperatorAction = Exclude<
  AiOperatorAction,
  { kind: 'OPEN_ENQUIRY_QUEUE' }
>;

export type AiOperatorProposalDecision = 'APPROVED' | 'REJECTED' | 'CANCELLED';

const decisionStatusByType = {
  APPROVED: AiOperatorProposalStatus.APPROVED,
  REJECTED: AiOperatorProposalStatus.REJECTED,
  CANCELLED: AiOperatorProposalStatus.CANCELLED,
} as const;

const decisionEventByType = {
  APPROVED: AiOperatorProposalEventType.APPROVED,
  REJECTED: AiOperatorProposalEventType.REJECTED,
  CANCELLED: AiOperatorProposalEventType.CANCELLED,
} as const;

function assertJsonCompatible(value: unknown, path = 'action'):
  asserts value is Prisma.InputJsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${path} must be JSON-safe`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonCompatible(item, `${path}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(`${path} must contain only plain JSON objects`);
    }
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) throw new Error(`${path}.${key} must be JSON-safe`);
      assertJsonCompatible(item, `${path}.${key}`);
    }
    return;
  }
  throw new Error(`${path} must be JSON-safe`);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function normalizeOptionalNote(note?: string | null) {
  if (note == null) return null;
  const normalized = note.trim();
  if (!normalized) return null;
  if (normalized.length > 500) {
    throw new Error('AI Operator proposal decision note is too long');
  }
  return normalized;
}

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

export function parseApprovalRequiredAiOperatorAction(
  input: unknown,
): ApprovalRequiredAiOperatorAction {
  const action = aiOperatorActionSchema.parse(input);
  const registeredPolicy = aiOperatorExecutionPolicyByKind[action.kind];

  if (
    registeredPolicy !== 'approval_required' ||
    action.executionPolicy !== 'approval_required' ||
    action.kind === 'OPEN_ENQUIRY_QUEUE'
  ) {
    throw new Error('AI Operator action is not eligible for the approval queue');
  }

  assertJsonCompatible(action);
  return action;
}

export function assertAiOperatorProposalMatchesAction(
  proposal: Pick<
    AiOperatorProposal,
    | 'actionId'
    | 'actionVersion'
    | 'actionKind'
    | 'executionPolicy'
    | 'sourceSurface'
    | 'sourceReference'
    | 'actionEnvelope'
  >,
  action: ApprovalRequiredAiOperatorAction,
) {
  const matches =
    proposal.actionId === action.actionId &&
    proposal.actionVersion === action.version &&
    proposal.actionKind === action.kind &&
    proposal.executionPolicy === action.executionPolicy &&
    proposal.sourceSurface === action.source.surface &&
    proposal.sourceReference === action.source.reference &&
    canonicalJson(proposal.actionEnvelope) === canonicalJson(action);

  if (!matches) {
    throw new Error('AI Operator action ID already belongs to another proposal');
  }
}

export async function queueAiOperatorProposal(
  client: PrismaClient,
  input: unknown,
  proposedByUserId?: string | null,
) {
  const action = parseApprovalRequiredAiOperatorAction(input);
  const proposerId = proposedByUserId
    ? requireIdentifier(proposedByUserId, 'AI Operator proposer user ID')
    : null;

  return client.$transaction(async (transaction) => {
    const existing = await transaction.aiOperatorProposal.findUnique({
      where: { actionId: action.actionId },
    });
    if (existing) {
      assertAiOperatorProposalMatchesAction(existing, action);
      return existing;
    }

    const proposal = await transaction.aiOperatorProposal.create({
      data: {
        actionId: action.actionId,
        actionVersion: action.version,
        actionKind: action.kind,
        executionPolicy: action.executionPolicy,
        sourceSurface: action.source.surface,
        sourceReference: action.source.reference,
        actionEnvelope: action,
        proposedByUserId: proposerId,
      },
    });

    await transaction.aiOperatorProposalEvent.create({
      data: {
        proposalId: proposal.id,
        eventType: AiOperatorProposalEventType.PROPOSED,
        actorUserId: proposerId,
        fromStatus: null,
        toStatus: AiOperatorProposalStatus.PENDING_APPROVAL,
      },
    });

    return proposal;
  });
}

export async function decideAiOperatorProposal(
  client: PrismaClient,
  input: {
    proposalId: string;
    actorUserId: string;
    decision: AiOperatorProposalDecision;
    note?: string | null;
    now?: Date;
  },
) {
  const proposalId = requireIdentifier(input.proposalId, 'AI Operator proposal ID');
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'AI Operator decision actor user ID',
  );
  const decisionNote = normalizeOptionalNote(input.note);
  const toStatus = decisionStatusByType[input.decision];
  const eventType = decisionEventByType[input.decision];
  const decidedAt = input.now ?? new Date();

  return client.$transaction(async (transaction) => {
    const proposal = await transaction.aiOperatorProposal.findUnique({
      where: { id: proposalId },
      select: { id: true, status: true },
    });
    if (!proposal) throw new Error('AI Operator proposal not found');
    if (proposal.status !== AiOperatorProposalStatus.PENDING_APPROVAL) {
      throw new Error('AI Operator proposal is no longer pending approval');
    }

    const updated = await transaction.aiOperatorProposal.updateMany({
      where: {
        id: proposal.id,
        status: AiOperatorProposalStatus.PENDING_APPROVAL,
      },
      data: {
        status: toStatus,
        decidedByUserId: actorUserId,
        decidedAt,
        decisionNote,
      },
    });
    if (updated.count !== 1) {
      throw new Error('AI Operator proposal was decided by another operator');
    }

    await transaction.aiOperatorProposalEvent.create({
      data: {
        proposalId: proposal.id,
        eventType,
        actorUserId,
        fromStatus: AiOperatorProposalStatus.PENDING_APPROVAL,
        toStatus,
        note: decisionNote,
        occurredAt: decidedAt,
      },
    });

    return transaction.aiOperatorProposal.findUniqueOrThrow({
      where: { id: proposal.id },
      include: { events: { orderBy: { occurredAt: 'asc' } } },
    });
  });
}
