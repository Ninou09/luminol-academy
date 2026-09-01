import {
  aiOperatorActionSchema,
  aiOperatorExecutionPolicyByKind,
} from '@luminol/validation/ai-operator';

import {
  AiOperatorProposalStatus,
  type AiOperatorProposal,
} from '../generated/prisma/client';

export type AiOperatorExecutionReadinessStatus =
  | 'READY_FOR_EXECUTOR'
  | 'NOT_APPROVED'
  | 'INVALID_ENVELOPE'
  | 'METADATA_MISMATCH';

export type AiOperatorExecutionReadiness = {
  status: AiOperatorExecutionReadinessStatus;
  checks: {
    envelopeValid: boolean;
    metadataMatches: boolean;
    approvalState: boolean;
    policyRegistered: boolean;
  };
};

type ExecutionReadinessProposal = Pick<
  AiOperatorProposal,
  | 'actionId'
  | 'actionVersion'
  | 'actionKind'
  | 'executionPolicy'
  | 'sourceSurface'
  | 'sourceReference'
  | 'actionEnvelope'
  | 'status'
>;

function emptyChecks() {
  return {
    envelopeValid: false,
    metadataMatches: false,
    approvalState: false,
    policyRegistered: false,
  };
}

export function evaluateAiOperatorExecutionReadiness(
  proposal: ExecutionReadinessProposal,
): AiOperatorExecutionReadiness {
  const parsed = aiOperatorActionSchema.safeParse(proposal.actionEnvelope);
  if (!parsed.success) {
    return {
      status: 'INVALID_ENVELOPE',
      checks: emptyChecks(),
    };
  }

  const action = parsed.data;
  const registeredPolicy = aiOperatorExecutionPolicyByKind[action.kind];
  const policyRegistered =
    registeredPolicy === 'approval_required' &&
    action.executionPolicy === 'approval_required';
  const metadataMatches =
    proposal.actionId === action.actionId &&
    proposal.actionVersion === action.version &&
    proposal.actionKind === action.kind &&
    proposal.executionPolicy === action.executionPolicy &&
    proposal.sourceSurface === action.source.surface &&
    'reference' in action.source &&
    proposal.sourceReference === action.source.reference;
  const approvalState = proposal.status === AiOperatorProposalStatus.APPROVED;

  const checks = {
    envelopeValid: true,
    metadataMatches,
    approvalState,
    policyRegistered,
  };

  if (!metadataMatches || !policyRegistered) {
    return { status: 'METADATA_MISMATCH', checks };
  }
  if (!approvalState) {
    return { status: 'NOT_APPROVED', checks };
  }

  return { status: 'READY_FOR_EXECUTOR', checks };
}
