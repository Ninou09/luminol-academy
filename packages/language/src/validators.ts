import { z } from "zod";
import { CEFR_LEVELS, LANGUAGE_SKILLS } from "./constants";

export const StartPlacementSchema = z.object({
  assessmentId: z.string().min(1),
});

export const SavePlacementAnswerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.unknown(),
});

export const SubmitPlacementSchema = z.object({
  attemptId: z.string().min(1),
});

export const SkillScoreInputSchema = z.object({
  skill: z.enum(LANGUAGE_SKILLS),
  rawScore: z.number().min(0),
  maxScore: z.number().positive(),
  answeredItems: z.number().int().min(0),
  totalItems: z.number().int().positive(),
});

export const ReviewPlacementSchema = z.object({
  attemptId: z.string().min(1),
  approvedLevel: z.enum(CEFR_LEVELS),
  notes: z.string().trim().max(2000).optional(),
});

export type StartPlacementInput = z.infer<typeof StartPlacementSchema>;
export type SavePlacementAnswerInput = z.infer<typeof SavePlacementAnswerSchema>;
export type SubmitPlacementInput = z.infer<typeof SubmitPlacementSchema>;
export type ReviewPlacementInput = z.infer<typeof ReviewPlacementSchema>;
