from pathlib import Path

migration = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = migration.read_text()

columns_marker = '''ALTER TABLE "Invoice" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "CorporateBillingRecord" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "NotificationEvent" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "organizationRecordId" TEXT;

'''
helpers = r'''ALTER TABLE "Invoice" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "CorporateBillingRecord" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "NotificationEvent" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "organizationRecordId" TEXT;

-- Verification helpers acquire row locks on the lifecycle records whose current
-- state authorizes a first-class tenant link. Holding these locks until the writer
-- commits serializes verification with organization archival, membership ending,
-- and recipient soft deletion, including migration-first and direct SQL writers.
CREATE OR REPLACE FUNCTION "lock_active_organization_for_verification"(
  organization_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  PERFORM 1
  FROM "Organization" AS organization
  WHERE organization."id" = organization_id
    AND organization."status" = 'ACTIVE'
    AND organization."archivedAt" IS NULL
  FOR SHARE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "lock_active_organization_recipient_for_verification"(
  organization_id TEXT,
  recipient_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  PERFORM 1
  FROM "Organization" AS organization
  WHERE organization."id" = organization_id
    AND organization."status" = 'ACTIVE'
    AND organization."archivedAt" IS NULL
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  PERFORM 1
  FROM "OrganizationMembership" AS membership
  WHERE membership."organizationId" = organization_id
    AND membership."userId" = recipient_id
    AND membership."active" = TRUE
    AND membership."endedAt" IS NULL
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  PERFORM 1
  FROM "User" AS recipient
  WHERE recipient."id" = recipient_id
    AND recipient."deletedAt" IS NULL
  FOR SHARE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

'''
if columns_marker not in text:
    raise SystemExit('column marker not found')
text = text.replace(columns_marker, helpers, 1)

# Serialize child identity checks and parent upgrades during the temporary expand phase.
old_billing_parent = '''    FROM "Invoice" AS invoice
    WHERE invoice."id" = NEW."invoiceId";
'''
new_billing_parent = '''    FROM "Invoice" AS invoice
    WHERE invoice."id" = NEW."invoiceId"
    FOR UPDATE;
'''
if old_billing_parent not in text:
    raise SystemExit('temporary invoice parent lookup not found')
text = text.replace(old_billing_parent, new_billing_parent, 1)

old_event_parent = '''    FROM "NotificationEvent" AS event
    WHERE event."id" = NEW."eventId";
'''
new_event_parent = '''    FROM "NotificationEvent" AS event
    WHERE event."id" = NEW."eventId"
    FOR UPDATE;
'''
if old_event_parent not in text:
    raise SystemExit('temporary event parent lookup not found')
text = text.replace(old_event_parent, new_event_parent, 1)

