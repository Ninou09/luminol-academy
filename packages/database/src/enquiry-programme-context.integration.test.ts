import { describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

suite('enquiry programme context persistence', () => {
  test('persists a verified programme snapshot while keeping legacy rows nullable', async () => {
    const enquiry = await db.enquiry.create({
      data: {
        id: `enquiry-programme-${suffix}`,
        name: `Programme Context Test ${suffix}`,
        email: `enquiry-programme-${suffix}@example.test`,
        school: 'PSYCHOLOGY',
        programmeSlug: 'acceptance-commitment-therapy',
        programmeTitleSnapshot: 'Acceptance and Commitment Therapy',
        message: 'I would like to ask about this programme and the next steps.',
        consent: true,
      },
      select: { programmeSlug: true, programmeTitleSnapshot: true },
    });

    expect(enquiry).toEqual({
      programmeSlug: 'acceptance-commitment-therapy',
      programmeTitleSnapshot: 'Acceptance and Commitment Therapy',
    });

    const legacyCompatible = await db.enquiry.create({
      data: {
        id: `enquiry-programme-legacy-${suffix}`,
        name: `Legacy Programme Context Test ${suffix}`,
        email: `enquiry-programme-legacy-${suffix}@example.test`,
        school: 'GENERAL',
        message: 'This row verifies programme context remains optional.',
        consent: true,
      },
      select: { programmeSlug: true, programmeTitleSnapshot: true },
    });

    expect(legacyCompatible).toEqual({
      programmeSlug: null,
      programmeTitleSnapshot: null,
    });
  });

  test('rejects partial and oversized programme snapshots at the database boundary', async () => {
    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-programme-partial-${suffix}`,
          name: `Partial Programme Context Test ${suffix}`,
          email: `enquiry-programme-partial-${suffix}@example.test`,
          school: 'GENERAL',
          programmeSlug: 'programme-only',
          message:
            'This row should fail because the programme pair is partial.',
          consent: true,
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-programme-oversized-${suffix}`,
          name: `Oversized Programme Context Test ${suffix}`,
          email: `enquiry-programme-oversized-${suffix}@example.test`,
          school: 'GENERAL',
          programmeSlug: 'bounded-programme',
          programmeTitleSnapshot: 'x'.repeat(121),
          message:
            'This row should fail because the programme title is too long.',
          consent: true,
        },
      }),
    ).rejects.toThrow();
  });
});
