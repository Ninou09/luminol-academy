import { z } from 'zod';

import { promptLevelSchema } from './adaptive';
import { isSkillId, type SkillId } from './skills';

export const skillIdSchema = z
  .string()
  .refine((value): value is SkillId => isSkillId(value), {
    message: 'Unknown skill.',
  });

/** One child response cycle, stored on the device for the parent dashboard. */
export const trialRecordSchema = z.object({
  childId: z.uuid(),
  sessionId: z.uuid(),
  skillId: skillIdSchema,
  level: z.int().min(1),
  promptLevel: promptLevelSchema,
  firstTryCorrect: z.boolean(),
  wrongAttempts: z.int().min(0),
  escalatedToGuide: z.boolean(),
  responseMs: z.int().min(0),
  at: z.iso.datetime(),
});
export type TrialRecord = z.infer<typeof trialRecordSchema>;

export const sessionRecordSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  activitiesCompleted: z.int().min(0),
  calmVisits: z.int().min(0),
});
export type SessionRecord = z.infer<typeof sessionRecordSchema>;
