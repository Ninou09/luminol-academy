import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required for the Milestone 16 organization-link verification.',
  );
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
});

const invariantChecks = [
  {
    name: 'Invoice eligible rows left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "Invoice" AS invoice
      INNER JOIN "Organization" AS organization
        ON organization."id" = invoice."organizationId"
      WHERE invoice."organizationRecordId" IS NULL
        AND organization."status" = 'ACTIVE'
        AND organization."archivedAt" IS NULL
    `,
  },
  {
    name: 'CorporateBillingRecord eligible rows left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
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
  },
  {
    name: 'NotificationEvent eligible rows left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
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
  },
  {
    name: 'Notification eligible rows left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
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
  },
  {
    name: 'Invoice verified identity mismatches',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "Invoice" AS invoice
      LEFT JOIN "Organization" AS organization
        ON organization."id" = invoice."organizationRecordId"
      WHERE invoice."organizationRecordId" IS NOT NULL
        AND (
          invoice."organizationRecordId" IS DISTINCT FROM invoice."organizationId"
          OR organization."id" IS NULL
        )
    `,
  },
  {
    name: 'CorporateBillingRecord verified parent mismatches',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "CorporateBillingRecord" AS billing
      LEFT JOIN "Invoice" AS invoice
        ON invoice."id" = billing."invoiceId"
      LEFT JOIN "Organization" AS organization
        ON organization."id" = billing."organizationRecordId"
      WHERE billing."organizationRecordId" IS NOT NULL
        AND (
          billing."organizationRecordId" IS DISTINCT FROM billing."organizationId"
          OR organization."id" IS NULL
          OR invoice."id" IS NULL
          OR invoice."organizationId" IS DISTINCT FROM billing."organizationId"
          OR invoice."organizationRecordId" IS DISTINCT FROM billing."organizationRecordId"
        )
    `,
  },
  {
    name: 'NotificationEvent verified identity mismatches',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "NotificationEvent" AS event
      LEFT JOIN "Organization" AS organization
        ON organization."id" = event."organizationRecordId"
      WHERE event."organizationRecordId" IS NOT NULL
        AND (
          event."organizationRecordId" IS DISTINCT FROM event."organizationId"
          OR organization."id" IS NULL
        )
    `,
  },
  {
    name: 'Notification verified parent or recipient mismatches',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "Notification" AS notification
      LEFT JOIN "NotificationEvent" AS event
        ON event."id" = notification."eventId"
      LEFT JOIN "Organization" AS organization
        ON organization."id" = notification."organizationRecordId"
      WHERE notification."organizationRecordId" IS NOT NULL
        AND (
          notification."organizationRecordId" IS DISTINCT FROM notification."organizationId"
          OR organization."id" IS NULL
          OR event."id" IS NULL
          OR event."organizationId" IS DISTINCT FROM notification."organizationId"
          OR event."organizationRecordId" IS DISTINCT FROM notification."organizationRecordId"
          OR event."recipientId" IS DISTINCT FROM notification."recipientId"
        )
    `,
  },
];

const evidenceQueries = [
  {
    name: 'Invoice verified rows',
    sql: `SELECT COUNT(*)::bigint AS count FROM "Invoice" WHERE "organizationRecordId" IS NOT NULL`,
  },
  {
    name: 'CorporateBillingRecord verified rows',
    sql: `SELECT COUNT(*)::bigint AS count FROM "CorporateBillingRecord" WHERE "organizationRecordId" IS NOT NULL`,
  },
  {
    name: 'NotificationEvent verified rows',
    sql: `SELECT COUNT(*)::bigint AS count FROM "NotificationEvent" WHERE "organizationRecordId" IS NOT NULL`,
  },
  {
    name: 'Notification verified rows',
    sql: `SELECT COUNT(*)::bigint AS count FROM "Notification" WHERE "organizationRecordId" IS NOT NULL`,
  },
  {
    name: 'Invoice first-class rows deliberately left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "Invoice" AS invoice
      INNER JOIN "Organization" AS organization
        ON organization."id" = invoice."organizationId"
      WHERE invoice."organizationRecordId" IS NULL
    `,
  },
  {
    name: 'CorporateBillingRecord first-class rows deliberately left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "CorporateBillingRecord" AS billing
      INNER JOIN "Organization" AS organization
        ON organization."id" = billing."organizationId"
      WHERE billing."organizationRecordId" IS NULL
    `,
  },
  {
    name: 'NotificationEvent first-class rows deliberately left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "NotificationEvent" AS event
      INNER JOIN "Organization" AS organization
        ON organization."id" = event."organizationId"
      WHERE event."organizationRecordId" IS NULL
    `,
  },
  {
    name: 'Notification first-class rows deliberately left unverified',
    sql: `
      SELECT COUNT(*)::bigint AS count
      FROM "Notification" AS notification
      INNER JOIN "Organization" AS organization
        ON organization."id" = notification."organizationId"
      WHERE notification."organizationRecordId" IS NULL
    `,
  },
];

async function readCount(sql) {
  const result = await client.query(sql);
  return BigInt(result.rows[0]?.count ?? '0');
}

let transactionOpen = false;

await client.connect();

try {
  await client.query(
    'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
  );
  transactionOpen = true;
  await client.query("SET LOCAL statement_timeout = '30s'");

  const failures = [];

  for (const check of invariantChecks) {
    const count = await readCount(check.sql);
    process.stdout.write(`${check.name}: ${count.toString()}\n`);

    if (count > 0n) {
      failures.push(`${check.name}=${count.toString()}`);
    }
  }

  for (const query of evidenceQueries) {
    const count = await readCount(query.sql);
    process.stdout.write(`${query.name}: ${count.toString()}\n`);
  }

  await client.query('COMMIT');
  transactionOpen = false;

  if (failures.length > 0) {
    throw new Error(
      `Milestone 16 organization-link verification failed: ${failures.join(', ')}`,
    );
  }

  process.stdout.write(
    'Milestone 16 organization-link verification passed with no structural or eligible-unverified violations.\n',
  );
} catch (error) {
  if (transactionOpen) {
    await client.query('ROLLBACK');
  }

  throw error;
} finally {
  await client.end();
}
