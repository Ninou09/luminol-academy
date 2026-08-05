import { z } from 'zod';

import {
  PROFESSIONAL_COMPETENCY_CATEGORIES,
  competencyRatingSchema,
  type CompetencyRating,
  type ProfessionalCompetencyCategory,
} from './competencies';

export const careerGoalSchema = z.object({
  title: z.string().min(2).max(120),
  targetRole: z.string().min(2).max(120),
  targetCategories: z.array(z.enum(PROFESSIONAL_COMPETENCY_CATEGORIES)).min(1),
  targetScore: z.number().min(50).max(100).default(70),
});

export type CareerGoal = z.infer<typeof careerGoalSchema>;

export type TrainingRecommendation = {
  category: ProfessionalCompetencyCategory;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

function averageCategoryScore(
  ratings: readonly CompetencyRating[],
  category: ProfessionalCompetencyCategory,
): number {
  const matchingRatings = ratings.filter(
    (rating) => rating.category === category,
  );

  if (matchingRatings.length === 0) return 0;

  return Math.round(
    matchingRatings.reduce((total, rating) => total + rating.score, 0) /
      matchingRatings.length,
  );
}

function determinePriority(gap: number): TrainingRecommendation['priority'] {
  if (gap >= 30) return 'HIGH';
  if (gap >= 15) return 'MEDIUM';
  return 'LOW';
}

export function buildTrainingPlan(input: {
  goal: CareerGoal;
  ratings: readonly CompetencyRating[];
}): TrainingRecommendation[] {
  const goal = careerGoalSchema.parse(input.goal);
  const ratings = input.ratings.map((rating) =>
    competencyRatingSchema.parse(rating),
  );

  return goal.targetCategories
    .map((category) => {
      const currentScore = averageCategoryScore(ratings, category);
      const gap = Math.max(0, goal.targetScore - currentScore);

      return {
        category,
        currentScore,
        targetScore: goal.targetScore,
        gap,
        priority: determinePriority(gap),
      } satisfies TrainingRecommendation;
    })
    .filter((recommendation) => recommendation.gap > 0)
    .sort((left, right) => right.gap - left.gap);
}
