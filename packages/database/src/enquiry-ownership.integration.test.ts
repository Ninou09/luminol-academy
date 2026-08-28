import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorUserId = `enquiry-owner-actor-${suffix}`;
const ownerUserId = `enquiry-owner-user-${suffix}`;
const enquiryId = `enquiry-owner-enquiry-${suffix}`;
let ownershipEventId: string;

suite('enquiry ownership persistence invariants', () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [
        {
          id: actorUserId,
          clerkId: `enquiry-owner-actor-clerk-${suffix}`,
          email: `enquiry-owner-actor-${suffix}@example.test`,
        },
        {
          id: ownerUserId,
          clerkId: `enquiry-owner-user-clerk-${suffix}`,
          email: `enquiry-owner-user-${suffix}@example.test`,
        },
      ],
    });

    await db.enquiry.create({
      data: {
        id: enquiryId,
        name: `Ownership Test ${suffix}`,
        email: `enquiry-owner-lead-${suffix}@example.test`,
        school: 'GENERAL',
        message: 'Please contact me about the available learning pathways.',
        consent: true,
        ownerUserId,
      },
    });

    const event = await db.enquiryOwnershipEvent.create({
      data: {
        enquiryId,
        actorUserId,
        fromOwnerUserId: null,
        toOwnerUserId: ownerUserId,
      },
      select: { id: true },
    });
    ownershipEventId = event.id;
  });

  test('persists and resolves the current enquiry owner', async () => {
    const enquiry = await db.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: {
        ownerUserId: true,
        owner: { select: { id: true, email: true } },
      },
    });

    expect(enquiry.ownerUserId).toBe(ownerUserId);
    expect(enquiry.owner).toMatchObject({
      id: ownerUserId,
      email: `enquiry-owner-user-${suffix}@example.test`,
    });
  });

  test('keeps enquiry ownership history append-only', async () => {
    await expect(
      db.enquiryOwnershipEvent.update({
        where: { id: ownershipEventId },
        data: { toOwnerUserId: actorUserId },
      }),
    ).rejects.toThrow('Enquiry ownership history is append-only');

    await expect(
      db.enquiryOwnershipEvent.delete({ where: { id: ownershipEventId } }),
    ).rejects.toThrow('Enquiry ownership history is append-only');
  });
});
