import { z } from 'zod';

export const PROFESSIONAL_COMPETENCY_LEVELS = [
  'FOUNDATIONAL',
  'PRACTITIONER',
  'ADVANCED',
  'EXPERT',
] as const;

export const PROFESSIONAL_COMPETENCY_CATEGORIES = [
  'communication',
  'leadership',
  'project-management',
  'digital-skills',
  'career-readiness',
  'entrepreneurship',
] as const;

export type ProfessionalCompetencyLevel =
  (typeof PROFESSIONAL_COMPETENCY_LEVELS)[number];
export type ProfessionalCompetencyCategory =
  (typeof PROFESSIONAL_COMPETENCY_CATEGORIES)[number];

export const competencyRatingSchema = z.object({
  competencyId: z.string().min(1),
  category: z.enum(PROFESSIONAL_COMPETENCY_CATEGORIES),
  score: z.number().min(0).max(100),
});

export type CompetencyRating = z.infer<typeof competencyRatingSchema>;

export function determineCompetencyLevel(score: number): ProfessionalCompetencyLevel {
  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore >= 85) return 'EXPERT';
  if (normalizedScore >= 70) return 'ADVANCED';
  if (normalizedScore >= 50) return 'PRACTITIONER';
  return 'FOUNDATIONAL';
}

export function calculateCompetencyProfile(ratings: readonly CompetencyRating[]) {
  if (ratings.length === 0) {
    throw new Error('At least one competency rating is required');
  }

  const validatedRatings = ratings.map((rating) => competencyRatingSchema.parse(rating));
  const averageScore = Math.round(
    validatedRatings.reduce((total, rating) => total + rating.score, 0) /
      validatedRatings.length,
  );

  const sortedRatings = [...validatedRatings].sort((left, right) => right.score - left.score);

  return {
    averageScore,
    overallLevel: determineCompetencyLevel(averageScore),
    strengths: sortedRatings.slice(0, 3).map(({ competencyId }) => competencyId),
    developmentPriorities: sortedRatings
      .slice(-3)
      .reverse()
      .map(({ competencyId }) => competencyId),
    ratings: validatedRatings.map((rating) => ({
      ...rating,
      level: determineCompetencyLevel(rating.score),
    })),
  };
}
