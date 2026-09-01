import {
  aiOperatorExecutionPolicyByKind,
  aiOperatorOpenEnquiryQueueActionSchema,
  type AiOperatorOpenEnquiryQueueAction,
} from '@luminol/validation/ai-operator';

import type {
  AiOperationsBrief,
  AiOperationsBriefItem,
} from './ai-operations-brief';

export type AiOperationsBriefAction = {
  item: AiOperationsBriefItem;
  action: AiOperatorOpenEnquiryQueueAction;
};

function getActionDiscriminator(item: AiOperationsBriefItem): string {
  return item.qualificationGap ?? item.attributionGap ?? 'queue';
}

function buildActionId(item: AiOperationsBriefItem): string {
  return `ops-brief:v1:${item.kind}:${getActionDiscriminator(item)}`;
}

export function buildAiOperationsBriefActions(
  brief: AiOperationsBrief,
): AiOperationsBriefAction[] {
  return brief.items.map((item) => ({
    item,
    action: aiOperatorOpenEnquiryQueueActionSchema.parse({
      version: '1',
      actionId: buildActionId(item),
      kind: 'OPEN_ENQUIRY_QUEUE',
      executionPolicy: aiOperatorExecutionPolicyByKind.OPEN_ENQUIRY_QUEUE,
      source: {
        surface: 'operations_dashboard',
        observationKind: item.kind,
      },
      target: { surface: 'admin_enquiries' },
      payload: { query: item.query },
    }),
  }));
}
