import 'server-only';

import { db } from '@luminol/database';
import {
  assertCorporateManagerAccess,
  type CorporateMembershipRole,
} from '@luminol/professional';

import {
  assertOrganizationManagerAggregatePolicy,
  ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
  ORGANIZATION_MANAGER_ORG_PAGE_SIZE,
  ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
  ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
  organizationManagerQuerySchema,
  type OrganizationManagerQuery,
  summarizeOrganizationManagerProgress,
  summarizeOrganizationManagerSeats,
} from './organization-manager';

const managerRoles = ['OWNER', 'MANAGER'] as const;

const managerMembershipWhere = (userId: string) => ({
  userId,
  active: true,
  role: { in: managerRoles },
  organization: { archivedAt: null },
});

export async function hasOrganizationManagerAccess(userId: string) {
  const membership = await db.organizationMembership.findFirst({
    where: managerMembershipWhere(userId),
    select: { id: true },
  });

  return membership !== null;
}

export async function getOrganizationManagerDashboard(
  userId: string,
  rawQuery: OrganizationManagerQuery = {},
) {
  const query = organizationManagerQuerySchema.parse(rawQuery);
  const managerWhere = managerMembershipWhere(userId);
  const organizationCount = await db.organizationMembership.count({
    where: managerWhere,
  });

  if (organizationCount === 0) return null;

  const organizationPageCount = Math.max(
    1,
    Math.ceil(organizationCount / ORGANIZATION_MANAGER_ORG_PAGE_SIZE),
  );
  const organizationPage = Math.min(
    query.organizationPage,
    organizationPageCount,
  );
  const managerMemberships = await db.organizationMembership.findMany({
    where: managerWhere,
    skip: (organizationPage - 1) * ORGANIZATION_MANAGER_ORG_PAGE_SIZE,
    take: ORGANIZATION_MANAGER_ORG_PAGE_SIZE,
    orderBy: [
      { organization: { name: 'asc' } },
      { organizationId: 'asc' },
    ],
    select: {
      id: true,
      organizationId: true,
      userId: true,
      role: true,
      active: true,
      organization: {
        select: {
          id: true,
          name: true,
          status: true,
          seatLimit: true,
        },
      },
    },
  });

  const selectedMembership = query.organizationId
    ? await db.organizationMembership.findFirst({
        where: {
          ...managerWhere,
          organizationId: query.organizationId,
        },
        select: {
          id: true,
          organizationId: true,
          userId: true,
          role: true,
          active: true,
          organization: {
            select: {
              id: true,
              name: true,
              status: true,
              seatLimit: true,
            },
          },
        },
      })
    : (managerMemberships[0] ?? null);

  if (!selectedMembership) return null;

  assertCorporateManagerAccess(
    {
      membershipId: selectedMembership.id,
      organizationId: selectedMembership.organizationId,
      userId: selectedMembership.userId,
      role: selectedMembership.role as CorporateMembershipRole,
      active: selectedMembership.active,
    },
    selectedMembership.organizationId,
  );
  assertOrganizationManagerAggregatePolicy(
    selectedMembership.role as CorporateMembershipRole,
  );

  const organizationId = selectedMembership.organizationId;
  const selectedTeam = query.teamId
    ? await db.team.findFirst({
        where: {
          id: query.teamId,
          organizationId,
          archivedAt: null,
        },
        select: { id: true, name: true },
      })
    : null;

  if (query.teamId && !selectedTeam) return null;

  const rosterWhere = {
    organizationId,
    active: true,
    ...(selectedTeam
      ? {
          teamMemberships: {
            some: { teamId: selectedTeam.id },
          },
        }
      : {}),
  };
  const teamWhere = { organizationId, archivedAt: null };
  const courseWhere = { organizationId, active: true };

  const [
    rosterCount,
    teamCount,
    courseCount,
    seatGroups,
    roster,
    teams,
    courses,
    overallAssignmentCount,
    overallCompletedAssignments,
  ] = await Promise.all([
    db.organizationMembership.count({ where: rosterWhere }),
    db.team.count({ where: teamWhere }),
    db.organizationCourse.count({ where: courseWhere }),
    db.organizationSeat.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
    db.organizationMembership.findMany({
      where: rosterWhere,
      skip: (query.rosterPage - 1) * ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
      take: ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
      orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        role: true,
        joinedAt: true,
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
    db.team.findMany({
      where: teamWhere,
      skip: (query.teamPage - 1) * ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
      take: ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            memberships: {
              where: { organizationMembership: { active: true } },
            },
          },
        },
      },
    }),
    db.organizationCourse.findMany({
      where: courseWhere,
      skip: (query.coursePage - 1) * ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
      take: ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
      orderBy: [{ assignedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        assignedAt: true,
        course: { select: { id: true, title: true } },
      },
    }),
    db.organizationEnrollmentSponsorship.count({
      where: {
        active: true,
        organizationCourse: { organizationId, active: true },
      },
    }),
    db.organizationEnrollmentSponsorship.count({
      where: {
        active: true,
        organizationCourse: { organizationId, active: true },
        enrollment: { status: 'COMPLETED' },
      },
    }),
  ]);

  const rosterPageCount = Math.max(
    1,
    Math.ceil(rosterCount / ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE),
  );
  const teamPageCount = Math.max(
    1,
    Math.ceil(teamCount / ORGANIZATION_MANAGER_TEAM_PAGE_SIZE),
  );
  const coursePageCount = Math.max(
    1,
    Math.ceil(courseCount / ORGANIZATION_MANAGER_COURSE_PAGE_SIZE),
  );

  const boundedRosterPage = Math.min(query.rosterPage, rosterPageCount);
  const boundedTeamPage = Math.min(query.teamPage, teamPageCount);
  const boundedCoursePage = Math.min(query.coursePage, coursePageCount);

  const rosterPage =
    boundedRosterPage === query.rosterPage
      ? roster
      : await db.organizationMembership.findMany({
          where: rosterWhere,
          skip:
            (boundedRosterPage - 1) * ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
          take: ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
          orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });
  const teamPage =
    boundedTeamPage === query.teamPage
      ? teams
      : await db.team.findMany({
          where: teamWhere,
          skip: (boundedTeamPage - 1) * ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
          take: ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                memberships: {
                  where: { organizationMembership: { active: true } },
                },
              },
            },
          },
        });
  const coursePage =
    boundedCoursePage === query.coursePage
      ? courses
      : await db.organizationCourse.findMany({
          where: courseWhere,
          skip:
            (boundedCoursePage - 1) * ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
          take: ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
          orderBy: [{ assignedAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            assignedAt: true,
            course: { select: { id: true, title: true } },
          },
        });

  const courseProgress = await Promise.all(
    coursePage.map(async (organizationCourse) => {
      const [assignmentCount, completedAssignments] = await Promise.all([
        db.organizationEnrollmentSponsorship.count({
          where: {
            organizationCourseId: organizationCourse.id,
            active: true,
          },
        }),
        db.organizationEnrollmentSponsorship.count({
          where: {
            organizationCourseId: organizationCourse.id,
            active: true,
            enrollment: { status: 'COMPLETED' },
          },
        }),
      ]);

      return {
        ...organizationCourse,
        progress: summarizeOrganizationManagerProgress(
          assignmentCount,
          completedAssignments,
        ),
      };
    }),
  );

  const seatCounts = Object.fromEntries(
    seatGroups.map((group) => [group.status, group._count._all]),
  );

  return {
    membership: selectedMembership,
    organizations: managerMemberships,
    selectedTeam,
    roster: rosterPage,
    teams: teamPage,
    courses: courseProgress,
    seatUtilization: summarizeOrganizationManagerSeats(
      selectedMembership.organization.seatLimit,
      seatCounts,
    ),
    progress: summarizeOrganizationManagerProgress(
      overallAssignmentCount,
      overallCompletedAssignments,
    ),
    pagination: {
      organizations: {
        page: organizationPage,
        pageCount: organizationPageCount,
        total: organizationCount,
      },
      roster: {
        page: boundedRosterPage,
        pageCount: rosterPageCount,
        total: rosterCount,
      },
      teams: {
        page: boundedTeamPage,
        pageCount: teamPageCount,
        total: teamCount,
      },
      courses: {
        page: boundedCoursePage,
        pageCount: coursePageCount,
        total: courseCount,
      },
    },
  };
}
