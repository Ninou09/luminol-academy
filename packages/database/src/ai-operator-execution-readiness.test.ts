import { describe, expect, test } from 'vitest';

import { AiOperatorProposalStatus } from '../generated/prisma/client';
import { evaluateAiOperatorExecutionReadiness } from './ai-operator-execution-readiness';

const action = {
  version: '1',
  actionId: 'operator:update-enquiry:readiness',
  kind: 'UPDATE_ENQUIRY_WORKFLOW',
  executionPolicy: 'approval_required',
  source: {
    surface: 'ai_operator',
    reference: 'readiness:test',
  },
  target: {
    surface: 'crm_enquiry',
    enquiryId: 'enquiry-readiness',
  },
  payload: {
    operation: 'SET_FOLLOW_UP',
    parameters: {
      nextFollowUpOn: '2026-09-03',
    },
  },
} as const;

function proposal(
  overrides: Partial<{
    actionId: string;
    actionVersion: string;
    actionKind: string;
    executionPolicy: string;
    sourceSurface: string;
    sourceReference: string;
    actionEnvelope: unknown;
    status: AiOperatorProposalStatus;
  }> = {},
) {
  return {
    actionId: action.actionId,
    actionVersion: action.version,
    actionKind: action.kind,
    executionPolicy: action.executionPolicy,
    sourceSurface: action.source.surface,
    sourceReference: action.source.reference,
    actionEnvelope: action,
    status: AiOperatorProposalStatus.APPROVED,
    ...overrides,
  };
}

describe('AI Operator execution readiness', () => {
  test('marks an approved, exact, registered proposal ready for a future executor', () => {
    expect(evaluateAiOperatorExecutionReadiness(proposal())).toEqual({
      status: 'READY_FOR_EXECUTOR',
      checks: {
        envelopeValid: true,
        metadataMatches: true,
        approvalState: true,
        policyRegistered: true,
      },
    });
  });

  test.each([
    AiOperatorProposalStatus.PENDING_APPROVAL,
    AiOperatorProposalStatus.REJECTED,
    AiOperatorProposalStatus.CANCELLED,
  ])('keeps %s proposals out of executor readiness', (status) => {
    const readiness = evaluateAiOperatorExecutionReadiness(proposal({ status }));

    expect(readiness.status).toBe('NOT_APPROVED');
    expect(readiness.checks.approvalState).toBe(false);
  });

  test('fails closed when the stored envelope no longer validates', () => {
    const readiness = evaluateAiOperatorExecutionReadiness(
      proposal({ actionEnvelope: { ...action, executionPolicy: 'read_only' } }),
    );

    expect(readiness.status).toBe('INVALID_ENVELOPE');
    expect(readiness.checks.envelopeValid).toBe(false);
  });

  test('fails closed when persisted metadata does not match the reviewed envelope', () => {
    const readiness = evaluateAiOperatorExecutionReadiness(
      proposal({ sourceReference: 'different:reference' }),
    );

    expect(readiness.status).toBe('METADATA_MISMATCH');
    expect(readiness.checks).toMatchObject({
      envelopeValid: true,
      metadataMatches: false,
      approvalState: true,
      policyRegistered: true,
    });
  });

  test('does not treat a read-only action as executor-ready even if injected into proposal-shaped data', () => {
    const readOnlyAction = {
      version: '1',
      actionId: 'operator:open-enquiry:readiness',
      kind: 'OPEN_ENQUIRY_QUEUE',
      executionPolicy: 'read_only',
      source: {
        surface: 'operations_dashboard',
        observationKind: 'unassigned',
      },
      target: { surface: 'admin_enquiries' },
      payload: { query: 'attention=unassigned' },
    } as const;

    const readiness = evaluateAiOperatorExecutionReadiness(
      proposal({
        actionId: readOnlyAction.actionId,
        actionKind: readOnlyAction.kind,
        executionPolicy: readOnlyAction.executionPolicy,
        sourceSurface: readOnlyAction.source.surface,
        sourceReference: 'not-applicable',
        actionEnvelope: readOnlyAction,
      }),
    );

    expect(readiness.status).toBe('METADATA_MISMATCH');
    expect(readiness.checks.policyRegistered).toBe(false);
  });
});
