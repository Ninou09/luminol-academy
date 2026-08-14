from pathlib import Path

migration = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = migration.read_text()

# Parent legacy identities are immutable after insert. This removes child-existence
# snapshot races entirely instead of relying on seeing a concurrently inserted child.
old_temp = '''    -- Parent identities cannot move away from already-materialized children.
    -- Enforce this during the migration window as well as after permanent guards
    -- are installed so opaque legacy scope cannot become internally inconsistent.
    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "CorporateBillingRecord" AS billing
         WHERE billing."invoiceId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Invoice organization is immutable once corporate billing exists';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event organization is immutable once notifications exist';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event recipient is immutable once notifications exist';
    END IF;
'''
new_temp = '''    -- Invoice and notification-event identity is write-once. Making the parent
    -- identity immutable removes the child-insert/parent-update snapshot race for
    -- both verified and genuinely opaque legacy scope.
    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Invoice organization identity is immutable';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Notification event organization identity is immutable';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
      RAISE EXCEPTION 'Notification event recipient identity is immutable';
    END IF;
'''
if old_temp not in text:
    raise SystemExit('temporary parent-identity block not found')
text = text.replace(old_temp, new_temp, 1)

old_perm = '''    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "CorporateBillingRecord" AS billing
         WHERE billing."invoiceId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Invoice organization is immutable once corporate billing exists';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event organization is immutable once notifications exist';
    END IF;
'''
new_perm = '''    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Invoice organization identity is immutable';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Notification event organization identity is immutable';
    END IF;
'''
if old_perm not in text:
    raise SystemExit('permanent parent-organization block not found')
text = text.replace(old_perm, new_perm, 1)

old_recipient = '''  IF TG_OP = 'UPDATE'
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId"
     AND EXISTS (
       SELECT 1
       FROM "Notification" AS notification
       WHERE notification."eventId" = OLD."id"
     ) THEN
    RAISE EXCEPTION 'Notification event recipient is immutable once notifications exist';
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD."organizationRecordId" IS NOT NULL
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
    RAISE EXCEPTION 'Verified notification event recipient is immutable';
  END IF;
'''
new_recipient = '''  IF TG_OP = 'UPDATE'
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
    RAISE EXCEPTION 'Notification event recipient identity is immutable';
  END IF;
'''
if old_recipient not in text:
    raise SystemExit('notification-event recipient identity block not found')
text = text.replace(old_recipient, new_recipient, 1)

# Permanent derivation accepts a valid legacy parent that has not yet been
# post-migration backfilled; the child-specific guard upgrades the parent atomically.
old_billing_derive = '''            WHERE invoice."id" = NEW."invoiceId"
              AND invoice."organizationId" = NEW."organizationId"
              AND invoice."organizationRecordId" = NEW."organizationId"
          ) INTO can_derive_verified_organization;'''
new_billing_derive = '''            WHERE invoice."id" = NEW."invoiceId"
              AND invoice."organizationId" = NEW."organizationId"
              AND (
                invoice."organizationRecordId" IS NULL
                OR invoice."organizationRecordId" = NEW."organizationId"
              )
          ) INTO can_derive_verified_organization;'''
if old_billing_derive not in text:
    raise SystemExit('corporate billing derivation block not found')
text = text.replace(old_billing_derive, new_billing_derive, 1)

old_notification_derive = '''            WHERE event."id" = NEW."eventId"
              AND event."organizationId" = NEW."organizationId"
              AND event."organizationRecordId" = NEW."organizationId"
              AND event."recipientId" = NEW."recipientId"'''
new_notification_derive = '''            WHERE event."id" = NEW."eventId"
              AND event."organizationId" = NEW."organizationId"
              AND (
                event."organizationRecordId" IS NULL
                OR event."organizationRecordId" = NEW."organizationId"
              )
              AND event."recipientId" = NEW."recipientId"'''
if old_notification_derive not in text:
    raise SystemExit('notification derivation block not found')
text = text.replace(old_notification_derive, new_notification_derive, 1)

# During the temporary expand phase, upgrade a valid legacy parent together with
# the child so no verified child can be committed beneath an unverified parent.
old_temp_success = '''  IF can_verify_relationship THEN
    NEW."organizationRecordId" := NEW."organizationId";
    RETURN NEW;
  END IF;
'''
new_temp_success = '''  IF can_verify_relationship THEN
    IF TG_TABLE_NAME = 'CorporateBillingRecord' THEN
      UPDATE "Invoice"
      SET "organizationRecordId" = NEW."organizationId"
      WHERE "id" = NEW."invoiceId"
        AND "organizationRecordId" IS NULL;
    ELSIF TG_TABLE_NAME = 'Notification' THEN
      UPDATE "NotificationEvent"
      SET "organizationRecordId" = NEW."organizationId"
      WHERE "id" = NEW."eventId"
        AND "organizationRecordId" IS NULL;
    END IF;

    NEW."organizationRecordId" := NEW."organizationId";
    RETURN NEW;
  END IF;
'''
if old_temp_success not in text:
    raise SystemExit('temporary derivation success block not found')
text = text.replace(old_temp_success, new_temp_success, 1)

# Lock and, when necessary, upgrade the parent invoice before validating the child.
old_billing_parent = '''  SELECT "organizationId", "organizationRecordId"
    INTO invoice_organization_id, invoice_organization_record_id
  FROM "Invoice"
  WHERE "id" = NEW."invoiceId";
'''
new_billing_parent = '''  SELECT "organizationId", "organizationRecordId"
    INTO invoice_organization_id, invoice_organization_record_id
  FROM "Invoice"
  WHERE "id" = NEW."invoiceId"
  FOR UPDATE;
'''
if old_billing_parent not in text:
    raise SystemExit('billing parent select block not found')
