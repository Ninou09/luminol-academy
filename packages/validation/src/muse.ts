import { z } from 'zod';

export const museAgentSchema = z.enum([
  'main',
  'leads',
  'booking',
  'courses',
  'revenue',
  'content',
  'fettouma',
]);
export const museIntentSchema = z.enum([
  'briefing',
  'triage',
  'follow-up',
  'faq',
  'plan',
  'revenue',
  'content',
  'booking',
  'social',
]);
export const museCommandSchema = z
  .object({
    requestId: z.uuid(),
    prompt: z.string().trim().min(2).max(1000),
    intent: museIntentSchema.optional(),
    locale: z.enum(['ar', 'fr', 'en']),
  })
  .strict();
export const museKnowledgeSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    content: z.string().trim().min(10).max(6000),
    source: z.string().trim().min(3).max(500),
    agent: museAgentSchema,
    locale: z.enum(['ar', 'fr', 'en']),
  })
  .strict();
export const museTaskSchema = z
  .object({
    title: z.string().trim().min(3).max(240),
    goal: z.string().trim().max(500),
    dueOn: z.iso.date(),
    agent: museAgentSchema,
  })
  .strict();
export const museFollowUpSchema = z
  .object({
    requestId: z.uuid(),
    enquiryId: z.string().min(1).max(255),
    nextFollowUpOn: z.iso.date(),
    nextAction: z.string().trim().min(3).max(240),
  })
  .strict();
export const museResourceIdSchema = z.string().min(1).max(255);
export const museDraftSchema = z
  .object({
    requestId: z.uuid(),
    enquiryId: museResourceIdSchema,
    text: z.string().trim().min(10).max(2000),
  })
  .strict();

export type MuseIntent = z.infer<typeof museIntentSchema>;
export type MuseAgent = z.infer<typeof museAgentSchema>;
