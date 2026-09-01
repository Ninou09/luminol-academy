import { describe, expect, test } from 'vitest';

import { parseApprovalRequiredAiOperatorAction } from './ai-operator-proposals';

const approvalAction = {
  version: '1',
  actionId: 'operator:update-enquiry:test',
  kind: 'UPDATE_ENQUIRY_WORKFLOW',
  executionPolicy: 'approval_required',
  source: {
    surface: 'ai_operator',
    reference: 'brief:test',
  },
  target: {
    surface: 'crm_enquiry',
    enquiryId: 'enquiry-test',
  },
  payload: {
    operation: 'SET_FOLLOW_UP',
    parameters: {
      nextFollowUpOn: '2026-09-02',
      nextAction: 'Confirm programme interest',
    },
  },
} as const;

describe('AI Operator proposal validation', () => {
  test('accepts a validated approval-required action', () => {
    expect(parseApprovalRequiredAiOperatorAction(approvalAction)).toEqual(
      approvalAction,
    );
  });

  test('rejects read-only navigation actions from the approval queue', () => {
    expect(() =>
      parseApprovalRequiredAiOperatorAction({
        version: '1',
        actionId: 'operator:queue:test',
        kind: 'OPEN_ENQUIRY_QUEUE',
        executionPolicy: 'read_only',
        source: {
          surface: 'operations_dashboard',
          observationKind: 'unassigned',
        },
        target: { surface: 'admin_enquiries' },
        payload: { query: 'attention=unassigned' },
      }),
    ).toThrow('not eligible for the approval queue');
  });

  test('rejects malformed or unknown action kinds before persistence', () => {
    expect(() =>
      parseApprovalRequiredAiOperatorAction({
        ...approvalAction,
        kind: 'DELETE_EVERYTHING',
      }),
    ).toThrow();
  });

  test('rejects non-JSON values in an otherwise valid action payload', () => {
    expect(() =>
      parseApprovalRequiredAiOperatorAction({
        ...approvalAction,
        payload: {
          ...approvalAction.payload,
          parameters: { nextAction: undefined },
        },
      }),
    ).toThrow('must be JSON-safe');
  });
});
