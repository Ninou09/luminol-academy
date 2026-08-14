'use server';

import { requirePlatformPermission } from '@luminol/auth';
import { localizeHref } from '@luminol/localization';
import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  getOrganizationSeatLifecycleUpdate,
  ORGANIZATION_MEMBERSHIP_ROLES,
  ORGANIZATION_SEAT_STATUSES,
} from '../../lib/organization-admin';

const idSchema = z.string().min(1).max(128);
const organizationAdminSearchSchema = z.object({
  locale: z.enum(['ar', 'fr', 'en']),
  organizationQuery: z.string().trim().max(160).default(''),
  userQuery: z.string().trim().max(160).default(''),
  teamQuery: z.string().trim().max(160).default(''),
  courseQuery: z.string().trim().max(160).default(''),
});
const ORGANIZATION_ADMIN_USER_SEARCH_COOKIE =
  'luminol-organization-admin-user-search';
const organizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  seatLimit: z.coerce.number().int().positive().max(100_000),
});
const organizationIdSchema = z.object({ organizationId: idSchema });
const membershipSchema = z.object({
  organizationId: idSchema,
  userId: idSchema,
  role: z.enum(ORGANIZATION_MEMBERSHIP_ROLES),
});
const membershipMutationSchema = z.object({
  organizationId: idSchema,
  membershipId: idSchema,
});
const membershipRoleSchema = membershipMutationSchema.extend({
  role: z.enum(ORGANIZATION_MEMBERSHIP_ROLES),
});
const teamSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(2).max(160),
});
const teamMutationSchema = z.object({
  organizationId: idSchema,
  teamId: idSchema,
});
const teamMembershipSchema = teamMutationSchema.extend({
  membershipId: idSchema,
});
const teamMembershipMutationSchema = teamMutationSchema.extend({
  teamMembershipId: idSchema,
});
const seatSchema = z.object({
  organizationId: idSchema,
  userId: idSchema,
});
const seatTransitionSchema = z.object({
  organizationId: idSchema,
  seatId: idSchema,
  toStatus: z.enum(ORGANIZATION_SEAT_STATUSES),
});
const courseSchema = z.object({
  organizationId: idSchema,
  courseId: idSchema,
});
const organizationCourseMutationSchema = z.object({
  organizationId: idSchema,
  organizationCourseId: idSchema,
});

type Transaction = Prisma.TransactionClient;

async function audit(
  transaction: Transaction,
  actorUserId: string,
  organizationId: string,
  action: string,
  subjectType: string,
  subjectId: string,
) {
  await transaction.organizationAuditEvent.create({
    data: {
      actorUserId,
      organizationId,
      action,
      subjectType,
      subjectId,
    },
  });
}

