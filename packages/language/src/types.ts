import type { CEFR_LEVELS, LANGUAGE_SKILLS } from './constants';

export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type LanguageSkill = (typeof LANGUAGE_SKILLS)[number];

export type PlacementStatus = 'draft' | 'submitted' | 'reviewing' | 'completed';

export interface SkillScoreInput {
  skill: LanguageSkill;
  rawScore: number;
  maxScore: number;
  answeredItems: number;
  totalItems: number;
}

export interface SkillScore extends SkillScoreInput {
  percentage: number;
  weightedContribution: number;
}

export interface PlacementResult {
  overall: CefrLevel;
  confidence: number;
  score: number;
  skills: SkillScore[];
  strengths: LanguageSkill[];
  weaknesses: LanguageSkill[];
}

export interface CourseCandidate {
  id: string;
  level: CefrLevel;
  title: string;
  active: boolean;
}

export interface CourseRecommendation {
  courseId: string | null;
  courseTitle: string | null;
  recommendedLevel: CefrLevel;
  reason: string;
  prioritySkills: LanguageSkill[];
}

export interface PlacementActor {
  userId: string;
  permissions: readonly string[];
}
