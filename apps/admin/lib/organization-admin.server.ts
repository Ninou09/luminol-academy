import 'server-only';

import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { z } from 'zod';

const ORGANIZATION_PAGE_SIZE = 25;
const OPTION_LIMIT = 100;

const dashboardQuerySchema = z.object({
  organizationQuery: z.string().trim().max(160).default(''),
  organizationPage: z.coerce.number().int().positive().max(10_000).default(1),
  userQuery: z.string().trim().max(160).default(''),
  courseQuery: z.string().trim().max(160).default(''),
});

export type OrganizationAdminDashboardQuery = z.input<
  typeof dashboardQuerySchema
>;

export async function getOrganizationAdminDashboard(
  rawQuery: OrganizationAdminDashboardQuery = {},
) {
  const query = dashboardQuerySchema.parse(rawQuery);
  const organizationWhere: Prisma.OrganizationWhereInput = query.organizationQuery
    ? {
        name: {
          contains: query.organizationQuery,
          mode: 'insensitive',
        },
      }
    : {};
  const userWhere = query.userQuery
    ? {
        deletedAt: null,
        OR: [
          {
            email: { contains: query.userQuery, mode: 'insensitive' as const },
          },
          {
            firstName: {
              contains: query.userQuery,
              mode: 'insensitive' as const,
            },
          },
          {
            lastName: {
              contains: query.userQuery,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : { deletedAt: null };
  const courseWhere = query.courseQuery
    ? {
        published: true,
        OR: [
          {
            title: {
              contains: query.courseQuery,
              mode: 'insensitive' as const,
            },
          },
          {
            slug: {
              contains: query.courseQuery,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : { published: true };

  const organizationCount = await db.organization.count({
    where: organizationWhere,
  });
  const pageCount = Math.max(
    1,
    Math.ceil(organizationCount / ORGANIZATION_PAGE_SIZE),
  );
  const organizationPage = Math.min(query.organizationPage, pageCount);

  const [organizations, users, publishedCourses] = await Promise.all([
    db.organization.findMany({
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
          where: { active: true },
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
          where: { archivedAt: null },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            name: true,
            memberships: {
              where: { organizationMembership: { active: true } },
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
          },
        },
        seats: {
          where: { status: { in: ['INVITED', 'ACTIVE'] } },
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
          where: { active: true },
          orderBy: [{ assignedAt: 'desc' }, { id: 'desc' }],
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
      where: courseWhere,
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
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
    },
  };
}
