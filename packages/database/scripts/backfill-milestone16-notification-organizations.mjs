import { setTimeout as sleep } from 'node:timers/promises';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required for the Milestone 16 notification backfill.',
  );
}

const batchSize = 500;
const retryDelayMs = 50;
const client = new Client({ connectionString });

const eligibleSql = `
  FROM "Notification" AS notification
  INNER JOIN "NotificationEvent" AS event
    ON event."id" = notification."eventId"
  INNER JOIN "Organization" AS organization
    ON organization."id" = notification."organizationId"
  INNER JOIN "OrganizationMembership" AS membership
    ON membership."organizationId" = organization."id"
   AND membership."userId" = notification."recipientId"
  INNER JOIN "User" AS recipient
    ON recipient."id" = notification."recipientId"
  WHERE notification."organizationRecordId" IS NULL
    AND organization."status" = 'ACTIVE'
    AND organization."archivedAt" IS NULL
    AND event."organizationId" = organization."id"
    AND event."organizationRecordId" = organization."id"
    AND notification."recipientId" = event."recipientId"
    AND membership."active" = TRUE
    AND membership."endedAt" IS NULL
    AND recipient."deletedAt" IS NULL
`;

async function backfillBatch() {
  await client.query('BEGIN');

  try {
    const result = await client.query(
      `
        WITH candidate AS (
          SELECT notification."id"
          ${eligibleSql}
          ORDER BY notification."id"
          FOR UPDATE OF notification SKIP LOCKED
          LIMIT $1
        )
        UPDATE "Notification" AS notification
        SET "organizationRecordId" = event."organizationRecordId"
        FROM candidate, "NotificationEvent" AS event
        WHERE notification."id" = candidate."id"
          AND event."id" = notification."eventId"
          AND notification."organizationRecordId" IS NULL
          AND event."organizationRecordId" IS NOT NULL
          AND notification."organizationId" = event."organizationId"
          AND notification."recipientId" = event."recipientId"
        RETURNING notification."id"
      `,
      [batchSize],
    );

    await client.query('COMMIT');
    return result.rowCount ?? 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function hasEligibleRows() {
  const result = await client.query(
    `SELECT EXISTS (SELECT 1 ${eligibleSql}) AS "exists"`,
  );
  return result.rows[0]?.exists === true;
}

await client.connect();

try {
  let totalUpdated = 0;

  for (;;) {
    const updated = await backfillBatch();
    totalUpdated += updated;

    if (updated > 0) {
      continue;
    }

    if (!(await hasEligibleRows())) {
      break;
    }

    await sleep(retryDelayMs);
  }

  process.stdout.write(
    `Milestone 16 notification organization backfill updated ${totalUpdated} rows.\n`,
  );
} finally {
  await client.end();
}
