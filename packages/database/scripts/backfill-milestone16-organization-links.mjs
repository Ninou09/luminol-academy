import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required for the Milestone 16 organization-link backfill.',
  );
}

const batchSize = 500;
const retryDelayMs = 50;
const maxIdleRetries = 600;
const lockTimeout = '2s';
const retryableDatabaseCodes = new Set(['40P01', '55P03']);
const client = new Client({ connectionString });

const backfills = [
  {
    name: 'Invoice',
    eligibleSql: `
      FROM "Invoice" AS invoice
      INNER JOIN "Organization" AS organization
        ON organization."id" = invoice."organizationId"
      WHERE invoice."organizationRecordId" IS NULL
        AND organization."status" = 'ACTIVE'
        AND organization."archivedAt" IS NULL
    `,
    updateSql: `
      WITH candidate AS (
        SELECT invoice."id"
        FROM "Invoice" AS invoice
        INNER JOIN "Organization" AS organization
          ON organization."id" = invoice."organizationId"
        WHERE invoice."organizationRecordId" IS NULL
          AND organization."status" = 'ACTIVE'
          AND organization."archivedAt" IS NULL
        ORDER BY invoice."id"
        FOR UPDATE OF invoice SKIP LOCKED
        LIMIT $1
      )
      UPDATE "Invoice" AS invoice
      SET "organizationRecordId" = invoice."organizationId"
      FROM candidate
      WHERE invoice."id" = candidate."id"
        AND invoice."organizationRecordId" IS NULL
      RETURNING invoice."id"
    `,
  },
  {
    name: 'CorporateBillingRecord',
    eligibleSql: `
      FROM "CorporateBillingRecord" AS billing
      INNER JOIN "Invoice" AS invoice
        ON invoice."id" = billing."invoiceId"
      INNER JOIN "Organization" AS organization
        ON organization."id" = billing."organizationId"
      WHERE billing."organizationRecordId" IS NULL
        AND organization."status" = 'ACTIVE'
        AND organization."archivedAt" IS NULL
        AND invoice."organizationId" = organization."id"
        AND invoice."organizationRecordId" = organization."id"
    `,
    updateSql: `
      WITH candidate AS (
        SELECT billing."id"
        FROM "CorporateBillingRecord" AS billing
        INNER JOIN "Invoice" AS invoice
          ON invoice."id" = billing."invoiceId"
        INNER JOIN "Organization" AS organization
          ON organization."id" = billing."organizationId"
        WHERE billing."organizationRecordId" IS NULL
          AND organization."status" = 'ACTIVE'
          AND organization."archivedAt" IS NULL
          AND invoice."organizationId" = organization."id"
          AND invoice."organizationRecordId" = organization."id"
        ORDER BY billing."id"
        FOR UPDATE OF billing, invoice SKIP LOCKED
        LIMIT $1
      )
      UPDATE "CorporateBillingRecord" AS billing
      SET "organizationRecordId" = billing."organizationId"
      FROM candidate
      WHERE billing."id" = candidate."id"
        AND billing."organizationRecordId" IS NULL
      RETURNING billing."id"
    `,
  },
  {
    name: 'NotificationEvent',
    eligibleSql: `
      FROM "NotificationEvent" AS event
      INNER JOIN "Organization" AS organization
        ON organization."id" = event."organizationId"
      INNER JOIN "OrganizationMembership" AS membership
        ON membership."organizationId" = organization."id"
       AND membership."userId" = event."recipientId"
      INNER JOIN "User" AS recipient
        ON recipient."id" = event."recipientId"
      WHERE event."organizationRecordId" IS NULL
        AND organization."status" = 'ACTIVE'
        AND organization."archivedAt" IS NULL
        AND membership."active" = TRUE
        AND membership."endedAt" IS NULL
        AND recipient."deletedAt" IS NULL
    `,
    updateSql: `
      WITH candidate AS (
        SELECT event."id"
        FROM "NotificationEvent" AS event
        INNER JOIN "Organization" AS organization
          ON organization."id" = event."organizationId"
        INNER JOIN "OrganizationMembership" AS membership
          ON membership."organizationId" = organization."id"
         AND membership."userId" = event."recipientId"
        INNER JOIN "User" AS recipient
          ON recipient."id" = event."recipientId"
        WHERE event."organizationRecordId" IS NULL
          AND organization."status" = 'ACTIVE'
          AND organization."archivedAt" IS NULL
          AND membership."active" = TRUE
          AND membership."endedAt" IS NULL
          AND recipient."deletedAt" IS NULL
        ORDER BY event."id"
        FOR UPDATE OF event SKIP LOCKED
        LIMIT $1
      )
      UPDATE "NotificationEvent" AS event
      SET "organizationRecordId" = event."organizationId"
      FROM candidate
      WHERE event."id" = candidate."id"
        AND event."organizationRecordId" IS NULL
      RETURNING event."id"
    `,
  },
  {
    name: 'Notification',
    eligibleSql: `
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
    `,
    updateSql: `
      WITH candidate AS (
        SELECT notification."id"
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
        ORDER BY notification."id"
        FOR UPDATE OF notification, event SKIP LOCKED
        LIMIT $1
      )
      UPDATE "Notification" AS notification
      SET "organizationRecordId" = notification."organizationId"
      FROM candidate
      WHERE notification."id" = candidate."id"
        AND notification."organizationRecordId" IS NULL
      RETURNING notification."id"
    `,
  },
];

async function updateBatch(backfill) {
  await client.query('BEGIN');

  try {
    await client.query(`SET LOCAL lock_timeout = '${lockTimeout}'`);
    const result = await client.query(backfill.updateSql, [batchSize]);
    await client.query('COMMIT');
    return { retryable: false, updated: result.rowCount ?? 0 };
  } catch (error) {
    await client.query('ROLLBACK');

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      retryableDatabaseCodes.has(error.code)
    ) {
      return { retryable: true, updated: 0 };
    }

    throw error;
  }
}

async function hasEligibleRows(backfill) {
  const result = await client.query(
    `SELECT EXISTS (SELECT 1 ${backfill.eligibleSql}) AS "exists"`,
  );
  return result.rows[0]?.exists === true;
}

async function waitOrFail(backfill, idleRetries) {
  const nextRetries = idleRetries + 1;

  if (nextRetries >= maxIdleRetries) {
    throw new Error(
      `Milestone 16 ${backfill.name} backfill could not acquire eligible rows after ${maxIdleRetries} retries.`,
    );
  }

  await sleep(retryDelayMs);
  return nextRetries;
}

async function runBackfill(backfill) {
  let totalUpdated = 0;
  let idleRetries = 0;

  for (;;) {
    const batch = await updateBatch(backfill);
    totalUpdated += batch.updated;

    if (batch.updated > 0) {
      idleRetries = 0;
      continue;
    }

    if (batch.retryable) {
      idleRetries = await waitOrFail(backfill, idleRetries);
      continue;
    }

    if (!(await hasEligibleRows(backfill))) {
      break;
    }

    idleRetries = await waitOrFail(backfill, idleRetries);
  }

  process.stdout.write(
    `Milestone 16 ${backfill.name} organization-link backfill updated ${totalUpdated} rows.\n`,
  );
}

await client.connect();

try {
  for (const backfill of backfills) {
    await runBackfill(backfill);
  }
} finally {
  await client.end();
}
