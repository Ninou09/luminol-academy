import 'server-only';

import { db } from '@luminol/database';
import {
  assertCorporateManagerAccess,
  type CorporateMembershipRole,
} from '@luminol/professional';

import { assertOrganizationManagerAggregatePolicy } from './organization-manager';
import {
  protectOrganizationAnalytics,
  summarizeOrganizationAssignments,
  summarizeOrganizationSeatAnalytics,
} from './organization-analytics';

function managerMembershipWhere(userId: string, organizationId?: string) {
  return {
    userId,
    active: true,
    role: { in: ['OWNER', 'MANAGER'] as const },
    organization: { archivedAt: null },
    ...(organizationId ? { organizationId } : {}),
  };
}

type SponsoredEnrollment = {
  organizationCourseId: string;
  enrollment: {
    id: string;
    userId: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  };
  organizationCourse: {
    course: {
      id: string;
      title: string;
    };
  };
};

function uniqueSponsoredEnrollments(rows: readonly SponsoredEnrollment[]) {
  const byEnrollment = new Map<string, SponsoredEnrollment>();
  for (const row of rows) byEnrollment.set(row.enrollment.id, row);
  return [...byEnrollment.values()];
}

function assignmentSummary(rows: readonly SponsoredEnrollment[]) {
  const uniqueRows = uniqueSponsoredEnrollments(rows);
  return summarizeOrganizationAssignments(
    uniqueRows.length,
    uniqueRows.filter(({ enrollment }) => enrollment.status === 'COMPLETED')
      .length,
  );
}

function sponsoredParticipantCount(rows: readonly SponsoredEnrollment[]) {
  return new Set(rows.map(({ enrollment }) => enrollment.userId)).size;
}

export async function getOrganizationManagerAnalytics(
  userId: string,
  organizationId?: string,
) {
  const membership = await db.organizationMembership.findFirst({
    where: managerMembershipWhere(userId, organizationId),
    orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
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

  if (!membership) return null;

  assertCorporateManagerAccess(
    {
      membershipId: membership.id,
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role as CorporateMembershipRole,
      active: membership.active,
    },
    membership.organizationId,
  );
  assertOrganizationManagerAggregatePolicy(
    membership.role as CorporateMembershipRole,
  );

  const targetOrganizationId = membership.organizationId;
  const [learnerMemberships, seatGroups, teams, sponsorshipRows] =
    await Promise.all([
      db.organizationMembership.findMany({
        where: {
          organizationId: targetOrganizationId,
          active: true,
          role: 'LEARNER',
          user: { deletedAt: null },
        },
        select: { userId: true },
      }),
      db.organizationSeat.groupBy({
        by: ['status'],
        where: { organizationId: targetOrganizationId },
        _count: { _all: true },
      }),
      db.team.findMany({
        where: { organizationId: targetOrganizationId, archivedAt: null },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          memberships: {
            where: {
              organizationMembership: {
                active: true,
                role: 'LEARNER',
                user: { deletedAt: null },
              },
            },
            select: {
              organizationMembership: { select: { userId: true } },
            },
          },
        },
      }),
      db.organizationEnrollmentSponsorship.findMany({
        where: {
          active: true,
          organizationCourse: {
            organizationId: targetOrganizationId,
            active: true,
          },
          enrollment: { user: { deletedAt: null } },
        },
        select: {
          organizationCourseId: true,
          enrollment: {
            select: { id: true, userId: true, status: true },
          },
          organizationCourse: {
            select: {
              course: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

  const seatCounts = Object.fromEntries(
    seatGroups.map((group) => [group.status, group._count._all]),
  );
  const seatUtilization = protectOrganizationAnalytics(
    learnerMemberships.length,
    summarizeOrganizationSeatAnalytics(
      membership.organization.seatLimit,
      seatCounts,
    ),
  );

  const sponsoredParticipantTotal = sponsoredParticipantCount(sponsorshipRows);
  const assignedLearning = protectOrganizationAnalytics(
    sponsoredParticipantTotal,
    assignmentSummary(sponsorshipRows),
  );

  const courseGroups = new Map<string, SponsoredEnrollment[]>();
  for (const row of sponsorshipRows) {
    const existing = courseGroups.get(row.organizationCourseId) ?? [];
    existing.push(row);
    courseGroups.set(row.organizationCourseId, existing);
  }

  const courses = [...courseGroups.entries()]
    .map(([organizationCourseId, rows]) => ({
      organizationCourseId,
      courseId: rows[0]!.organizationCourse.course.id,
      title: rows[0]!.organizationCourse.course.title,
      analytics: protectOrganizationAnalytics(
        sponsoredParticipantCount(rows),
        assignmentSummary(rows),
      ),
    }))
    .sort((left, right) =>
      left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }),
    );

  const teamsAnalytics = teams.map((team) => {
    const memberIds = new Set(
      team.memberships.map(
        ({ organizationMembership }) => organizationMembership.userId,
      ),
    );
    const teamRows = sponsorshipRows.filter(({ enrollment }) =>
      memberIds.has(enrollment.userId),
    );

    return {
      teamId: team.id,
      name: team.name,
      analytics: protectOrganizationAnalytics(
        sponsoredParticipantCount(teamRows),
        assignmentSummary(teamRows),
      ),
    };
  });

  return {
    organization: membership.organization,
    role: membership.role,
    seatUtilization,
    assignedLearning,
    courses,
    teams: teamsAnalytics,
  };
}