text = text.replace(old_billing_parent, new_billing_parent, 1)

billing_upgrade_marker = '''  IF NEW."organizationRecordId" IS NOT NULL
     AND invoice_organization_record_id IS DISTINCT FROM NEW."organizationRecordId" THEN
    RAISE EXCEPTION 'Corporate billing organization must match invoice organization';
  END IF;
'''
billing_upgrade = '''  IF NEW."organizationRecordId" IS NOT NULL
     AND invoice_organization_record_id IS NULL
     AND NEW."organizationId" IS NOT DISTINCT FROM invoice_organization_id THEN
    UPDATE "Invoice"
    SET "organizationRecordId" = NEW."organizationRecordId"
    WHERE "id" = NEW."invoiceId"
      AND "organizationRecordId" IS NULL;
    invoice_organization_record_id := NEW."organizationRecordId";
  END IF;

''' + billing_upgrade_marker
if billing_upgrade_marker not in text:
    raise SystemExit('billing parent verified check not found')
text = text.replace(billing_upgrade_marker, billing_upgrade, 1)

# Lock and upgrade a valid legacy notification event before validating its child.
old_event_select = '''  SELECT "organizationId", "organizationRecordId", "recipientId"
    INTO event_organization_id, event_organization_record_id, event_recipient_id
  FROM "NotificationEvent"
  WHERE "id" = NEW."eventId";
'''
new_event_select = '''  SELECT "organizationId", "organizationRecordId", "recipientId"
    INTO event_organization_id, event_organization_record_id, event_recipient_id
  FROM "NotificationEvent"
  WHERE "id" = NEW."eventId"
  FOR UPDATE;
'''
if old_event_select not in text:
    raise SystemExit('notification parent select block not found')
text = text.replace(old_event_select, new_event_select, 1)

event_upgrade_marker = '''  IF event_organization_record_id IS NOT NULL
     AND NEW."organizationRecordId" IS DISTINCT FROM event_organization_record_id
     AND identity_changed THEN
    RAISE EXCEPTION 'Notification organization must match notification event organization';
  END IF;
'''
event_upgrade = '''  IF NEW."organizationRecordId" IS NOT NULL
     AND event_organization_record_id IS NULL
     AND NEW."organizationId" IS NOT DISTINCT FROM event_organization_id
     AND NEW."recipientId" IS NOT DISTINCT FROM event_recipient_id THEN
    UPDATE "NotificationEvent"
    SET "organizationRecordId" = NEW."organizationRecordId"
    WHERE "id" = NEW."eventId"
      AND "organizationRecordId" IS NULL;
    event_organization_record_id := NEW."organizationRecordId";
  END IF;

''' + event_upgrade_marker
if event_upgrade_marker not in text:
    raise SystemExit('notification parent verified check not found')
text = text.replace(event_upgrade_marker, event_upgrade, 1)

# All historical verified-link reconciliation is now done after migrate:deploy in
# bounded transactions. Remove monolithic in-migration backfills so finance and
# notification operations are never held behind a table-wide UPDATE.
initial_start = text.find('-- Initial historical backfill.')
initial_end = text.find('-- Historical child Notification rows are intentionally not backfilled inside', initial_start)
if initial_start < 0 or initial_end < 0:
    raise SystemExit('initial historical backfill section not found')
initial_replacement = '''-- Historical verified-organization links are intentionally reconciled after
-- prisma migrate deploy by a bounded, idempotent backfill. Keeping these scans out
-- of the migration prevents long-lived row locks while the temporary expand guard
-- protects all new and identity-changing writes during deployment.

'''
text = text[:initial_start] + initial_replacement + text[initial_end:]

final_start = text.find('-- Re-run safe backfills after all permanent write guards are active.')
if final_start < 0:
    raise SystemExit('final historical backfill section not found')
final_replacement = '''-- Historical Invoice, CorporateBillingRecord, NotificationEvent and Notification
-- links are reconciled after schema deployment in bounded committed batches. New
-- writes are already protected by the permanent guards above.
'''
text = text[:final_start] + final_replacement

migration.write_text(text)

# Align existing recipient expectations with universal event identity immutability.
parent_test = Path('packages/database/src/milestone16-notification-parent-integrity.integration.test.ts')
parent_text = parent_test.read_text()
parent_text = parent_text.replace(
    "'Verified notification event recipient is immutable'",
    "'Notification event recipient identity is immutable'",
)
parent_text = parent_text.replace(
    "'Notification event recipient is immutable once notifications exist'",
    "'Notification event recipient identity is immutable'",
)
parent_test.write_text(parent_text)

opaque_test = Path('packages/database/src/milestone16-parent-opaque-identity.integration.test.ts')
opaque_text = opaque_test.read_text()
opaque_text = opaque_text.replace(
    "'Invoice organization is immutable once corporate billing exists'",
    "'Invoice organization identity is immutable'",
)
opaque_text = opaque_text.replace(
    "'Notification event recipient is immutable once notifications exist'",
    "'Notification event recipient identity is immutable'",
)
opaque_text = opaque_text.replace(
    "'Notification event organization is immutable once notifications exist'",
    "'Notification event organization identity is immutable'",
)
opaque_test.write_text(opaque_text)
