import {
  CertificateStatus,
  EnrollmentStatus,
  LearningRecordStatus,
  PlacementAttemptStatus,
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

export const ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE = 5;
export const ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS = 30;

export type AcademyProgrammeAnalytics =
  | {
      state: 'suppressed';
      courseId: string;
      title: string;
      participantCount: number;
      minimumGroupSize: number;
    }
  | {
      state: 'visible';
      courseId: string;
      title: string;
      participantCount: number;
      minimumGroupSize: number;
      activeEnrollments: number;
      completedEnrollments: number;
      recentLearningRecords: number;
      activeCertificates: number;
      reviewRequiredAttempts: number;
    };

function normalizeUserId(userId: string) {
  const normalized = userId.trim();
  if (!normalized) throw new TypeError('userId is required');
  return normalized;
}

function analyticsActivityCutoff(now: Date) {
  const time = now.getTime();
  if (!Number.isFinite(time)) throw new TypeError('now must be a valid date');
  return new Date(
    time - ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
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

/**
 * Returns programme-level academy aggregates derived from existing source-of-
 * truth records. The reader never selects learner identities, authored text,
 * assessment answers/scores, psychology content, enquiries, finance details,
 * certificate metadata, raw search queries, sessions or IP addresses.
 *
 * Detailed programme metrics fail closed below the minimum group size. The
 * caller must enforce academy/instructor authorization before invoking this
 * cross-learner read model.
 */
export async function getAcademyProgrammeAnalytics(
  now = new Date(),
): Promise<AcademyProgrammeAnalytics[]> {
  const recentCutoff = analyticsActivityCutoff(now);
  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ title: 'asc' }, { id: 'asc' }],
  });

  return Promise.all(
    courses.map(async (course): Promise<AcademyProgrammeAnalytics> => {
      const participantCount = course._count.enrollments;
      if (participantCount < ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE) {
        return {
          state: 'suppressed',
          courseId: course.id,
          title: course.title,
          participantCount,
          minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
        };
      }

      const [
        activeEnrollments,
        completedEnrollments,
        recentLearningRecords,
        activeCertificates,
        reviewRequiredAttempts,
      ] = await Promise.all([
        db.enrollment.count({
          where: { courseId: course.id, status: EnrollmentStatus.ACTIVE },
        }),
        db.enrollment.count({
          where: { courseId: course.id, status: EnrollmentStatus.COMPLETED },
        }),
        db.learningRecord.count({
          where: { courseId: course.id, lastActivityAt: { gte: recentCutoff } },
        }),
        db.certificate.count({
          where: { courseId: course.id, status: CertificateStatus.ACTIVE },
        }),
        db.placementAttempt.count({
          where: {
            assessment: { courseId: course.id },
            status: PlacementAttemptStatus.REVIEW_REQUIRED,
          },
        }),
      ]);

      return {
        state: 'visible',
        courseId: course.id,
        title: course.title,
        participantCount,
        minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
        activeEnrollments,
        completedEnrollments,
        recentLearningRecords,
        activeCertificates,
        reviewRequiredAttempts,
      };
    }),
  );
}
