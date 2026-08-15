from pathlib import Path

path = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = path.read_text()
marker = '''  IF NEW."organizationRecordId" IS NULL THEN
    IF TG_OP = 'UPDATE' AND NOT identity_changed THEN
      RETURN NEW;
    END IF;

    IF (
      TG_TABLE_NAME IN ('NotificationEvent', 'Notification')
'''
replacement = '''  IF NEW."organizationRecordId" IS NULL THEN
    IF TG_OP = 'UPDATE' AND NOT identity_changed THEN
      RETURN NEW;
    END IF;

    -- Child writers lock their parent before lifecycle rows, matching the
    -- temporary expand guard and the bounded historical backfill lock order.
    -- Table-specific guards later re-acquire the same parent lock reentrantly.
    IF TG_TABLE_NAME = 'CorporateBillingRecord' THEN
      PERFORM 1
      FROM "Invoice" AS invoice
      WHERE invoice."id" = NEW."invoiceId"
      FOR UPDATE;
    ELSIF TG_TABLE_NAME = 'Notification' THEN
      PERFORM 1
      FROM "NotificationEvent" AS event
      WHERE event."id" = NEW."eventId"
      FOR UPDATE;
    END IF;

    IF (
      TG_TABLE_NAME IN ('NotificationEvent', 'Notification')
'''
if marker not in text:
    raise SystemExit('permanent derivation marker not found')
text = text.replace(marker, replacement, 1)
path.write_text(text)
