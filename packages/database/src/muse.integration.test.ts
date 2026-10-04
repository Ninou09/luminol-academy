import { afterAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { normalizePrismaPostgresConnectionString } from './index';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const suite = testDatabaseUrl ? describe : describe.skip;
const db = testDatabaseUrl
  ? new PrismaClient({
      adapter: new PrismaPg({
        connectionString:
          normalizePrismaPostgresConnectionString(testDatabaseUrl),
      }),
    })
  : null;
suite(
  'Muse PostgreSQL audit and identity invariants (isolated test database only)',
  () => {
    afterAll(async () => {
      await db?.$disconnect();
    });
    test('enforces actor foreign keys and append-only run/event/draft records', async () => {
      if (!db) throw new Error('TEST_DATABASE_URL_REQUIRED');
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
