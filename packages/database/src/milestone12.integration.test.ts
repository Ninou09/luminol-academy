import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `m12-user-${suffix}`;
const eventId = `m12-event-${suffix}`;

suite('Milestone 12 PostgreSQL invariants', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-${suffix}`,
        email: `${suffix}@example.test`,
      },
    });
  });
  afterAll(async () => {
    await db.notificationEvent.deleteMany({ where: { recipientId: userId } });
    await db.rateLimitBucket.deleteMany({
      where: { key: { startsWith: `test-${suffix}` } },
    });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  test('rejects duplicate notification events', async () => {
    const data = {
      id: eventId,
      idempotencyKey: `event-key-${suffix}`,
      recipientId: userId,
      templateKey: 'account_notice',
      category: 'TRANSACTIONAL' as const,
      payload: {},
    };
    await db.notificationEvent.create({ data });
    await expect(
      db.notificationEvent.create({
        data: { ...data, id: `${eventId}-duplicate` },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  test('claims a due delivery only once under concurrency', async () => {
    const notification = await db.notification.create({
      data: {
        eventId,
        recipientId: userId,
        channel: 'EMAIL',
        title: 'Account notice',
        preview: 'Account notice',
        body: 'Account notice',
      },
    });
    const claim = (token: string) => db.$queryRaw<Array<{ id: string }>>`
      UPDATE "Notification" SET "status" = 'PROCESSING', "lockToken" = ${token}, "lockedUntil" = NOW() + INTERVAL '5 minutes'
      WHERE "id" = ${notification.id} AND "status" = 'PENDING' RETURNING "id"`;
    const claims = await Promise.all([
      claim(`test-${suffix}-a`),
      claim(`test-${suffix}-b`),
    ]);
    expect(claims.flat()).toHaveLength(1);
  });

  test('updates a distributed rate-limit bucket atomically', async () => {
    const key = `test-${suffix}-rate`;
    await Promise.all(
      Array.from(
        { length: 10 },
        () => db.$executeRaw`
      INSERT INTO "RateLimitBucket" ("key", "count", "windowEnd", "updatedAt") VALUES (${key}, 1, NOW() + INTERVAL '1 minute', NOW())
      ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1, "updatedAt" = NOW()`,
      ),
    );
    await expect(
      db.rateLimitBucket.findUniqueOrThrow({ where: { key } }),
    ).resolves.toMatchObject({ count: 10 });
  });
});
