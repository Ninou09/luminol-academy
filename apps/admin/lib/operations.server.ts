import 'server-only';

import { db } from '@luminol/database';

import { calculateCompletionRate } from './operations';

export async function getOperationsDashboard() {
  const [
    activeUsers,
    activeEnrollments,
    publishedCourses,
    newEnquiries,
    completedEnrollments,
    trackedEnrollments,
    recentEnquiries,
    recentEnrollments,
    coursePortfolio,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.enrollment.count({ where: { status: 'ACTIVE' } }),
    db.course.count({ where: { published: true } }),
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.enrollment.count({ where: { status: 'COMPLETED' } }),
    db.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
    db.enquiry.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        status: true,
        createdAt: true,
      },
    }),
    db.enrollment.findMany({
      take: 6,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: { select: { title: true } },
      },
    }),
    db.course.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        published: true,
        updatedAt: true,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      activeUsers,
      activeEnrollments,
      publishedCourses,
      newEnquiries,
      completionRate: calculateCompletionRate(
        completedEnrollments,
        trackedEnrollments,
      ),
    },
    recentEnquiries,
    recentEnrollments,
    coursePortfolio,
  };
}
