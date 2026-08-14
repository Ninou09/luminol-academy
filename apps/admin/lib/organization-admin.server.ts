import 'server-only';

import { db } from '@luminol/database';

const ORGANIZATION_LIMIT = 25;
const RELATED_LIMIT = 100;

export async function getOrganizationAdminDashboard() {
  const [organizations, users, publishedCourses] = await Promise.all([
    db.organization.findMany({
      take: ORGANIZATION_LIMIT,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        seatLimit: true,
        archivedAt: true,
        memberships: {
          where: { active: true },
          take: RELATED_LIMIT,
          orderBy: { joinedAt: 'desc' },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        teams: {
          where: { archivedAt: null },
          take: RELATED_LIMIT,
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            memberships: {
              take: RELATED_LIMIT,
              select: {
                id: true,
                organizationMembership: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        seats: {
          take: RELATED_LIMIT,
          orderBy: { invitedAt: 'desc' },
          select: {
            id: true,
            status: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        courses: {
          where: { active: true },
          take: RELATED_LIMIT,
          orderBy: { assignedAt: 'desc' },
          select: {
            id: true,
            course: { select: { id: true, title: true } },
          },
        },
        _count: {
          select: {
            memberships: true,
            teams: true,
            seats: true,
            courses: true,
          },
        },
      },
    }),
    db.user.findMany({
      take: RELATED_LIMIT,
      where: { deletedAt: null },
      orderBy: { email: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    db.course.findMany({
      take: RELATED_LIMIT,
      where: { published: true },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  const progress = await Promise.all(
    organizations.map(async (organization) => {
      const [assignmentCount, completedAssignments] = await Promise.all([
        db.organizationEnrollmentSponsorship.count({
          where: {
            active: true,
            organizationCourse: { organizationId: organization.id },
          },
        }),
        db.organizationEnrollmentSponsorship.count({
          where: {
            active: true,
            organizationCourse: { organizationId: organization.id },
            enrollment: { status: 'COMPLETED' },
          },
        }),
      ]);

      return {
        organizationId: organization.id,
        assignmentCount,
        completedAssignments,
        completionPercent:
          assignmentCount === 0
            ? 0
            : Math.round((completedAssignments / assignmentCount) * 100),
      };
    }),
  );
  const progressByOrganization = new Map(
    progress.map((summary) => [summary.organizationId, summary]),
  );

  return {
    organizations: organizations.map((organization) => ({
      ...organization,
      progress: progressByOrganization.get(organization.id) ?? {
        organizationId: organization.id,
        assignmentCount: 0,
        completedAssignments: 0,
        completionPercent: 0,
      },
    })),
    options: { users, publishedCourses },
    limits: {
      organizations: ORGANIZATION_LIMIT,
      relatedRecordsPerOrganization: RELATED_LIMIT,
    },
  };
}
