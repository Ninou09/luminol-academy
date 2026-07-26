import 'server-only';

import {
  CefrLevel as PrismaCefrLevel,
  LanguageSkill as PrismaLanguageSkill,
  PlacementAttemptStatus,
  Prisma,
  db,
} from '@luminol/database';

import { calculatePlacementResult, determineCefrLevel } from './scoring';
import type { CefrLevel, LanguageSkill, SkillScoreInput } from './types';

const SKILL_TO_PRISMA: Record<LanguageSkill, PrismaLanguageSkill> = {
  reading: PrismaLanguageSkill.READING,
  listening: PrismaLanguageSkill.LISTENING,
  speaking: PrismaLanguageSkill.SPEAKING,
  writing: PrismaLanguageSkill.WRITING,
  grammar: PrismaLanguageSkill.GRAMMAR,
  vocabulary: PrismaLanguageSkill.VOCABULARY,
};

const LEVEL_TO_PRISMA: Record<CefrLevel, PrismaCefrLevel> = {
  A1: PrismaCefrLevel.A1,
  A2: PrismaCefrLevel.A2,
  B1: PrismaCefrLevel.B1,
  B2: PrismaCefrLevel.B2,
  C1: PrismaCefrLevel.C1,
  C2: PrismaCefrLevel.C2,
};

export class PlacementServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'ASSESSMENT_NOT_FOUND'
      | 'ATTEMPT_NOT_FOUND'
      | 'ATTEMPT_NOT_OWNED'
      | 'INVALID_ATTEMPT_STATE',
  ) {
    super(message);
    this.name = 'PlacementServiceError';
  }
}

export async function startPlacementAttempt(input: {
  assessmentId: string;
  userId: string;
}) {
  const assessment = await db.placementAssessment.findFirst({
    where: { id: input.assessmentId, published: true },
    select: { id: true },
  });

  if (!assessment) {
    throw new PlacementServiceError(
      'Published placement assessment not found',
      'ASSESSMENT_NOT_FOUND',
    );
  }

  const activeAttempt = await db.placementAttempt.findFirst({
    where: {
      assessmentId: input.assessmentId,
      userId: input.userId,
      status: PlacementAttemptStatus.IN_PROGRESS,
    },
    orderBy: { startedAt: 'desc' },
  });

  if (activeAttempt) return activeAttempt;

  return db.placementAttempt.create({
    data: {
      assessmentId: input.assessmentId,
      userId: input.userId,
    },
  });
}

export async function getActivePlacementAttempt(input: {
  assessmentId: string;
  userId: string;
}) {
  return db.placementAttempt.findFirst({
    where: {
      assessmentId: input.assessmentId,
      userId: input.userId,
      status: PlacementAttemptStatus.IN_PROGRESS,
    },
    orderBy: { startedAt: 'desc' },
    include: { skillResults: true },
  });
}

export async function submitPlacementAttempt(input: {
  attemptId: string;
  userId: string;
  scores: readonly SkillScoreInput[];
  requiresManualReview?: boolean;
}) {
  const result = calculatePlacementResult(input.scores);

  return db.$transaction(async (transaction) => {
    const attempt = await transaction.placementAttempt.findUnique({
      where: { id: input.attemptId },
    });

    if (!attempt) {
      throw new PlacementServiceError('Placement attempt not found', 'ATTEMPT_NOT_FOUND');
    }

    if (attempt.userId !== input.userId) {
      throw new PlacementServiceError('Placement attempt is not owned by this learner', 'ATTEMPT_NOT_OWNED');
    }

    if (attempt.status !== PlacementAttemptStatus.IN_PROGRESS) {
      throw new PlacementServiceError(
        `Cannot submit placement attempt from ${attempt.status}`,
        'INVALID_ATTEMPT_STATE',
      );
    }

    await transaction.placementSkillResult.deleteMany({
      where: { attemptId: input.attemptId },
    });

    await transaction.placementSkillResult.createMany({
      data: result.skills.map((skill) => ({
        attemptId: input.attemptId,
        skill: SKILL_TO_PRISMA[skill.skill],
        score: new Prisma.Decimal(skill.percentage.toFixed(2)),
        level: LEVEL_TO_PRISMA[determineCefrLevel(skill.percentage)],
      })),
    });

    const submitted = await transaction.placementAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: input.requiresManualReview
          ? PlacementAttemptStatus.REVIEW_REQUIRED
          : PlacementAttemptStatus.COMPLETED,
        recommendedLevel: LEVEL_TO_PRISMA[result.overall],
        totalScore: new Prisma.Decimal(result.score.toFixed(2)),
        submittedAt: new Date(),
        completedAt: input.requiresManualReview ? null : new Date(),
      },
      include: { skillResults: true },
    });

    return { attempt: submitted, result };
  });
}

export async function reviewPlacementAttempt(input: {
  attemptId: string;
  reviewerId: string;
  approvedLevel: CefrLevel;
  note?: string;
}) {
  return db.$transaction(async (transaction) => {
    const attempt = await transaction.placementAttempt.findUnique({
      where: { id: input.attemptId },
    });

    if (!attempt) {
      throw new PlacementServiceError('Placement attempt not found', 'ATTEMPT_NOT_FOUND');
    }

    if (attempt.status !== PlacementAttemptStatus.REVIEW_REQUIRED) {
      throw new PlacementServiceError(
        `Cannot review placement attempt from ${attempt.status}`,
        'INVALID_ATTEMPT_STATE',
      );
    }

    const now = new Date();
    return transaction.placementAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: PlacementAttemptStatus.COMPLETED,
        recommendedLevel: LEVEL_TO_PRISMA[input.approvedLevel],
        reviewedById: input.reviewerId,
        reviewedAt: now,
        reviewNote: input.note?.trim() || null,
        completedAt: now,
      },
      include: { skillResults: true },
    });
  });
}

export async function getPlacementResult(input: {
  attemptId: string;
  userId: string;
}) {
  const attempt = await db.placementAttempt.findUnique({
    where: { id: input.attemptId },
    include: {
      assessment: {
        select: { id: true, title: true, targetLanguage: true, courseId: true },
      },
      skillResults: { orderBy: { skill: 'asc' } },
    },
  });

  if (!attempt) {
    throw new PlacementServiceError('Placement attempt not found', 'ATTEMPT_NOT_FOUND');
  }

  if (attempt.userId !== input.userId) {
    throw new PlacementServiceError('Placement attempt is not owned by this learner', 'ATTEMPT_NOT_OWNED');
  }

  return attempt;
}
