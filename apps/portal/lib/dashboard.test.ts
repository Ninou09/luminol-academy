import { describe, expect, it } from 'vitest';

import {
  buildLearnerDashboard,
  type DashboardCertificateRow,
  type DashboardEnrollmentRow,
  type DashboardRecordRow,
} from './dashboard';

const now = new Date('2026-07-25T12:00:00.000Z');

function enrollment(
  overrides: Partial<DashboardEnrollmentRow> = {},
): DashboardEnrollmentRow {
  return {
    id: 'enrollment-1',
    status: 'ACTIVE',
    enrolledAt: now,
    startedAt: now,
    completedAt: null,
    expiresAt: null,
    course: { id: 'course-1', slug: 'leadership', title: 'Leadership' },
    ...overrides,
  };
}

describe('buildLearnerDashboard', () => {
  it('aggregates lesson progress and learner summary', () => {
    const records: DashboardRecordRow[] = [
      {
        courseId: 'course-1',
        progress: 100,
        status: 'COMPLETED',
        lastActivityAt: now,
      },
      {
        courseId: 'course-1',
        progress: 50,
        status: 'IN_PROGRESS',
        lastActivityAt: new Date('2026-07-24T12:00:00.000Z'),
      },
    ];
    const certificates: DashboardCertificateRow[] = [
      {
        id: 'certificate-1',
        verificationId: 'verify-1',
        issuedAt: now,
        revokedAt: null,
        publiclyVisible: false,
        recipientName: null,
        course: { slug: 'leadership', title: 'Leadership' },
      },
    ];

    const dashboard = buildLearnerDashboard(
      [enrollment()],
      records,
      certificates,
    );

    expect(dashboard.courses[0]).toMatchObject({
      progress: 75,
      completedLessons: 1,
      totalLessons: 2,
      lastActivityAt: now,
    });
    expect(dashboard.summary).toEqual({
      activeCourses: 1,
      completedCourses: 0,
      validCertificates: 1,
      averageProgress: 75,
    });
  });

  it('omits cancelled enrolments and treats completed courses as complete', () => {
    const dashboard = buildLearnerDashboard(
      [
        enrollment({ status: 'COMPLETED' }),
        enrollment({
          id: 'enrollment-2',
          status: 'CANCELLED',
          course: { id: 'course-2', slug: 'english', title: 'English' },
        }),
      ],
      [],
      [],
    );

    expect(dashboard.courses).toHaveLength(1);
    expect(dashboard.courses[0]?.progress).toBe(100);
    expect(dashboard.summary.completedCourses).toBe(1);
    expect(dashboard.summary.averageProgress).toBe(100);
  });

  it('returns safe zero-value empty states', () => {
    expect(buildLearnerDashboard([], [], []).summary).toEqual({
      activeCourses: 0,
      completedCourses: 0,
      validCertificates: 0,
      averageProgress: 0,
    });
  });
});
