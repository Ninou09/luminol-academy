from pathlib import Path

migration = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = migration.read_text()
start_marker = '''-- A child notification is verified only when its parent event is already
-- verified for the same Organization, the recipient identity matches the event,
-- and active membership in that Organization can be proven. Process notifications
-- in bounded transactions so workers are never held behind one table-wide update.'''
start = text.find(start_marker)
if start < 0:
    raise SystemExit('notification procedure start marker not found')
end_marker = '\n\n-- Add foreign keys with NOT VALID'
end = text.find(end_marker, start)
if end < 0:
    raise SystemExit('notification procedure end marker not found')
replacement = '''-- Historical child Notification rows are intentionally not backfilled inside
-- prisma migrate deploy. The verified relation remains nullable for legacy history,
-- while temporary and permanent guards protect all new or identity-changing writes.
-- The production migration workflow runs a separate bounded transaction backfill
-- after schema deployment so notification workers are never held behind a table-wide
-- migration transaction.'''
text = text[:start] + replacement + text[end:]
final_block = '''CALL "backfill_verified_notification_organizations"();
DROP PROCEDURE "backfill_verified_notification_organizations"();'''
if final_block not in text:
    raise SystemExit('final notification procedure call not found')
text = text.replace(
    final_block,
    '-- Child Notification history is reconciled by the post-migration bounded backfill.',
    1,
)
if 'backfill_verified_notification_organizations' in text:
    raise SystemExit('notification backfill procedure reference still remains')
migration.write_text(text)

package_json = Path('packages/database/package.json')
package_text = package_json.read_text()
needle = '    "migrate:deploy": "prisma migrate deploy",\n'
replacement_line = needle + '    "backfill:m16-notification-organizations": "node scripts/backfill-milestone16-notification-organizations.mjs",\n'
if needle not in package_text:
    raise SystemExit('database package migrate script marker not found')
package_json.write_text(package_text.replace(needle, replacement_line, 1))

script = Path('packages/database/scripts/backfill-milestone16-notification-organizations.mjs')
script.parent.mkdir(parents=True, exist_ok=True)
script.write_text(r'''import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for the Milestone 16 notification backfill.');
}

const batchSize = 500;
const retryDelayMs = 50;
const client = new Client({ connectionString });

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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
        FROM candidate
        INNER JOIN "NotificationEvent" AS event
          ON event."id" = notification."eventId"
        WHERE notification."id" = candidate."id"
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

  console.log(
    `Milestone 16 notification organization backfill updated ${totalUpdated} rows.`,
  );
} finally {
  await client.end();
}
''')
