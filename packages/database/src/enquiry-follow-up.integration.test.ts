import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorUserId = `enquiry-follow-up-actor-${suffix}`;
const enquiryId = `enquiry-follow-up-enquiry-${suffix}`;
const followUpAt = new Date('2030-05-12T00:00:00.000Z');
let eventId: string;

suite('enquiry follow-up plan persistence invariants', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: actorUserId,
        clerkId: `enquiry-follow-up-clerk-${suffix}`,
        email: `enquiry-follow-up-actor-${suffix}@example.test`,
      },
    });

    await db.enquiry.create({
      data: {
        id: enquiryId,
        name: `Follow-up Test ${suffix}`,
        email: `enquiry-follow-up-lead-${suffix}@example.test`,
        school: 'GENERAL',
        message: 'Please contact me about the available learning pathways.',
        consent: true,
        nextFollowUpAt: followUpAt,
        nextAction: 'Confirm the preferred consultation format.',
      },
    });

    const event = await db.enquiryFollowUpEvent.create({
      data: {
        enquiryId,
        actorUserId,
        fromNextFollowUpAt: null,
        toNextFollowUpAt: followUpAt,
        fromNextAction: null,
        toNextAction: 'Confirm the preferred consultation format.',
      },
      select: { id: true },
    });
    eventId = event.id;
  });

  test('persists the next follow-up date and action as one plan', async () => {
    const enquiry = await db.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: { nextFollowUpAt: true, nextAction: true },
    });

    expect(enquiry.nextFollowUpAt?.toISOString()).toBe(
      followUpAt.toISOString(),
    );
    expect(enquiry.nextAction).toBe(
      'Confirm the preferred consultation format.',
    );
  });

  test('rejects a partial follow-up plan at the database boundary', async () => {
    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-follow-up-invalid-${suffix}`,
          name: `Invalid Follow-up ${suffix}`,
          email: `enquiry-follow-up-invalid-${suffix}@example.test`,
          school: 'GENERAL',
          message: 'Please contact me.',
          consent: true,
          nextAction: 'Call tomorrow.',
        },
      }),
    ).rejects.toThrow();
  });

  test('keeps enquiry follow-up history append-only', async () => {
    await expect(
      db.enquiryFollowUpEvent.update({
        where: { id: eventId },
        data: { toNextAction: 'Changed after the fact.' },
      }),
    ).rejects.toThrow('Enquiry follow-up history is append-only');

    await expect(
      db.enquiryFollowUpEvent.delete({ where: { id: eventId } }),
    ).rejects.toThrow('Enquiry follow-up history is append-only');
  });
});
