import { aiOperatorSetFollowUpExecutionActionSchema } from '@luminol/validation/ai-operator';

import {
  AiOperatorProposalEventType,
  AiOperatorProposalStatus,
  type PrismaClient,
} from '../generated/prisma/client';
import { evaluateAiOperatorExecutionReadiness } from './ai-operator-execution-readiness';
import { updateEnquiryFollowUpPlanWithAudit } from './enquiry-follow-up';

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('AI Operator follow-up date is invalid');
  }
  return date;
}

export function parseSupportedAiOperatorCrmExecution(input: unknown) {
  const parsed = aiOperatorSetFollowUpExecutionActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      'AI Operator proposal action is not supported by this executor',
    );
  }
  return parsed.data;
}

export async function executeApprovedAiOperatorProposal(
  client: PrismaClient,
  input: {
    proposalId: string;
    actorUserId: string;
    now?: Date;
  },
) {
  const proposalId = requireIdentifier(
    input.proposalId,
    'AI Operator proposal ID',
  );
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'AI Operator executor actor user ID',
  );
  const executedAt = input.now ?? new Date();
  if (!Number.isFinite(executedAt.getTime())) {
    throw new Error('AI Operator execution time is invalid');
  }

  return client.$transaction(async (transaction) => {
    const proposal = await transaction.aiOperatorProposal.findUnique({
      where: { id: proposalId },
    });
    if (!proposal) throw new Error('AI Operator proposal not found');

    const readiness = evaluateAiOperatorExecutionReadiness(proposal);
    if (readiness.status !== 'READY_FOR_EXECUTOR') {
      throw new Error(
        `AI Operator proposal is not ready for execution: ${readiness.status}`,
      );
    }

    const action = parseSupportedAiOperatorCrmExecution(
      proposal.actionEnvelope,
    );
    if (!proposal.decidedAt) {
      throw new Error('Approved AI Operator proposal is missing decision time');
    }
    if (executedAt.getTime() < proposal.decidedAt.getTime()) {
      throw new Error('AI Operator execution cannot predate approval');
    }

    const claimed = await transaction.aiOperatorProposal.updateMany({
      where: {
        id: proposal.id,
        status: AiOperatorProposalStatus.APPROVED,
        executedByUserId: null,
        executedAt: null,
      },
      data: {
        status: AiOperatorProposalStatus.EXECUTED,
        executedByUserId: actorUserId,
        executedAt,
      },
    });
    if (claimed.count !== 1) {
      throw new Error('AI Operator proposal was executed by another operator');
    }

    const followUp = await updateEnquiryFollowUpPlanWithAudit(transaction, {
      enquiryId: action.target.enquiryId,
      actorUserId,
      plan: {
        nextFollowUpAt: parseDateOnly(action.payload.parameters.nextFollowUpOn),
        nextAction: action.payload.parameters.nextAction,
      },
    });
    if (!followUp.changed) {
      throw new Error(
        'AI Operator CRM target already matches the proposed follow-up plan',
      );
    }

    await transaction.aiOperatorProposalEvent.create({
      data: {
        proposalId: proposal.id,
        eventType: AiOperatorProposalEventType.EXECUTED,
        actorUserId,
        fromStatus: AiOperatorProposalStatus.APPROVED,
        toStatus: AiOperatorProposalStatus.EXECUTED,
        occurredAt: executedAt,
      },
    });

    const executedProposal =
      await transaction.aiOperatorProposal.findUniqueOrThrow({
        where: { id: proposal.id },
        include: { events: { orderBy: { occurredAt: 'asc' } } },
      });

    return { proposal: executedProposal, followUp };
  });
}
