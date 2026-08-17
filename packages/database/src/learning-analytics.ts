import {
  CertificateStatus,
  EnrollmentStatus,
  LearningRecordStatus,
} from '../generated/prisma/client';

import { db } from './index';

export type LearnerLearningAnalytics = {
  activeProgrammes: number;
  completedProgrammes: number;
  completedLessons: number;
  inProgressLessons: number;
  certificatesEarned: number;
  lastLearningActivityAt: Date | null;
};

function normalizeUserId(userId: string) {
  const normalized = userId.trim();
  if (!normalized) throw new TypeError('userId is required');
  return normalized;
}

/**
 * Builds a self-facing analytics read model only from first-party learning
 * status/count fields. It deliberately does not select names, email, lesson
 * content, assessment scores/answers, psychology content, enquiry data,
 * finance records, certificate snapshots/metadata, or learner-authored text.
 *
 * Callers must pass the already-authorized signed-in user's internal id. The
 * reader also fails closed for missing or soft-deleted users.
 */
export async function getLearnerLearningAnalytics(
  userId: string,
): Promise<LearnerLearningAnalytics | null> {
  const normalizedUserId = normalizeUserId(userId);
  const learner = await db.user.findFirst({
    where: { id: normalizedUserId, deletedAt: null },
    select: { id: true },
  });
  if (!learner) return null;

  const [
    activeProgrammes,
    completedProgrammes,
    completedLessons,
    inProgressLessons,
    certificatesEarned,
    latestActivity,
  ] = await Promise.all([
    db.enrollment.count({
      where: { userId: normalizedUserId, status: EnrollmentStatus.ACTIVE },
    }),
    db.enrollment.count({
      where: { userId: normalizedUserId, status: EnrollmentStatus.COMPLETED },
    }),
    db.learningRecord.count({
      where: {
        userId: normalizedUserId,
        status: LearningRecordStatus.COMPLETED,
      },
    }),
    db.learningRecord.count({
      where: {
        userId: normalizedUserId,
        status: LearningRecordStatus.IN_PROGRESS,
      },
    }),
    db.certificate.count({
      where: { userId: normalizedUserId, status: CertificateStatus.ACTIVE },
    }),
    db.learningRecord.aggregate({
      where: { userId: normalizedUserId },
      _max: { lastActivityAt: true },
    }),
  ]);

  return {
    activeProgrammes,
    completedProgrammes,
    completedLessons,
    inProgressLessons,
    certificatesEarned,
    lastLearningActivityAt: latestActivity._max.lastActivityAt,
  };
}
