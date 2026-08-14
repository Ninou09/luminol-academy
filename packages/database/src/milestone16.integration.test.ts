import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

const organizationAId = `m16-org-a-${suffix}`;
const organizationBId = `m16-org-b-${suffix}`;
const capacityOrganizationId = `m16-org-cap-${suffix}`;
const userAId = `m16-user-a-${suffix}`;
const userBId = `m16-user-b-${suffix}`;
const userCId = `m16-user-c-${suffix}`;
const userDId = `m16-user-d-${suffix}`;
const courseAId = `m16-course-a-${suffix}`;
const courseBId = `m16-course-b-${suffix}`;
const courseCId = `m16-course-c-${suffix}`;

suite('Milestone 16 organization persistence invariants', () => {
  let enrollmentAId: string;
  let enrollmentBId: string;
  let enrollmentASecondCourseId: string;
  let organizationCourseAId: string;
  let inactiveOrganizationCourseId: string;
  let sponsorshipId: string;
  let seatAId: string;
  let teamId: string;

  beforeAll(async () => {
    await db.organization.createMany({
      data: [
        { id: organizationAId, name: 'Organization A', seatLimit: 2 },
        { id: organizationBId, name: 'Organization B', seatLimit: 2 },
        {
          id: capacityOrganizationId,
          name: 'Capacity Organization',
          seatLimit: 1,
        },
      ],
    });

    await db.user.createMany({
      data: [
        {
          id: userAId,
          clerkId: `m16-clerk-a-${suffix}`,
          email: `m16-a-${suffix}@example.test`,
        },
        {
          id: userBId,
          clerkId: `m16-clerk-b-${suffix}`,
          email: `m16-b-${suffix}@example.test`,
        },
        {
          id: userCId,
          clerkId: `m16-clerk-c-${suffix}`,
          email: `m16-c-${suffix}@example.test`,
        },
        {
          id: userDId,
          clerkId: `m16-clerk-d-${suffix}`,
          email: `m16-d-${suffix}@example.test`,
        },
      ],
    });

    await db.course.createMany({
      data: [
        {
          id: courseAId,
          sanityId: `m16-sanity-a-${suffix}`,
          slug: `m16-course-a-${suffix}`,
          title: 'Milestone 16 Course A',
          published: true,
        },
        {
          id: courseBId,
          sanityId: `m16-sanity-b-${suffix}`,
          slug: `m16-course-b-${suffix}`,
          title: 'Milestone 16 Course B',
          published: true,
        },
        {
          id: courseCId,
          sanityId: `m16-sanity-c-${suffix}`,
          slug: `m16-course-c-${suffix}`,
          title: 'Milestone 16 Course C',
          published: true,
        },
      ],
    });

    const [enrollmentA, enrollmentB, enrollmentASecondCourse] =
      await Promise.all([
        db.enrollment.create({
          data: { userId: userAId, courseId: courseAId, status: 'ACTIVE' },
          select: { id: true },
        }),
        db.enrollment.create({
          data: { userId: userBId, courseId: courseAId, status: 'ACTIVE' },
          select: { id: true },
        }),
        db.enrollment.create({
          data: { userId: userAId, courseId: courseBId, status: 'ACTIVE' },
          select: { id: true },
        }),
      ]);

    enrollmentAId = enrollmentA.id;
    enrollmentBId = enrollmentB.id;
    enrollmentASecondCourseId = enrollmentASecondCourse.id;

    const [organizationCourseA, inactiveOrganizationCourse, seatA] =
      await Promise.all([
        db.organizationCourse.create({
          data: { organizationId: organizationAId, courseId: courseAId },
          select: { id: true },
        }),
        db.organizationCourse.create({
          data: {
            organizationId: organizationAId,
            courseId: courseBId,
            active: false,
            unassignedAt: new Date(),
          },
          select: { id: true },
        }),
        db.organizationSeat.create({
          data: {
            organizationId: organizationAId,
            userId: userAId,
            status: 'ACTIVE',
          },
          select: { id: true },
        }),
      ]);

    organizationCourseAId = organizationCourseA.id;
    inactiveOrganizationCourseId = inactiveOrganizationCourse.id;
    seatAId = seatA.id;

    await Promise.all([
      db.organizationSeat.create({
        data: {
          organizationId: organizationAId,
          userId: userCId,
          status: 'ACTIVE',
        },
      }),
      db.organizationSeat.create({
        data: {
          organizationId: organizationBId,
          userId: userBId,
          status: 'ACTIVE',
        },
      }),
    ]);

    const team = await db.team.create({
      data: { organizationId: organizationAId, name: `Team ${suffix}` },
      select: { id: true },
    });
    teamId = team.id;
  });

  test('serializes seat capacity under concurrent allocations', async () => {
    const results = await Promise.allSettled([
      db.organizationSeat.create({
        data: { organizationId: capacityOrganizationId, userId: userCId },
      }),
      db.organizationSeat.create({
        data: { organizationId: capacityOrganizationId, userId: userDId },
      }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
  });

  test('requires consistent organization membership lifecycle state', async () => {
    await expect(
      db.organizationMembership.create({
        data: {
          organizationId: organizationAId,
          userId: userBId,
          role: 'LEARNER',
          active: false,
        },
      }),
    ).rejects.toThrow();

    const membership = await db.organizationMembership.create({
      data: {
        organizationId: organizationAId,
        userId: userBId,
        role: 'LEARNER',
        active: true,
      },
      select: { id: true },
    });

    await expect(
      db.organizationMembership.update({
        where: { id: membership.id },
        data: { active: false },
      }),
    ).rejects.toThrow();

    await expect(
      db.organizationMembership.update({
        where: { id: membership.id },
        data: { active: false, endedAt: new Date() },
      }),
    ).resolves.toMatchObject({ active: false });
  });

  test('rejects sponsorship of a learner outside the organization tenant', async () => {
    await expect(
      db.organizationEnrollmentSponsorship.create({
        data: {
          organizationCourseId: organizationCourseAId,
          enrollmentId: enrollmentBId,
        },
      }),
    ).rejects.toThrow('Organization seat required for sponsorship history');

    await expect(
      db.organizationEnrollmentSponsorship.create({
        data: {
          organizationCourseId: organizationCourseAId,
          enrollmentId: enrollmentBId,
          active: false,
          endedAt: new Date(),
        },
      }),
    ).rejects.toThrow('Organization seat required for sponsorship history');
  });

  test('rejects active sponsorship from an unassigned organization course', async () => {
    await expect(
      db.organizationEnrollmentSponsorship.create({
        data: {
          organizationCourseId: inactiveOrganizationCourseId,
          enrollmentId: enrollmentASecondCourseId,
        },
      }),
    ).rejects.toThrow(
      'Active organization course assignment required for sponsorship',
    );
  });

  test('keeps a team tenant immutable', async () => {
    await expect(
      db.team.update({
        where: { id: teamId },
        data: { organizationId: organizationBId },
      }),
    ).rejects.toThrow('Team organization identity is immutable');
  });

  test('rejects seat limits below persisted allocation', async () => {
    await expect(
      db.organization.update({
        where: { id: organizationAId },
        data: { seatLimit: 1 },
      }),
    ).rejects.toThrow(
      'Organization seat limit cannot be lower than allocated seats',
    );
  });

  test('protects active sponsored learning from parent-side mutations', async () => {
    const sponsorship = await db.organizationEnrollmentSponsorship.create({
      data: {
        organizationCourseId: organizationCourseAId,
        enrollmentId: enrollmentAId,
      },
      select: { id: true },
    });
    sponsorshipId = sponsorship.id;

    await expect(
      db.enrollment.update({
        where: { id: enrollmentAId },
        data: { courseId: courseCId },
      }),
    ).rejects.toThrow('Sponsored enrollment identity is immutable');

    await expect(
      db.organizationCourse.update({
        where: { id: organizationCourseAId },
        data: { active: false, unassignedAt: new Date() },
      }),
    ).rejects.toThrow(
      'End active sponsorships before unassigning organization course',
    );

    await expect(
      db.organizationSeat.update({
        where: { id: seatAId },
        data: { status: 'REVOKED', revokedAt: new Date() },
      }),
    ).rejects.toThrow(
      'End active sponsorships before closing organization seat',
    );

    await expect(
      db.organizationSeat.delete({ where: { id: seatAId } }),
    ).rejects.toThrow(
      'End active sponsorships before deleting organization seat',
    );

    await expect(
      db.organization.update({
        where: { id: organizationAId },
        data: { status: 'SUSPENDED' },
      }),
    ).rejects.toThrow(
      'End active sponsorships before suspending or archiving organization',
    );

    await expect(
      db.organizationEnrollmentSponsorship.delete({
        where: { id: sponsorshipId },
      }),
    ).rejects.toThrow('Organization sponsorship history cannot be deleted');
  });

  test('keeps ended sponsorship history terminal', async () => {
    await db.organizationEnrollmentSponsorship.update({
      where: { id: sponsorshipId },
      data: { active: false, endedAt: new Date() },
    });

    await expect(
      db.organizationEnrollmentSponsorship.update({
        where: { id: sponsorshipId },
        data: { active: true, endedAt: null },
      }),
    ).rejects.toThrow('Ended organization sponsorship is terminal');
  });

  test('allows lifecycle closure after the sponsorship is ended', async () => {
    await expect(
      db.organizationCourse.update({
        where: { id: organizationCourseAId },
        data: { active: false, unassignedAt: new Date() },
      }),
    ).resolves.toMatchObject({ active: false });

    await expect(
      db.organizationSeat.update({
        where: { id: seatAId },
        data: { status: 'REVOKED', revokedAt: new Date() },
      }),
    ).resolves.toMatchObject({ status: 'REVOKED' });
  });
});