async function requireActiveOrganization(
  transaction: Transaction,
  organizationId: string,
) {
  const organizations = await transaction.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "Organization"
    WHERE "id" = ${organizationId}
      AND "status" = 'ACTIVE'::"OrganizationStatus"
    FOR UPDATE
  `;

  if (organizations.length !== 1) {
    throw new Error('Active organization not found');
  }
}

function revalidateOrganizationAdmin() {
  revalidatePath('/organizations');
  revalidatePath('/');
}

export async function createOrganization(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = organizationSchema.parse({
    name: formData.get('name'),
    seatLimit: formData.get('seatLimit'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    const organization = await transaction.organization.create({
      data: input,
      select: { id: true },
    });

    await audit(
      transaction,
      administrator.id,
      organization.id,
      'organization.created',
      'organization',
      organization.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function archiveOrganization(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = organizationIdSchema.parse({
    organizationId: formData.get('organizationId'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Transaction) => {
    const updated = await transaction.organization.updateMany({
      where: { id: input.organizationId, status: { not: 'ARCHIVED' } },
      data: { status: 'ARCHIVED', archivedAt: now },
    });

    if (updated.count !== 1) {
      throw new Error('Organization not found or already archived');
    }

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'organization.archived',
      'organization',
      input.organizationId,
    );
  });

  revalidateOrganizationAdmin();
}

export async function upsertOrganizationMembership(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = membershipSchema.parse({
    organizationId: formData.get('organizationId'),
    userId: formData.get('userId'),
    role: formData.get('role'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const [organization, user, existing] = await Promise.all([
      transaction.organization.findFirst({
        where: { id: input.organizationId, status: 'ACTIVE' },
        select: { id: true },
      }),
      transaction.user.findFirst({
        where: { id: input.userId, deletedAt: null },
        select: { id: true },
      }),
      transaction.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId,
          },
        },
        select: { id: true, active: true },
      }),
    ]);

    if (!organization || !user) {
      throw new Error('Active organization or user not found');
    }
    if (existing?.active) {
      throw new Error('User already has an active organization membership');
    }

    const membership = existing
      ? await transaction.organizationMembership.update({
          where: { id: existing.id },
          data: { role: input.role, active: true, endedAt: null },
          select: { id: true },
        })
      : await transaction.organizationMembership.create({
          data: {
            organizationId: input.organizationId,
            userId: input.userId,
            role: input.role,
            active: true,
          },
          select: { id: true },
        });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      existing ? 'membership.reactivated' : 'membership.created',
      'organizationMembership',
      membership.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function deactivateOrganizationMembership(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = membershipMutationSchema.parse({
    organizationId: formData.get('organizationId'),
    membershipId: formData.get('membershipId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const membership = await transaction.organizationMembership.findFirst({
      where: {
        id: input.membershipId,
        organizationId: input.organizationId,
        active: true,
      },
      select: { id: true, userId: true },
    });

    if (!membership) {
      throw new Error('Active organization membership not found');
    }

    const openSeat = await transaction.organizationSeat.findFirst({
      where: {
        organizationId: input.organizationId,
        userId: membership.userId,
        status: { in: ['INVITED', 'ACTIVE'] },
      },
      select: { id: true },
    });

    if (openSeat) {
      throw new Error(
        'Close the organization seat before deactivating membership',
      );
    }

    const updated = await transaction.organizationMembership.updateMany({
      where: {
        id: membership.id,
        organizationId: input.organizationId,
        active: true,
      },
      data: { active: false, endedAt: new Date() },
    });

    if (updated.count !== 1) {
      throw new Error('Organization membership was updated concurrently');
    }

    await transaction.teamMembership.deleteMany({
      where: { organizationMembershipId: membership.id },
    });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'membership.deactivated',
      'organizationMembership',
      membership.id,
    );
  });

  revalidateOrganizationAdmin();
}
export async function updateOrganizationMembershipRole(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = membershipRoleSchema.parse({
    organizationId: formData.get('organizationId'),
    membershipId: formData.get('membershipId'),
    role: formData.get('role'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const updated = await transaction.organizationMembership.updateMany({
      where: {
        id: input.membershipId,
        organizationId: input.organizationId,
        active: true,
      },
      data: { role: input.role },
    });

    if (updated.count !== 1) {
      throw new Error('Active organization membership not found');
    }

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'membership.role_changed',
      'organizationMembership',
      input.membershipId,
    );
  });

  revalidateOrganizationAdmin();
}

export async function createOrganizationTeam(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = teamSchema.parse({
    organizationId: formData.get('organizationId'),
    name: formData.get('name'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const organization = await transaction.organization.findFirst({
      where: { id: input.organizationId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!organization) throw new Error('Active organization not found');

    const team = await transaction.team.create({
      data: { organizationId: input.organizationId, name: input.name },
      select: { id: true },
    });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'team.created',
      'team',
      team.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function archiveOrganizationTeam(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = teamMutationSchema.parse({
    organizationId: formData.get('organizationId'),
    teamId: formData.get('teamId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const updated = await transaction.team.updateMany({
      where: {
        id: input.teamId,
        organizationId: input.organizationId,
        archivedAt: null,
      },
      data: { archivedAt: new Date() },
    });

    if (updated.count !== 1)
      throw new Error('Active organization team not found');

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'team.archived',
      'team',
      input.teamId,
    );
  });

  revalidateOrganizationAdmin();
}

export async function addOrganizationTeamMember(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = teamMembershipSchema.parse({
    organizationId: formData.get('organizationId'),
    teamId: formData.get('teamId'),
    membershipId: formData.get('membershipId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const [team, membership] = await Promise.all([
      transaction.team.findFirst({
        where: {
          id: input.teamId,
          organizationId: input.organizationId,
          archivedAt: null,
        },
        select: { id: true },
      }),
      transaction.organizationMembership.findFirst({
        where: {
          id: input.membershipId,
          organizationId: input.organizationId,
          active: true,
        },
        select: { id: true },
      }),
    ]);

    if (!team || !membership) {
      throw new Error('Team or active organization membership not found');
    }

    const teamMembership = await transaction.teamMembership.create({
      data: {
        teamId: team.id,
        organizationMembershipId: membership.id,
      },
      select: { id: true },
    });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'team.membership_added',
      'teamMembership',
      teamMembership.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function removeOrganizationTeamMember(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = teamMembershipMutationSchema.parse({
    organizationId: formData.get('organizationId'),
    teamId: formData.get('teamId'),
    teamMembershipId: formData.get('teamMembershipId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const teamMembership = await transaction.teamMembership.findFirst({
      where: {
        id: input.teamMembershipId,
        teamId: input.teamId,
        team: {
          organizationId: input.organizationId,
          archivedAt: null,
        },
      },
      select: { id: true },
    });

    if (!teamMembership)
      throw new Error('Organization team membership not found');

    await transaction.teamMembership.delete({
      where: { id: teamMembership.id },
    });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'team.membership_removed',
      'teamMembership',
      teamMembership.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function allocateOrganizationSeat(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = seatSchema.parse({
    organizationId: formData.get('organizationId'),
    userId: formData.get('userId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const [organization, membership, existingSeat] = await Promise.all([
      transaction.organization.findFirst({
        where: { id: input.organizationId, status: 'ACTIVE' },
        select: { id: true },
      }),
      transaction.organizationMembership.findFirst({
        where: {
          organizationId: input.organizationId,
          userId: input.userId,
          active: true,
        },
        select: { id: true },
      }),
      transaction.organizationSeat.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!organization || !membership) {
      throw new Error(
        'Active organization membership required for seat allocation',
      );
    }
    if (existingSeat) {
      throw new Error('Organization member already has a seat record');
    }

    const seat = await transaction.organizationSeat.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        status: 'INVITED',
      },
      select: { id: true },
    });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'seat.allocated',
      'organizationSeat',
      seat.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function transitionOrganizationSeat(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = seatTransitionSchema.parse({
    organizationId: formData.get('organizationId'),
    seatId: formData.get('seatId'),
    toStatus: formData.get('toStatus'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const seat = await transaction.organizationSeat.findFirst({
      where: { id: input.seatId, organizationId: input.organizationId },
      select: { id: true, status: true },
    });
    if (!seat) throw new Error('Organization seat not found');

    const lifecycle = getOrganizationSeatLifecycleUpdate(
      seat.status,
      input.toStatus,
      now,
    );
    const updated = await transaction.organizationSeat.updateMany({
      where: {
        id: seat.id,
        organizationId: input.organizationId,
        status: seat.status,
      },
      data: lifecycle,
    });

    if (updated.count !== 1) {
      throw new Error('Organization seat was updated by another administrator');
    }

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      `seat.${input.toStatus.toLowerCase()}`,
      'organizationSeat',
      seat.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function assignOrganizationCourse(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = courseSchema.parse({
    organizationId: formData.get('organizationId'),
    courseId: formData.get('courseId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const [organization, course, existing] = await Promise.all([
      transaction.organization.findFirst({
        where: { id: input.organizationId, status: 'ACTIVE' },
        select: { id: true },
      }),
      transaction.course.findFirst({
        where: { id: input.courseId, published: true },
        select: { id: true },
      }),
      transaction.organizationCourse.findUnique({
        where: {
          organizationId_courseId: {
            organizationId: input.organizationId,
            courseId: input.courseId,
          },
        },
        select: { id: true, active: true },
      }),
    ]);

    if (!organization || !course) {
      throw new Error('Active organization or published course not found');
    }
    if (existing?.active)
      throw new Error('Course already assigned to organization');

    const organizationCourse = existing
      ? await transaction.organizationCourse.update({
          where: { id: existing.id },
          data: { active: true, unassignedAt: null, assignedAt: new Date() },
          select: { id: true },
        })
      : await transaction.organizationCourse.create({
          data: {
            organizationId: input.organizationId,
            courseId: input.courseId,
          },
          select: { id: true },
        });

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      existing ? 'course.reassigned' : 'course.assigned',
      'organizationCourse',
      organizationCourse.id,
    );
  });

  revalidateOrganizationAdmin();
}

export async function unassignOrganizationCourse(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = organizationCourseMutationSchema.parse({
    organizationId: formData.get('organizationId'),
    organizationCourseId: formData.get('organizationCourseId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireActiveOrganization(transaction, input.organizationId);
    const updated = await transaction.organizationCourse.updateMany({
      where: {
        id: input.organizationCourseId,
        organizationId: input.organizationId,
        active: true,
      },
      data: { active: false, unassignedAt: new Date() },
    });

    if (updated.count !== 1) {
      throw new Error('Active organization course assignment not found');
    }

    await audit(
      transaction,
      administrator.id,
      input.organizationId,
      'course.unassigned',
      'organizationCourse',
      input.organizationCourseId,
    );
  });

  revalidateOrganizationAdmin();
}

function organizationAdminSearchHref(input: {
  locale: 'ar' | 'fr' | 'en';
  organizationQuery: string;
  teamQuery: string;
  courseQuery: string;
}) {
  const params = new URLSearchParams();
  if (input.organizationQuery) params.set('q', input.organizationQuery);
  if (input.teamQuery) params.set('team', input.teamQuery);
  if (input.courseQuery) params.set('course', input.courseQuery);
  const pathname = localizeHref(input.locale, '/organizations');
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

async function persistOrganizationAdminUserSearch(value: string) {
  const cookieStore = await cookies();
  cookieStore.set(ORGANIZATION_ADMIN_USER_SEARCH_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: value ? 300 : 0,
    path: '/',
  });
}

export async function searchOrganizationAdministration(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = organizationAdminSearchSchema.parse({
    locale: formData.get('locale'),
    organizationQuery: formData.get('organizationQuery'),
    userQuery: formData.get('userQuery'),
    teamQuery: formData.get('teamQuery'),
    courseQuery: formData.get('courseQuery'),
  });

  await persistOrganizationAdminUserSearch(input.userQuery);
  redirect(organizationAdminSearchHref(input));
}

export async function clearOrganizationAdministrationSearch(
  formData: FormData,
) {
  await requirePlatformPermission('academy:manage');
  const locale = z.enum(['ar', 'fr', 'en']).parse(formData.get('locale'));
  await persistOrganizationAdminUserSearch('');
  redirect(localizeHref(locale, '/organizations'));
}
