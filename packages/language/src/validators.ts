import { z } from 'zod';

import { CEFR_LEVELS, LANGUAGE_SKILLS } from './constants';

export const StartPlacementSchema = z.object({
  assessmentId: z.string().min(1).max(128),
});

export const SavePlacementAnswerSchema = z.object({
  attemptId: z.string().min(1).max(128),
  questionId: z.string().min(1).max(128),
  answer: z.unknown(),
});

export const SkillScoreInputSchema = z
  .object({
    skill: z.enum(LANGUAGE_SKILLS),
    rawScore: z.number().min(0),
    maxScore: z.number().positive(),
    answeredItems: z.number().int().min(0),
    totalItems: z.number().int().positive(),
  })
  .refine((input) => input.rawScore <= input.maxScore, {
    message: 'rawScore must not exceed maxScore',
    path: ['rawScore'],
  })
  .refine((input) => input.answeredItems <= input.totalItems, {
    message: 'answeredItems must not exceed totalItems',
    path: ['answeredItems'],
  });

export const SubmitPlacementSchema = z.object({
  attemptId: z.string().min(1).max(128),
  scores: z.array(SkillScoreInputSchema).length(LANGUAGE_SKILLS.length),
  requiresManualReview: z.boolean().optional(),
});

export const ReviewPlacementSchema = z.object({
  attemptId: z.string().min(1).max(128),
  approvedLevel: z.enum(CEFR_LEVELS),
  notes: z.string().trim().max(2000).optional(),
});

export type StartPlacementInput = z.infer<typeof StartPlacementSchema>;
export type SavePlacementAnswerInput = z.infer<
  typeof SavePlacementAnswerSchema
>;
export type SubmitPlacementInput = z.infer<typeof SubmitPlacementSchema>;
export type ReviewPlacementInput = z.infer<typeof ReviewPlacementSchema>;
