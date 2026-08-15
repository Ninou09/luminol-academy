from pathlib import Path

migration = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = migration.read_text()

old_temp = r'''  IF (
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
new_temp = r'''  -- Dispatch by table before referencing table-specific NEW fields. A generic
  -- trigger record does not expose recipientId on finance tables, even inside a
  -- boolean expression whose other operand appears to exclude those tables.
  CASE TG_TABLE_NAME
    WHEN 'Invoice' THEN
      IF "lock_active_organization_for_verification"(NEW."organizationId") THEN
        can_verify_relationship := TRUE;
      END IF;
    WHEN 'CorporateBillingRecord' THEN
      IF "lock_active_organization_for_verification"(NEW."organizationId") THEN
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
      END IF;
    WHEN 'NotificationEvent' THEN
      IF "lock_active_organization_recipient_for_verification"(
        NEW."organizationId",
        NEW."recipientId"
      ) THEN
        can_verify_relationship := TRUE;
      END IF;
    WHEN 'Notification' THEN
      IF "lock_active_organization_recipient_for_verification"(
        NEW."organizationId",
        NEW."recipientId"
      ) THEN
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
      END IF;
    ELSE
      can_verify_relationship := FALSE;
  END CASE;
'''
if old_temp not in text:
    raise SystemExit('temporary generic trigger dispatch block not found')
text = text.replace(old_temp, new_temp, 1)

old_perm = r'''    IF (
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
new_perm = r'''    -- Dispatch by table before referencing table-specific NEW fields. This keeps
    -- the shared trigger valid for finance records that do not have recipientId.
    CASE TG_TABLE_NAME
      WHEN 'Invoice' THEN
        IF "lock_active_organization_for_verification"(NEW."organizationId") THEN
          can_derive_verified_organization := TRUE;
        END IF;
      WHEN 'CorporateBillingRecord' THEN
        IF "lock_active_organization_for_verification"(NEW."organizationId") THEN
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
        END IF;
      WHEN 'NotificationEvent' THEN
        IF "lock_active_organization_recipient_for_verification"(
          NEW."organizationId",
          NEW."recipientId"
        ) THEN
          can_derive_verified_organization := TRUE;
        END IF;
      WHEN 'Notification' THEN
        IF "lock_active_organization_recipient_for_verification"(
          NEW."organizationId",
          NEW."recipientId"
        ) THEN
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
        END IF;
      ELSE
        can_derive_verified_organization := FALSE;
    END CASE;
'''
if old_perm not in text:
    raise SystemExit('permanent generic trigger dispatch block not found')
text = text.replace(old_perm, new_perm, 1)

migration.write_text(text)

test_path = Path('packages/database/src/milestone16-integrations.integration.test.ts')
tests = test_path.read_text()
old_expectation = "'First-class organization scope requires a verified relationship'"
new_expectation = "'Verified notification requires an active organization recipient'"
# Only change the final membership-ended child assertion; identify it by the nearby test title.
title = "test('rejects new verified notifications after recipient membership ends'"
start = tests.find(title)
if start < 0:
    raise SystemExit('membership-ended test not found')
pos = tests.find(old_expectation, start)
if pos < 0:
    raise SystemExit('membership-ended generic expectation not found')
tests = tests[:pos] + new_expectation + tests[pos + len(old_expectation):]
test_path.write_text(tests)
