export type EnrollmentStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DashboardEnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  course: { id: string; slug: string; title: string };
}

export interface DashboardRecordRow {
  courseId: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastActivityAt: Date;
}

export interface DashboardCertificateRow {
  id: string;
  verificationId: string;
  issuedAt: Date;
  revokedAt: Date | null;
  course: { slug: string; title: string };
}

export interface LearnerCourse {
  id: string;
  enrollmentId: string;
  slug: string;
  title: string;
  status: EnrollmentStatus;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: Date;
  lastActivityAt: Date | null;
  expiresAt: Date | null;
}

export interface LearnerDashboard {
  courses: LearnerCourse[];
  certificates: DashboardCertificateRow[];
  summary: {
    activeCourses: number;
    completedCourses: number;
    validCertificates: number;
    averageProgress: number;
  };
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function buildLearnerDashboard(
  enrollments: DashboardEnrollmentRow[],
  records: DashboardRecordRow[],
  certificates: DashboardCertificateRow[],
): LearnerDashboard {
  const recordsByCourse = new Map<string, DashboardRecordRow[]>();

  for (const record of records) {
    const courseRecords = recordsByCourse.get(record.courseId) ?? [];
    courseRecords.push(record);
    recordsByCourse.set(record.courseId, courseRecords);
  }

  const courses = enrollments
    .filter(({ status }) => status !== 'CANCELLED')
    .map((enrollment) => {
      const courseRecords = recordsByCourse.get(enrollment.course.id) ?? [];
      const progress =
        courseRecords.length > 0
          ? clampProgress(
              courseRecords.reduce(
                (total, record) => total + clampProgress(record.progress),
                0,
              ) / courseRecords.length,
            )
          : enrollment.status === 'COMPLETED'
            ? 100
            : 0;
      const lastActivityAt =
        courseRecords
          .map(({ lastActivityAt }) => lastActivityAt)
          .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;

      return {
        id: enrollment.course.id,
        enrollmentId: enrollment.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        status: enrollment.status,
        progress,
        completedLessons: courseRecords.filter(
          ({ status }) => status === 'COMPLETED',
        ).length,
        totalLessons: courseRecords.length,
        enrolledAt: enrollment.enrolledAt,
        lastActivityAt,
        expiresAt: enrollment.expiresAt,
      };
    });

  return {
    courses,
    certificates,
    summary: {
      activeCourses: courses.filter(({ status }) => status === 'ACTIVE').length,
      completedCourses: courses.filter(({ status }) => status === 'COMPLETED')
        .length,
      validCertificates: certificates.filter(({ revokedAt }) => !revokedAt)
        .length,
      averageProgress:
        courses.length > 0
          ? Math.round(
              courses.reduce((total, course) => total + course.progress, 0) /
                courses.length,
            )
          : 0,
    },
  };
}
