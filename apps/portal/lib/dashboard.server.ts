import 'server-only';

import { db } from '@luminol/database';

import {
  buildLearnerDashboard,
  type DashboardCertificateRow,
  type DashboardEnrollmentRow,
  type DashboardRecordRow,
} from './dashboard';

export async function getLearnerDashboard(userId: string) {
  const [enrollments, records, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        startedAt: true,
        completedAt: true,
        expiresAt: true,
        course: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    db.learningRecord.findMany({
      where: { userId },
      select: {
        courseId: true,
        progress: true,
        status: true,
        lastActivityAt: true,
      },
    }),
    db.certificate.findMany({
      where: { userId },
      select: {
        id: true,
        verificationId: true,
        issuedAt: true,
        revokedAt: true,
        publiclyVisible: true,
        recipientName: true,
        course: { select: { slug: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    }),
  ]);

  return buildLearnerDashboard(
    enrollments as DashboardEnrollmentRow[],
    records as DashboardRecordRow[],
    certificates as DashboardCertificateRow[],
  );
}
