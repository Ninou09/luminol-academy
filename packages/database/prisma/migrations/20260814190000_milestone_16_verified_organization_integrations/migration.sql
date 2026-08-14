-- Milestone 16 Slice E: connect new organization-aware finance and notification
-- records to first-class Organization rows without reinterpreting unmatched legacy
-- organization identifiers.

ALTER TABLE "Invoice" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "CorporateBillingRecord" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "NotificationEvent" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "organizationRecordId" TEXT;

-- Initial historical backfill. Exact organization identities can be verified for
-- invoices regardless of current lifecycle state because this is historical data.
UPDATE "Invoice" AS invoice
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization
WHERE invoice."organizationId" = organization."id";

-- Corporate billing is verified only when its parent invoice was independently
-- verified for the same first-class Organization. Historical mismatches remain
-- deliberately unverified so later non-identity updates are not bricked.
UPDATE "CorporateBillingRecord" AS billing
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "Invoice" AS invoice
WHERE billing."organizationId" = organization."id"
  AND invoice."id" = billing."invoiceId"
  AND invoice."organizationId" = organization."id"
  AND invoice."organizationRecordId" = organization."id";

-- Historical organization-scoped notification events are marked verified only
-- when the Organization and a currently valid recipient membership can be proven.
UPDATE "NotificationEvent" AS event
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership,
     "User" AS recipient
WHERE event."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL
  AND membership."organizationId" = organization."id"
  AND membership."userId" = event."recipientId"
  AND membership."active" = TRUE
  AND membership."endedAt" IS NULL
  AND recipient."id" = event."recipientId"
  AND recipient."deletedAt" IS NULL;

-- A child notification is verified only when its parent event is already
-- verified for the same Organization, the recipient identity matches the event,
-- and active membership in that Organization can be proven.
UPDATE "Notification" AS notification
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership,
     "User" AS recipient,
     "NotificationEvent" AS event
WHERE notification."eventId" = event."id"
  AND notification."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL
  AND event."organizationId" = organization."id"
  AND event."organizationRecordId" = organization."id"
  AND notification."recipientId" = event."recipientId"
  AND membership."organizationId" = organization."id"
  AND membership."userId" = notification."recipientId"
  AND membership."active" = TRUE
  AND membership."endedAt" IS NULL
  AND recipient."id" = notification."recipientId"
  AND recipient."deletedAt" IS NULL;

-- Add foreign keys with NOT VALID so the short constraint-addition lock does not
-- scan live tables. Separate later migrations validate each constraint using the
-- lower-impact PostgreSQL validation lock.
ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
ALTER TABLE "CorporateBillingRecord"
  ADD CONSTRAINT "CorporateBillingRecord_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
ALTER TABLE "NotificationEvent"
  ADD CONSTRAINT "NotificationEvent_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_organizationRecordId_fkey"
  FOREIGN KEY ("organizationRecordId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;

CREATE OR REPLACE FUNCTION "enforce_verified_organization_link"()
RETURNS TRIGGER AS $$
DECLARE
  identity_changed BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    identity_changed := TRUE;
  ELSE
    identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";

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

  -- New or newly-linked organization scope must resolve to an active first-class
  -- organization. Existing verified historical rows may still receive
  -- non-identity updates after the organization later leaves the active state.
  IF identity_changed AND NOT EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    WHERE organization."id" = NEW."organizationRecordId"
      AND organization."status" = 'ACTIVE'
      AND organization."archivedAt" IS NULL
  ) THEN
    RAISE EXCEPTION 'Verified organization must be active';
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

CREATE OR REPLACE FUNCTION "enforce_notification_event_recipient_scope"()
RETURNS TRIGGER AS $$
DECLARE
  recipient_identity_changed BOOLEAN;
BEGIN
  IF NEW."organizationRecordId" IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    recipient_identity_changed := TRUE;
  ELSE
    recipient_identity_changed := OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId"
      OR OLD."recipientId" IS DISTINCT FROM NEW."recipientId";
  END IF;

  IF recipient_identity_changed AND NOT EXISTS (
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "NotificationEvent_verified_recipient_guard"
BEFORE INSERT OR UPDATE ON "NotificationEvent"
FOR EACH ROW EXECUTE FUNCTION "enforce_notification_event_recipient_scope"();

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

CREATE OR REPLACE FUNCTION "enforce_notification_recipient_scope"()
RETURNS TRIGGER AS $$
DECLARE
  recipient_identity_changed BOOLEAN;
BEGIN
  IF NEW."organizationRecordId" IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    recipient_identity_changed := TRUE;
  ELSE
    recipient_identity_changed := OLD."eventId" IS DISTINCT FROM NEW."eventId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId"
      OR OLD."recipientId" IS DISTINCT FROM NEW."recipientId";
  END IF;

  IF recipient_identity_changed AND NOT EXISTS (
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Notification_verified_recipient_guard"
BEFORE INSERT OR UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION "enforce_notification_recipient_scope"();

-- Re-run safe backfills after all write guards are active. This closes the
-- migration window in which an old application process could have inserted an
-- organization-scoped row after its first backfill. Rows written after this
-- point must already carry verified scope, while unmatched legacy identifiers
-- remain intentionally unverified.
UPDATE "Invoice" AS invoice
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization
WHERE invoice."organizationRecordId" IS NULL
  AND invoice."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL;

UPDATE "CorporateBillingRecord" AS billing
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "Invoice" AS invoice
WHERE billing."organizationRecordId" IS NULL
  AND billing."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL
  AND invoice."id" = billing."invoiceId"
  AND invoice."organizationId" = organization."id"
  AND invoice."organizationRecordId" = organization."id";

UPDATE "NotificationEvent" AS event
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership,
     "User" AS recipient
WHERE event."organizationRecordId" IS NULL
  AND event."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL
  AND membership."organizationId" = organization."id"
  AND membership."userId" = event."recipientId"
  AND membership."active" = TRUE
  AND membership."endedAt" IS NULL
  AND recipient."id" = event."recipientId"
  AND recipient."deletedAt" IS NULL;

UPDATE "Notification" AS notification
SET "organizationRecordId" = organization."id"
FROM "Organization" AS organization,
     "OrganizationMembership" AS membership,
     "User" AS recipient,
     "NotificationEvent" AS event
WHERE notification."organizationRecordId" IS NULL
  AND notification."eventId" = event."id"
  AND notification."organizationId" = organization."id"
  AND organization."status" = 'ACTIVE'
  AND organization."archivedAt" IS NULL
  AND event."organizationId" = organization."id"
  AND event."organizationRecordId" = organization."id"
  AND notification."recipientId" = event."recipientId"
  AND membership."organizationId" = organization."id"
  AND membership."userId" = notification."recipientId"
  AND membership."active" = TRUE
  AND membership."endedAt" IS NULL
  AND recipient."id" = notification."recipientId"
  AND recipient."deletedAt" IS NULL;