old_temp_active = r'''  IF EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    WHERE organization."id" = NEW."organizationId"
      AND organization."status" = 'ACTIVE'
      AND organization."archivedAt" IS NULL
  ) THEN
    CASE TG_TABLE_NAME
      WHEN 'Invoice' THEN
        can_verify_relationship := TRUE;
      WHEN 'CorporateBillingRecord' THEN
        SELECT EXISTS (
          SELECT 1
          FROM "Invoice" AS invoice
          WHERE invoice."id" = NEW."invoiceId"
            AND invoice."organizationId" = NEW."organizationId"
            AND (
              invoice."organizationRecordId" IS NULL
              OR invoice."organizationRecordId" = NEW."organizationId"
            )
        ) INTO can_verify_relationship;
      WHEN 'NotificationEvent' THEN
        SELECT EXISTS (
          SELECT 1
          FROM "OrganizationMembership" AS membership
          INNER JOIN "User" AS recipient
            ON recipient."id" = membership."userId"
          WHERE membership."organizationId" = NEW."organizationId"
            AND membership."userId" = NEW."recipientId"
            AND membership."active" = TRUE
            AND membership."endedAt" IS NULL
            AND recipient."deletedAt" IS NULL
        ) INTO can_verify_relationship;
      WHEN 'Notification' THEN
        SELECT EXISTS (
          SELECT 1
          FROM "NotificationEvent" AS event
          INNER JOIN "OrganizationMembership" AS membership
            ON membership."organizationId" = NEW."organizationId"
           AND membership."userId" = NEW."recipientId"
          INNER JOIN "User" AS recipient
            ON recipient."id" = membership."userId"
          WHERE event."id" = NEW."eventId"
            AND event."organizationId" = NEW."organizationId"
            AND (
              event."organizationRecordId" IS NULL
              OR event."organizationRecordId" = NEW."organizationId"
            )
            AND event."recipientId" = NEW."recipientId"
            AND membership."active" = TRUE
            AND membership."endedAt" IS NULL
            AND recipient."deletedAt" IS NULL
        ) INTO can_verify_relationship;
      ELSE
        can_verify_relationship := FALSE;
    END CASE;
  END IF;
'''
new_temp_active = r'''  IF (
    TG_TABLE_NAME IN ('NotificationEvent', 'Notification')
    AND "lock_active_organization_recipient_for_verification"(
      NEW."organizationId",
      NEW."recipientId"
    )
  ) OR (
    TG_TABLE_NAME NOT IN ('NotificationEvent', 'Notification')
    AND "lock_active_organization_for_verification"(NEW."organizationId")
  ) THEN
    CASE TG_TABLE_NAME
      WHEN 'Invoice' THEN
        can_verify_relationship := TRUE;
      WHEN 'CorporateBillingRecord' THEN
        SELECT EXISTS (
          SELECT 1
          FROM "Invoice" AS invoice
          WHERE invoice."id" = NEW."invoiceId"
            AND invoice."organizationId" = NEW."organizationId"
            AND (
              invoice."organizationRecordId" IS NULL
              OR invoice."organizationRecordId" = NEW."organizationId"
            )
        ) INTO can_verify_relationship;
      WHEN 'NotificationEvent' THEN
        can_verify_relationship := TRUE;
      WHEN 'Notification' THEN
        SELECT EXISTS (
          SELECT 1
          FROM "NotificationEvent" AS event
          WHERE event."id" = NEW."eventId"
            AND event."organizationId" = NEW."organizationId"
            AND (
              event."organizationRecordId" IS NULL
              OR event."organizationRecordId" = NEW."organizationId"
            )
            AND event."recipientId" = NEW."recipientId"
        ) INTO can_verify_relationship;
      ELSE
        can_verify_relationship := FALSE;
    END CASE;
  END IF;
'''
if old_temp_active not in text:
    raise SystemExit('temporary active-scope block not found')
text = text.replace(old_temp_active, new_temp_active, 1)

# The permanent generic trigger must use the same lifecycle-locking protocol.
old_perm_active = r'''    IF EXISTS (
      SELECT 1
      FROM "Organization" AS organization
      WHERE organization."id" = NEW."organizationId"
        AND organization."status" = 'ACTIVE'
        AND organization."archivedAt" IS NULL
    ) THEN
      CASE TG_TABLE_NAME
        WHEN 'Invoice' THEN
          can_derive_verified_organization := TRUE;
        WHEN 'CorporateBillingRecord' THEN
          SELECT EXISTS (
            SELECT 1
            FROM "Invoice" AS invoice
            WHERE invoice."id" = NEW."invoiceId"
              AND invoice."organizationId" = NEW."organizationId"
              AND (
                invoice."organizationRecordId" IS NULL
                OR invoice."organizationRecordId" = NEW."organizationId"
              )
          ) INTO can_derive_verified_organization;
        WHEN 'NotificationEvent' THEN
          SELECT EXISTS (
            SELECT 1
            FROM "OrganizationMembership" AS membership
            INNER JOIN "User" AS recipient
              ON recipient."id" = membership."userId"
            WHERE membership."organizationId" = NEW."organizationId"
              AND membership."userId" = NEW."recipientId"
              AND membership."active" = TRUE
              AND membership."endedAt" IS NULL
              AND recipient."deletedAt" IS NULL
          ) INTO can_derive_verified_organization;
        WHEN 'Notification' THEN
          SELECT EXISTS (
            SELECT 1
            FROM "NotificationEvent" AS event
            INNER JOIN "OrganizationMembership" AS membership
              ON membership."organizationId" = NEW."organizationId"
             AND membership."userId" = NEW."recipientId"
            INNER JOIN "User" AS recipient
              ON recipient."id" = membership."userId"
            WHERE event."id" = NEW."eventId"
              AND event."organizationId" = NEW."organizationId"
              AND (
                event."organizationRecordId" IS NULL
                OR event."organizationRecordId" = NEW."organizationId"
              )
              AND event."recipientId" = NEW."recipientId"
              AND membership."active" = TRUE
              AND membership."endedAt" IS NULL
              AND recipient."deletedAt" IS NULL
          ) INTO can_derive_verified_organization;
        ELSE
          can_derive_verified_organization := FALSE;
      END CASE;
    END IF;
'''
new_perm_active = r'''    IF (
      TG_TABLE_NAME IN ('NotificationEvent', 'Notification')
      AND "lock_active_organization_recipient_for_verification"(
        NEW."organizationId",
        NEW."recipientId"
      )
    ) OR (
      TG_TABLE_NAME NOT IN ('NotificationEvent', 'Notification')
      AND "lock_active_organization_for_verification"(NEW."organizationId")
    ) THEN
      CASE TG_TABLE_NAME
        WHEN 'Invoice' THEN
          can_derive_verified_organization := TRUE;
        WHEN 'CorporateBillingRecord' THEN
          SELECT EXISTS (
            SELECT 1
            FROM "Invoice" AS invoice
            WHERE invoice."id" = NEW."invoiceId"
              AND invoice."organizationId" = NEW."organizationId"
              AND (
                invoice."organizationRecordId" IS NULL
                OR invoice."organizationRecordId" = NEW."organizationId"
              )
          ) INTO can_derive_verified_organization;
        WHEN 'NotificationEvent' THEN
          can_derive_verified_organization := TRUE;
        WHEN 'Notification' THEN
          SELECT EXISTS (
            SELECT 1
            FROM "NotificationEvent" AS event
            WHERE event."id" = NEW."eventId"
              AND event."organizationId" = NEW."organizationId"
              AND (
                event."organizationRecordId" IS NULL
                OR event."organizationRecordId" = NEW."organizationId"
              )
              AND event."recipientId" = NEW."recipientId"
          ) INTO can_derive_verified_organization;
        ELSE
          can_derive_verified_organization := FALSE;
      END CASE;
    END IF;
'''
if old_perm_active not in text:
    raise SystemExit('permanent active-scope block not found')
