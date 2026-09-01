import { describe, expect, it } from 'vitest';

import {
  aiOperatorActionSchema,
  aiOperatorExecutionPolicyByKind,
  aiOperatorOpenEnquiryQueueActionSchema,
  aiOperatorPublishSocialContentActionSchema,
  aiOperatorSetFollowUpExecutionActionSchema,
} from './ai-operator';

describe('AI Operator action contract', () => {
  it('keeps navigation read-only and all reserved side-effect classes approval-required', () => {
    expect(aiOperatorExecutionPolicyByKind).toEqual({
      OPEN_ENQUIRY_QUEUE: 'read_only',
      UPDATE_ENQUIRY_WORKFLOW: 'approval_required',
      SEND_OUTBOUND_MESSAGE: 'approval_required',
      PUBLISH_SOCIAL_CONTENT: 'approval_required',
    });
  });

  it('accepts a versioned protected enquiry queue navigation action', () => {
    expect(
      aiOperatorOpenEnquiryQueueActionSchema.parse({
        version: '1',
        actionId: 'ops-brief:v1:pastDueFollowUp:all',
        kind: 'OPEN_ENQUIRY_QUEUE',
        executionPolicy: 'read_only',
        source: {
          surface: 'operations_dashboard',
          observationKind: 'pastDueFollowUp',
        },
        target: { surface: 'admin_enquiries' },
        payload: { query: 'followUpTiming=pastDue' },
      }),
    ).toMatchObject({
      kind: 'OPEN_ENQUIRY_QUEUE',
      executionPolicy: 'read_only',
      payload: { query: 'followUpTiming=pastDue' },
    });
  });

  it.each([
    'https://example.com/enquiries?attention=unassigned',
    '?attention=unassigned',
    'attention=unassigned&followUpTiming=pastDue',
    'status=NEW',
    'followUpTiming=next24Hours',
  ])('rejects unsupported queue query %s', (query) => {
    expect(() =>
      aiOperatorOpenEnquiryQueueActionSchema.parse({
        version: '1',
        actionId: 'ops-brief:v1:unassigned:all',
        kind: 'OPEN_ENQUIRY_QUEUE',
        executionPolicy: 'read_only',
        source: {
          surface: 'operations_dashboard',
          observationKind: 'unassigned',
        },
        target: { surface: 'admin_enquiries' },
        payload: { query },
      }),
    ).toThrow();
  });

  it('rejects a navigation action that claims side-effect execution policy', () => {
    expect(() =>
      aiOperatorActionSchema.parse({
        version: '1',
        actionId: 'ops-brief:v1:unassigned:all',
        kind: 'OPEN_ENQUIRY_QUEUE',
        executionPolicy: 'autonomous_allowed',
        source: {
          surface: 'operations_dashboard',
          observationKind: 'unassigned',
        },
        target: { surface: 'admin_enquiries' },
        payload: { query: 'attention=unassigned' },
      }),
    ).toThrow();
  });

  it('rejects unknown action kinds instead of falling through', () => {
    expect(() =>
      aiOperatorActionSchema.parse({
        version: '1',
        actionId: 'operator:v1:unknown:test',
        kind: 'DO_ANYTHING',
        executionPolicy: 'autonomous_allowed',
        source: { surface: 'ai_operator', reference: 'test' },
        target: { surface: 'unknown' },
        payload: {},
      }),
    ).toThrow();
  });

  it('requires approval for the reserved social-publish action class', () => {
    const action = {
      version: '1',
      actionId: 'content-calendar:v1:publish:item-123',
      kind: 'PUBLISH_SOCIAL_CONTENT',
      source: { surface: 'content_calendar', reference: 'item-123' },
      target: {
        surface: 'social_account',
        platform: 'INSTAGRAM',
        accountRef: 'luminol-academy-instagram',
      },
      payload: { contentCalendarItemId: 'item-123' },
    } as const;

    expect(
      aiOperatorPublishSocialContentActionSchema.parse({
        ...action,
        executionPolicy: 'approval_required',
      }).executionPolicy,
    ).toBe('approval_required');

    expect(() =>
      aiOperatorPublishSocialContentActionSchema.parse({
        ...action,
        executionPolicy: 'autonomous_allowed',
      }),
    ).toThrow();
  });

  it('accepts only the bounded SET_FOLLOW_UP execution payload', () => {
    const action = {
      version: '1',
      actionId: 'operator:v1:follow-up:enquiry-123',
      kind: 'UPDATE_ENQUIRY_WORKFLOW',
      executionPolicy: 'approval_required',
      source: { surface: 'ai_operator', reference: 'follow-up:test' },
      target: { surface: 'crm_enquiry', enquiryId: 'enquiry-123' },
      payload: {
        operation: 'SET_FOLLOW_UP',
        parameters: {
          nextFollowUpOn: '2026-09-04',
          nextAction: 'Confirm course availability',
        },
      },
    } as const;

    expect(aiOperatorSetFollowUpExecutionActionSchema.parse(action)).toEqual(
      action,
    );

    expect(() =>
      aiOperatorSetFollowUpExecutionActionSchema.parse({
        ...action,
        payload: {
          ...action.payload,
          parameters: {
            ...action.payload.parameters,
            nextFollowUpOn: '2026-02-30',
          },
        },
      }),
    ).toThrow();

    expect(() =>
      aiOperatorSetFollowUpExecutionActionSchema.parse({
        ...action,
        payload: {
          ...action.payload,
          parameters: {
            ...action.payload.parameters,
            unexpected: 'not executable',
          },
        },
      }),
    ).toThrow();

    expect(() =>
      aiOperatorSetFollowUpExecutionActionSchema.parse({
        ...action,
        payload: {
          operation: 'ASSIGN_OWNER',
          parameters: action.payload.parameters,
        },
      }),
    ).toThrow();
  });
});
