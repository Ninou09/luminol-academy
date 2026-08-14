-- Milestone 16 Slice E: connect new organization-aware finance and notification
-- records to first-class Organization rows without reinterpreting unmatched legacy
-- organization identifiers.

ALTER TABLE "Invoice" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "CorporateBillingRecord" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "NotificationEvent" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "organizationRecordId" TEXT;

-- Backfill only exact first-class Organization identifiers. Legacy opaque finance
-- identifiers remain untouched and intentionally unverified.
UPDATE "Invoice" AS invoice
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization
WHERE invoice."organizationId" = organization."id";

UPDATE "CorporateBillingRecord" AS billing
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization
WHERE billing."organizationId" = organization."id";

-- Historical organization-scoped notifications are marked verified only when
-- both the Organization and a recipient membership can be proven.
UPDATE "NotificationEvent" AS event
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership
WHERE event."organizationId" = organization."id"
  AND membership."organizationId" = organization."id"
  AND membership."userId" = event."recipientId";

UPDATE "Notification" AS notification
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership
WHERE notification."organizationId" = organization."id"
  AND membership."organizationId" = organization."id"
  AND membership."userId" = notification."recipientId";

CREATE INDEX "Invoice_organizationRecordId_status_createdAt_idx"
  ON "Invoice"("organizationRecordId", "status", "createdAt");
CREATE INDEX "CorporateBillingRecord_organizationRecordId_createdAt_idx"
  ON "CorporateBillingRecord"("organizationRecordId", "createdAt");
CREATE INDEX "NotificationEvent_organizationRecordId_recipientId_createdAt_idx"
  ON "NotificationEvent"("organizationRecordId", "recipientId", "createdAt");
CREATE INDEX "Notification_organizationRecordId_status_scheduledAt_idx"
  ON "Notification"("organizationRecordId", "status", "scheduledAt");

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CorporateBillingRecord"
  ADD CONSTRAINT "CorporateBillingRecord_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NotificationEvent"
  ADD CONSTRAINT "NotificationEvent_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "enforce_verified_organization_link"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD."organizationRecordId" IS NOT NULL
       AND OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId" THEN
      RAISE EXCEPTION 'Verified organization identity is immutable';
    END IF;
  END IF;

  IF NEW."organizationId" IS NULL THEN
    IF NEW."organizationRecordId" IS NOT NULL THEN
      RAISE EXCEPTION 'Verified organization requires organization identity';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."organizationRecordId" IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'New organization-scoped records require a verified organization';
    ELSIF OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'New organization-scoped records require a verified organization';
    END IF;
    -- Existing unmatched legacy rows may still update non-identity fields.
    RETURN NEW;
  END IF;

  IF NEW."organizationId" IS DISTINCT FROM NEW."organizationRecordId" THEN
    RAISE EXCEPTION 'Organization identity does not match verified organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Invoice_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "CorporateBillingRecord_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "CorporateBillingRecord"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "NotificationEvent_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "NotificationEvent"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "Notification_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE OR REPLACE FUNCTION "enforce_corporate_billing_invoice_organization"()
RETURNS TRIGGER AS $$
DECLARE
  invoice_organization_record_id TEXT;
BEGIN
  SELECT "organizationRecordId"
    INTO invoice_organization_record_id
  FROM "Invoice"
  WHERE "id" = NEW."invoiceId";

  IF NEW."organizationRecordId" IS NOT NULL
     AND invoice_organization_record_id IS DISTINCT FROM NEW."organizationRecordId" THEN
    RAISE EXCEPTION 'Corporate billing organization must match invoice organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CorporateBillingRecord_invoice_organization_guard"
BEFORE INSERT OR UPDATE ON "CorporateBillingRecord"
FOR EACH ROW EXECUTE FUNCTION "enforce_corporate_billing_invoice_organization"();

CREATE OR REPLACE FUNCTION "enforce_notification_event_organization"()
RETURNS TRIGGER AS $$
DECLARE
  event_organization_record_id TEXT;
  event_recipient_id TEXT;
  identity_changed BOOLEAN;
  recipient_identity_changed BOOLEAN;
BEGIN
  SELECT "organizationRecordId", "recipientId"
    INTO event_organization_record_id, event_recipient_id
  FROM "NotificationEvent"
  WHERE "id" = NEW."eventId";

  IF TG_OP = 'INSERT' THEN
    identity_changed := TRUE;
    recipient_identity_changed := TRUE;
  ELSE
    identity_changed := OLD."eventId" IS DISTINCT FROM NEW."eventId"
      OR OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";
    recipient_identity_changed := OLD."eventId" IS DISTINCT FROM NEW."eventId"
      OR OLD."recipientId" IS DISTINCT FROM NEW."recipientId";
  END IF;

  IF event_organization_record_id IS NOT NULL
     AND NEW."organizationRecordId" IS DISTINCT FROM event_organization_record_id
     AND identity_changed THEN
    RAISE EXCEPTION 'Notification organization must match notification event organization';
  END IF;

  IF NEW."organizationRecordId" IS NOT NULL
     AND event_organization_record_id IS DISTINCT FROM NEW."organizationRecordId" THEN
    RAISE EXCEPTION 'Notification organization must match notification event organization';
  END IF;

  IF NEW."recipientId" IS DISTINCT FROM event_recipient_id
     AND recipient_identity_changed THEN
    RAISE EXCEPTION 'Notification recipient must match notification event recipient';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Notification_event_organization_guard"
BEFORE INSERT OR UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION "enforce_notification_event_organization"();