text = text.replace(old_perm_active, new_perm_active, 1)

old_final_active = r'''  IF identity_changed AND NOT EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    WHERE organization."id" = NEW."organizationRecordId"
      AND organization."status" = 'ACTIVE'
      AND organization."archivedAt" IS NULL
  ) THEN
    RAISE EXCEPTION 'Verified organization must be active';
  END IF;
'''
new_final_active = r'''  IF identity_changed
     AND NOT "lock_active_organization_for_verification"(
       NEW."organizationRecordId"
     ) THEN
    RAISE EXCEPTION 'Verified organization must be active';
  END IF;
'''
if old_final_active not in text:
    raise SystemExit('final active-organization check not found')
text = text.replace(old_final_active, new_final_active, 1)

old_event_scope = r'''  IF recipient_identity_changed AND NOT EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    INNER JOIN "OrganizationMembership" AS membership
      ON membership."organizationId" = organization."id"
    INNER JOIN "User" AS recipient
      ON recipient."id" = membership."userId"
    WHERE organization."id" = NEW."organizationRecordId"
      AND organization."status" = 'ACTIVE'
      AND organization."archivedAt" IS NULL
      AND membership."userId" = NEW."recipientId"
      AND membership."active" = TRUE
      AND membership."endedAt" IS NULL
      AND recipient."deletedAt" IS NULL
  ) THEN
    RAISE EXCEPTION 'Verified notification event requires an active organization recipient';
  END IF;
'''
new_event_scope = r'''  IF recipient_identity_changed
     AND NOT "lock_active_organization_recipient_for_verification"(
       NEW."organizationRecordId",
       NEW."recipientId"
     ) THEN
    RAISE EXCEPTION 'Verified notification event requires an active organization recipient';
  END IF;
'''
if old_event_scope not in text:
    raise SystemExit('event recipient-scope block not found')
text = text.replace(old_event_scope, new_event_scope, 1)

old_notification_scope = r'''  IF recipient_identity_changed AND NOT EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    INNER JOIN "OrganizationMembership" AS membership
      ON membership."organizationId" = organization."id"
    INNER JOIN "User" AS recipient
      ON recipient."id" = membership."userId"
    WHERE organization."id" = NEW."organizationRecordId"
      AND organization."status" = 'ACTIVE'
      AND organization."archivedAt" IS NULL
      AND membership."userId" = NEW."recipientId"
      AND membership."active" = TRUE
      AND membership."endedAt" IS NULL
      AND recipient."deletedAt" IS NULL
  ) THEN
    RAISE EXCEPTION 'Verified notification requires an active organization recipient';
  END IF;
'''
new_notification_scope = r'''  IF recipient_identity_changed
     AND NOT "lock_active_organization_recipient_for_verification"(
       NEW."organizationRecordId",
       NEW."recipientId"
     ) THEN
    RAISE EXCEPTION 'Verified notification requires an active organization recipient';
  END IF;
'''
if old_notification_scope not in text:
    raise SystemExit('notification recipient-scope block not found')
