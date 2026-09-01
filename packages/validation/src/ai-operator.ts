import { z } from 'zod';

export const aiOperatorActionVersionSchema = z.literal('1');

export const aiOperatorActionKindSchema = z.enum([
  'OPEN_ENQUIRY_QUEUE',
  'UPDATE_ENQUIRY_WORKFLOW',
  'SEND_OUTBOUND_MESSAGE',
  'PUBLISH_SOCIAL_CONTENT',
]);

export const aiOperatorExecutionPolicySchema = z.enum([
  'read_only',
  'approval_required',
  'autonomous_allowed',
]);

export type AiOperatorActionKind = z.infer<typeof aiOperatorActionKindSchema>;
export type AiOperatorExecutionPolicy = z.infer<
  typeof aiOperatorExecutionPolicySchema
>;

export const aiOperatorExecutionPolicyByKind = {
  OPEN_ENQUIRY_QUEUE: 'read_only',
  UPDATE_ENQUIRY_WORKFLOW: 'approval_required',
  SEND_OUTBOUND_MESSAGE: 'approval_required',
  PUBLISH_SOCIAL_CONTENT: 'approval_required',
} as const satisfies Record<AiOperatorActionKind, AiOperatorExecutionPolicy>;

const actionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(255)
  .regex(/^[A-Za-z0-9:_-]+$/);

const sourceReferenceSchema = z.string().trim().min(1).max(255);
const resourceIdSchema = z.string().trim().min(1).max(255);

export const aiOperatorOperationsBriefObservationKindSchema = z.enum([
  'unassigned',
  'pastDueFollowUp',
  'missingFollowUpPlan',
  'qualificationGap',
  'missingOutcome',
  'attributionGap',
]);

const enquiryQueueQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(400)
  .refine((value) => {
    if (value.startsWith('?') || value.includes('#') || value.includes('://')) {
      return false;
    }

    const entries = Array.from(new URLSearchParams(value).entries());
    if (entries.length !== 1) return false;

    const entry = entries[0];
    if (!entry) return false;
    const [key, queryValue] = entry;

    if (key === 'attention') {
      return (
        queryValue === 'unassigned' || queryValue === 'closed-without-outcome'
      );
    }
    if (key === 'followUpTiming') {
      return queryValue === 'pastDue' || queryValue === 'missingPlan';
    }
    if (key === 'qualificationGap') {
      return [
        'city',
        'preferredContact',
        'deliveryPreference',
        'timingPreference',
      ].includes(queryValue);
    }
    if (key === 'attributionGap') {
      return [
        'utmSource',
        'utmMedium',
        'utmCampaign',
        'utmContent',
        'landingPath',
      ].includes(queryValue);
    }

    return false;
  }, 'Unsupported protected enquiry queue query');

export const aiOperatorOpenEnquiryQueueActionSchema = z
  .object({
    version: aiOperatorActionVersionSchema,
    actionId: actionIdSchema,
    kind: z.literal('OPEN_ENQUIRY_QUEUE'),
    executionPolicy: z.literal(
      aiOperatorExecutionPolicyByKind.OPEN_ENQUIRY_QUEUE,
    ),
    source: z
      .object({
        surface: z.literal('operations_dashboard'),
        observationKind: aiOperatorOperationsBriefObservationKindSchema,
      })
      .strict(),
    target: z.object({ surface: z.literal('admin_enquiries') }).strict(),
    payload: z.object({ query: enquiryQueueQuerySchema }).strict(),
  })
  .strict();

const sideEffectSourceSchema = z
  .object({
    surface: z.enum([
      'ai_operator',
      'operations_dashboard',
      'content_calendar',
    ]),
    reference: sourceReferenceSchema,
  })
  .strict();

export const aiOperatorUpdateEnquiryWorkflowActionSchema = z
  .object({
    version: aiOperatorActionVersionSchema,
    actionId: actionIdSchema,
    kind: z.literal('UPDATE_ENQUIRY_WORKFLOW'),
    executionPolicy: z.literal(
      aiOperatorExecutionPolicyByKind.UPDATE_ENQUIRY_WORKFLOW,
    ),
    source: sideEffectSourceSchema,
    target: z
      .object({
        surface: z.literal('crm_enquiry'),
        enquiryId: resourceIdSchema,
      })
      .strict(),
    payload: z
      .object({
        operation: z.enum([
          'ASSIGN_OWNER',
          'SET_FOLLOW_UP',
          'TRANSITION_STATUS',
          'RECORD_OUTCOME',
        ]),
        parameters: z.record(z.string(), z.unknown()),
      })
      .strict(),
  })
  .strict();

export const aiOperatorSendOutboundMessageActionSchema = z
  .object({
    version: aiOperatorActionVersionSchema,
    actionId: actionIdSchema,
    kind: z.literal('SEND_OUTBOUND_MESSAGE'),
    executionPolicy: z.literal(
      aiOperatorExecutionPolicyByKind.SEND_OUTBOUND_MESSAGE,
    ),
    source: sideEffectSourceSchema,
    target: z
      .object({
        surface: z.literal('outbound_recipient'),
        channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
        recipientRef: resourceIdSchema,
      })
      .strict(),
    payload: z
      .object({
        templateKey: z.string().trim().min(1).max(160),
        messageRef: z.string().trim().min(1).max(255).optional(),
      })
      .strict(),
  })
  .strict();

export const aiOperatorPublishSocialContentActionSchema = z
  .object({
    version: aiOperatorActionVersionSchema,
    actionId: actionIdSchema,
    kind: z.literal('PUBLISH_SOCIAL_CONTENT'),
    executionPolicy: z.literal(
      aiOperatorExecutionPolicyByKind.PUBLISH_SOCIAL_CONTENT,
    ),
    source: sideEffectSourceSchema,
    target: z
      .object({
        surface: z.literal('social_account'),
        platform: z.enum(['INSTAGRAM', 'FACEBOOK']),
        accountRef: resourceIdSchema,
      })
      .strict(),
    payload: z
      .object({
        contentCalendarItemId: resourceIdSchema,
      })
      .strict(),
  })
  .strict();

export const aiOperatorActionSchema = z.discriminatedUnion('kind', [
  aiOperatorOpenEnquiryQueueActionSchema,
  aiOperatorUpdateEnquiryWorkflowActionSchema,
  aiOperatorSendOutboundMessageActionSchema,
  aiOperatorPublishSocialContentActionSchema,
]);

export type AiOperatorAction = z.infer<typeof aiOperatorActionSchema>;
export type AiOperatorOpenEnquiryQueueAction = z.infer<
  typeof aiOperatorOpenEnquiryQueueActionSchema
>;
