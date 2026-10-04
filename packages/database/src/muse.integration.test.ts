import { describe, expect, test } from 'vitest';
import { db } from './index';

const suite = process.env.TEST_DATABASE_URL ? describe : describe.skip;
suite(
  'Muse PostgreSQL audit and identity invariants (isolated test database only)',
  () => {
    test('enforces actor foreign keys and append-only run/event/draft records', async () => {
      const suffix = `${process.pid}-${Date.now()}`;
      const actor = await db.user.create({
        data: {
          clerkId: `muse-${suffix}`,
          email: `muse-${suffix}@example.test`,
        },
      });
      const run = await db.museRun.create({
        data: {
          actorId: actor.id,
          requestId: `test-${suffix}`,
          agent: 'main',
          intent: 'briefing',
          prompt: 'test',
          response: { text: 'test' },
        },
      });
      const event = await db.museEvent.create({
        data: {
          actorId: actor.id,
          kind: 'COMMAND_COMPLETED',
          reference: run.id,
        },
      });
      await expect(
        db.museRun.update({
          where: { id: run.id },
          data: { prompt: 'tampered' },
        }),
      ).rejects.toThrow();
      await expect(
        db.museEvent.delete({ where: { id: event.id } }),
      ).rejects.toThrow();
      await expect(
        db.museTask.create({
          data: {
            actorId: `missing-${suffix}`,
            agent: 'main',
            title: 'test',
            goal: '',
            dueAt: new Date(),
          },
        }),
      ).rejects.toThrow();
      const lead = await db.enquiry.create({
        data: {
          name: 'Test',
          email: `${suffix}@example.test`,
          message: 'test',
          school: 'GENERAL',
          consent: true,
        },
      });
      const draft = await db.museDraft.create({
        data: {
          actorId: actor.id,
          requestId: `draft-${suffix}`,
          enquiryId: lead.id,
          recipient: '+213555123456',
          text: 'Approved snapshot',
        },
      });
      await expect(
        db.museDraft.update({
          where: { id: draft.id },
          data: { text: 'Changed' },
        }),
      ).rejects.toThrow();
      // Immutable audit fixtures intentionally remain in the disposable test DB.
    });
  },
);