text = text.replace(old_notification_scope, new_notification_scope, 1)

migration.write_text(text)

# Harden the post-migration script so the global elapsed-time deadline is enforced
# inside database calls, not only between them.
backfill = Path('packages/database/scripts/backfill-milestone16-organization-links.mjs')
script = backfill.read_text()

old_client = '''const retryableDatabaseCodes = new Set(['40P01', '55P03']);
const client = new Client({ connectionString });'''
new_client = '''const retryableDatabaseCodes = new Set(['40P01', '55P03']);
const client = new Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
});'''
if old_client not in script:
    raise SystemExit('client configuration marker not found')
script = script.replace(old_client, new_client, 1)

old_assert = '''function assertWithinDeadline(backfill) {
  if (Date.now() >= backfillDeadlineAt) {
    throw new Error(
      `Milestone 16 organization-link backfill exceeded its ${maxBackfillDurationMs / 60000}-minute global deadline while processing ${backfill.name}.`,
    );
  }
}
'''
new_assert = '''function remainingDeadlineMs(backfill) {
  const remaining = backfillDeadlineAt - Date.now();

  if (remaining <= 0) {
    throw new Error(
      `Milestone 16 organization-link backfill exceeded its ${maxBackfillDurationMs / 60000}-minute global deadline while processing ${backfill.name}.`,
    );
  }

  return remaining;
}

function deadlineStatementTimeout(backfill) {
  return Math.max(1, remainingDeadlineMs(backfill));
}
'''
if old_assert not in script:
    raise SystemExit('deadline helper marker not found')
script = script.replace(old_assert, new_assert, 1)

old_update_start = '''async function updateBatch(backfill) {
  assertWithinDeadline(backfill);
  await client.query('BEGIN');

  try {
    await client.query(`SET LOCAL lock_timeout = '${lockTimeout}'`);
    const result = await client.query(backfill.updateSql, [batchSize]);'''
new_update_start = '''async function updateBatch(backfill) {
  remainingDeadlineMs(backfill);
  await client.query('BEGIN');

  try {
    const statementTimeoutMs = deadlineStatementTimeout(backfill);
    await client.query(
      `SET LOCAL statement_timeout = '${statementTimeoutMs}ms'`,
    );
    await client.query(`SET LOCAL lock_timeout = '${lockTimeout}'`);
    const result = await client.query(backfill.updateSql, [batchSize]);'''
if old_update_start not in script:
    raise SystemExit('updateBatch deadline marker not found')
script = script.replace(old_update_start, new_update_start, 1)

old_eligible = '''async function hasEligibleRows(backfill) {
  assertWithinDeadline(backfill);
  const result = await client.query(
    `SELECT EXISTS (SELECT 1 ${backfill.eligibleSql}) AS "exists"`,
  );
  return result.rows[0]?.exists === true;
}

async function waitOrFail(backfill) {
  assertWithinDeadline(backfill);
  await sleep(retryDelayMs);
  assertWithinDeadline(backfill);
}
'''
new_eligible = '''async function hasEligibleRows(backfill) {
  remainingDeadlineMs(backfill);
  await client.query('BEGIN');

  try {
    const statementTimeoutMs = deadlineStatementTimeout(backfill);
    await client.query(
      `SET LOCAL statement_timeout = '${statementTimeoutMs}ms'`,
    );
    const result = await client.query(
      `SELECT EXISTS (SELECT 1 ${backfill.eligibleSql}) AS "exists"`,
    );
    await client.query('COMMIT');
    return result.rows[0]?.exists === true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function waitOrFail(backfill) {
  remainingDeadlineMs(backfill);
  await sleep(retryDelayMs);
  remainingDeadlineMs(backfill);
}
'''
if old_eligible not in script:
    raise SystemExit('eligibility deadline marker not found')
script = script.replace(old_eligible, new_eligible, 1)

backfill.write_text(script)
