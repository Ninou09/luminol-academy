import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorUserId = `enquiry-outcome-actor-${suffix}`;
const enquiryId = `enquiry-outcome-${suffix}`;
let outcomeEventId: string;

suite('enquiry operational outcome persistence', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: actorUserId,
        clerkId: `enquiry-outcome-clerk-${suffix}`,
        email: `enquiry-outcome-actor-${suffix}@example.test`,
      },
    });

    await db.enquiry.create({
      data: {
        id: enquiryId,
        name: `Outcome Test ${suffix}`,
        email: `enquiry-outcome-${suffix}@example.test`,
        school: 'GENERAL',
        message:
          'Please contact me about the available pathways and next steps.',
        consent: true,
        outcome: 'Follow-up completed; no further action requested.',
        outcomeAt: new Date('2026-08-28T12:00:00.000Z'),
      },
    });

    const event = await db.enquiryOutcomeEvent.create({
      data: {
        enquiryId,
        actorUserId,
        fromOutcome: null,
        toOutcome: 'Follow-up completed; no further action requested.',
        fromOutcomeAt: null,
        toOutcomeAt: new Date('2026-08-28T12:00:00.000Z'),
      },
      select: { id: true },
    });
    outcomeEventId = event.id;
  });

  test('persists an atomic operational outcome pair', async () => {
    const enquiry = await db.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: { outcome: true, outcomeAt: true },
    });

    expect(enquiry.outcome).toBe(
      'Follow-up completed; no further action requested.',
    );
    expect(enquiry.outcomeAt?.toISOString()).toBe('2026-08-28T12:00:00.000Z');
  });

  test('keeps legacy enquiries valid without an outcome', async () => {
    const legacy = await db.enquiry.create({
      data: {
        id: `enquiry-outcome-legacy-${suffix}`,
        name: `Outcome Legacy Test ${suffix}`,
        email: `enquiry-outcome-legacy-${suffix}@example.test`,
        school: 'GENERAL',
        message: 'This row verifies that operational outcomes remain optional.',
        consent: true,
      },
      select: { outcome: true, outcomeAt: true },
    });

    expect(legacy).toEqual({ outcome: null, outcomeAt: null });
  });

  test('rejects partial, blank and oversized outcome pairs at the database boundary', async () => {
    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-outcome-partial-${suffix}`,
          name: `Outcome Partial Test ${suffix}`,
          email: `enquiry-outcome-partial-${suffix}@example.test`,
          school: 'GENERAL',
          message: 'This row should fail because the outcome date is missing.',
          consent: true,
          outcome: 'Operational result recorded.',
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-outcome-blank-${suffix}`,
          name: `Outcome Blank Test ${suffix}`,
          email: `enquiry-outcome-blank-${suffix}@example.test`,
          school: 'GENERAL',
          message: 'This row should fail because the outcome text is blank.',
          consent: true,
          outcome: '   ',
          outcomeAt: new Date('2026-08-28T12:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-outcome-oversized-${suffix}`,
          name: `Outcome Oversized Test ${suffix}`,
          email: `enquiry-outcome-oversized-${suffix}@example.test`,
          school: 'GENERAL',
          message: 'This row should fail because the outcome text is too long.',
          consent: true,
          outcome: 'x'.repeat(241),
          outcomeAt: new Date('2026-08-28T12:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();
  });

  test('keeps enquiry outcome history append-only', async () => {
    await expect(
      db.enquiryOutcomeEvent.update({
        where: { id: outcomeEventId },
        data: { toOutcome: 'Changed after the fact.' },
      }),
    ).rejects.toThrow('Enquiry outcome history is append-only');

    await expect(
      db.enquiryOutcomeEvent.delete({ where: { id: outcomeEventId } }),
    ).rejects.toThrow('Enquiry outcome history is append-only');
  });
});
