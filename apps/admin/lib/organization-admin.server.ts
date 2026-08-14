import 'server-only';

import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { z } from 'zod';

import { ORGANIZATION_ADMIN_COLLECTION_LIMIT } from './organization-admin';

const ORGANIZATION_PAGE_SIZE = 25;
const OPTION_LIMIT = 100;

const dashboardQuerySchema = z.object({
  organizationQuery: z.string().trim().max(160).default(''),
  organizationPage: z.coerce.number().int().positive().max(10_000).default(1),
  userQuery: z.string().trim().max(160).default(''),
  teamQuery: z.string().trim().max(160).default(''),
  courseQuery: z.string().trim().max(160).default(''),
});

export type OrganizationAdminDashboardQuery = z.input<
  typeof dashboardQuerySchema
>;

export async function getOrganizationAdminDashboard(
  rawQuery: OrganizationAdminDashboardQuery = {},
) {
  const query = dashboardQuerySchema.parse(rawQuery);
  const organizationWhere: Prisma.OrganizationWhereInput =
    query.organizationQuery
      ? {
          name: {
            contains: query.organizationQuery,
            mode: 'insensitive',
          },
        }
      : {};
  const userWhere: Prisma.UserWhereInput = query.userQuery
    ? {
        deletedAt: null,
        OR: [
          {
            email: { contains: query.userQuery, mode: 'insensitive' },
          },
          {
            firstName: {
              contains: query.userQuery,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query.userQuery,
              mode: 'insensitive',
            },
          },
        ],
      }
    : { deletedAt: null };
  const teamWhere: Prisma.TeamWhereInput = {
    archivedAt: null,
    ...(query.teamQuery
      ? {
          name: {
            contains: query.teamQuery,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };
  const courseSearchWhere: Prisma.CourseWhereInput = query.courseQuery
    ? {
        OR: [
          {
            title: {
              contains: query.courseQuery,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: query.courseQuery,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {};
  const publishedCourseWhere: Prisma.CourseWhereInput = {
    published: true,
    ...courseSearchWhere,
  };

  const organizationCount = await db.organization.count({
    where: organizationWhere,
  });
  const pageCount = Math.max(
    1,
    Math.ceil(organizationCount / ORGANIZATION_PAGE_SIZE),
  );
  const organizationPage = Math.min(query.organizationPage, pageCount);

  const organizations = await db.organization.findMany({
    where: organizationWhere,
    skip: (organizationPage - 1) * ORGANIZATION_PAGE_SIZE,
    take: ORGANIZATION_PAGE_SIZE,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      status: true,
      seatLimit: true,
      archivedAt: true,
      memberships: {
        where: { active: true, user: userWhere },
        take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
        orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
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
        where: teamWhere,
        take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          memberships: {
            where: {
              organizationMembership: { active: true, user: userWhere },
            },
            take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
            orderBy: { id: 'asc' },
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
          _count: {
            select: {
              memberships: {
                where: { organizationMembership: { active: true } },
              },
            },
          },
        },
      },
      seats: {
        where: {
          status: { in: ['INVITED', 'ACTIVE'] },
          user: userWhere,
        },
        take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
        orderBy: [{ invitedAt: 'desc' }, { id: 'desc' }],
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
        where: { active: true, course: courseSearchWhere },
        take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
        orderBy: [{ assignedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          course: { select: { id: true, title: true } },
        },
      },
      _count: {
        select: {
          memberships: { where: { active: true } },
          teams: { where: { archivedAt: null } },
          seats: true,
          courses: { where: { active: true } },
        },
      },
    },
  });

  const [users, publishedCourses] = await Promise.all([
    db.user.findMany({
      take: OPTION_LIMIT,
      where: userWhere,
      orderBy: [{ email: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    db.course.findMany({
      take: OPTION_LIMIT,
      where: publishedCourseWhere,
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      select: { id: true, title: true },
    }),
  ]);

  const organizationIds = organizations.map((organization) => organization.id);
  const visibleTeamIds = organizations.flatMap((organization) =>
    organization.teams.map((team) => team.id),
  );
  const visibleMembershipIds = organizations.flatMap((organization) =>
    organization.memberships.map((membership) => membership.id),
  );
  const candidateUserIds = users.map((user) => user.id);
  const candidateCourseIds = publishedCourses.map((course) => course.id);

  const [
    seatEligibilityPages,
    candidateActiveMemberships,
    candidateActiveCourses,
    candidateTeamMemberships,
    progress,
  ] = await Promise.all([
    Promise.all(
      organizations.map((organization) =>
        db.organizationMembership.findMany({
          where: {
            organizationId: organization.id,
            active: true,
            user: {
              ...userWhere,
              organizationSeats: {
                none: { organizationId: organization.id },
              },
            },
          },
          take: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
          orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            organizationId: true,
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
        }),
      ),
    ),
    organizationIds.length > 0 && candidateUserIds.length > 0
      ? db.organizationMembership.findMany({
          where: {
            organizationId: { in: organizationIds },
            userId: { in: candidateUserIds },
            active: true,
          },
          select: { organizationId: true, userId: true },
        })
      : Promise.resolve([]),
    organizationIds.length > 0 && candidateCourseIds.length > 0
      ? db.organizationCourse.findMany({
          where: {
            organizationId: { in: organizationIds },
            courseId: { in: candidateCourseIds },
            active: true,
          },
          select: { organizationId: true, courseId: true },
        })
      : Promise.resolve([]),
    visibleTeamIds.length > 0 && visibleMembershipIds.length > 0
      ? db.teamMembership.findMany({
          where: {
            teamId: { in: visibleTeamIds },
            organizationMembershipId: { in: visibleMembershipIds },
          },
          select: { teamId: true, organizationMembershipId: true },
        })
      : Promise.resolve([]),
    Promise.all(
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
    ),
  ]);

  const seatEligibleByOrganization = new Map(
    seatEligibilityPages.map((memberships, index) => [
      organizations[index]!.id,
      memberships,
    ]),
  );
  const activeMembershipKeys = new Set(
    candidateActiveMemberships.map(
      (membership) => `${membership.organizationId}:${membership.userId}`,
    ),
  );
  const activeCourseKeys = new Set(
    candidateActiveCourses.map(
      (assignment) => `${assignment.organizationId}:${assignment.courseId}`,
    ),
  );
  const teamMembershipKeys = new Set(
    candidateTeamMemberships.map(
      (membership) =>
        `${membership.teamId}:${membership.organizationMembershipId}`,
    ),
  );
  const progressByOrganization = new Map(
    progress.map((summary) => [summary.organizationId, summary]),
  );

  return {
    organizations: organizations.map((organization) => ({
      ...organization,
      teams: organization.teams.map((team) => ({
        ...team,
        availableMemberships: organization.memberships.filter(
          (membership) =>
            !teamMembershipKeys.has(`${team.id}:${membership.id}`),
        ),
      })),
      availableSeatMemberships:
        seatEligibleByOrganization.get(organization.id) ?? [],
      availableMembershipUsers: users.filter(
        (user) => !activeMembershipKeys.has(`${organization.id}:${user.id}`),
      ),
      availablePublishedCourses: publishedCourses.filter(
        (course) => !activeCourseKeys.has(`${organization.id}:${course.id}`),
      ),
      progress: progressByOrganization.get(organization.id) ?? {
        organizationId: organization.id,
        assignmentCount: 0,
        completedAssignments: 0,
        completionPercent: 0,
      },
    })),
    options: { users, publishedCourses },
    query: { ...query, organizationPage },
    pagination: {
      page: organizationPage,
      pageCount,
      total: organizationCount,
      pageSize: ORGANIZATION_PAGE_SIZE,
      hasPreviousPage: organizationPage > 1,
      hasNextPage: organizationPage < pageCount,
    },
    limits: {
      optionSearchResults: OPTION_LIMIT,
      collectionResults: ORGANIZATION_ADMIN_COLLECTION_LIMIT,
    },
  };
}
