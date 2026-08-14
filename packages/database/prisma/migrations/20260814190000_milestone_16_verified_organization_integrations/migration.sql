-- Milestone 16 Slice E: connect new organization-aware finance and notification
-- records to first-class Organization rows without reinterpreting unmatched legacy
-- organization identifiers.

-- Install the expand-phase write guard atomically with the new nullable columns.
-- The short DDL transaction prevents a legacy identity write from landing between
-- column creation and guard installation. Long-running backfills happen only after
-- this transaction commits, so normal writers are not locked for those scans.
BEGIN;

ALTER TABLE "Invoice" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "CorporateBillingRecord" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "NotificationEvent" ADD COLUMN "organizationRecordId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "organizationRecordId" TEXT;

CREATE OR REPLACE FUNCTION "enforce_expand_phase_organization_identity"()
RETURNS TRIGGER AS $$
DECLARE
  legacy_identity_changed BOOLEAN := TRUE;
  can_verify_relationship BOOLEAN := FALSE;
  parent_organization_id TEXT;
  parent_recipient_id TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    CASE TG_TABLE_NAME
      WHEN 'Invoice' THEN
        legacy_identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId";
      WHEN 'CorporateBillingRecord' THEN
        legacy_identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
          OR OLD."invoiceId" IS DISTINCT FROM NEW."invoiceId";
      WHEN 'NotificationEvent' THEN
        legacy_identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
          OR OLD."recipientId" IS DISTINCT FROM NEW."recipientId";
      WHEN 'Notification' THEN
        legacy_identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
          OR OLD."eventId" IS DISTINCT FROM NEW."eventId"
          OR OLD."recipientId" IS DISTINCT FROM NEW."recipientId";
      ELSE
        legacy_identity_changed := FALSE;
    END CASE;

    -- Invoice and notification-event identity is write-once. Making the parent
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

    -- Backfills in this migration only populate organizationRecordId. They must
    -- not be mistaken for legacy application identity changes by this temporary
    -- expand-phase guard.
    IF NOT legacy_identity_changed THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Parent identity must stay consistent even when the organization identifier is
  -- genuinely opaque and therefore cannot be verified against Organization yet.
  IF TG_TABLE_NAME = 'CorporateBillingRecord' THEN
    SELECT invoice."organizationId"
      INTO parent_organization_id
    FROM "Invoice" AS invoice
    WHERE invoice."id" = NEW."invoiceId";

    IF NEW."organizationId" IS DISTINCT FROM parent_organization_id THEN
      RAISE EXCEPTION 'Corporate billing organization must match invoice organization';
    END IF;
  ELSIF TG_TABLE_NAME = 'Notification' THEN
    SELECT event."organizationId", event."recipientId"
      INTO parent_organization_id, parent_recipient_id
    FROM "NotificationEvent" AS event
    WHERE event."id" = NEW."eventId";

    IF NEW."organizationId" IS DISTINCT FROM parent_organization_id THEN
      RAISE EXCEPTION 'Notification organization must match notification event organization';
    END IF;

    IF NEW."recipientId" IS DISTINCT FROM parent_recipient_id THEN
      RAISE EXCEPTION 'Notification recipient must match notification event recipient';
    END IF;
  END IF;

  IF NEW."organizationId" IS NULL THEN
    IF NEW."organizationRecordId" IS NOT NULL THEN
      RAISE EXCEPTION 'Verified organization requires organization identity';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."organizationRecordId" IS NOT NULL
     AND NEW."organizationId" IS DISTINCT FROM NEW."organizationRecordId" THEN
    RAISE EXCEPTION 'Organization identity does not match verified organization';
  END IF;

  IF EXISTS (
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

  IF can_verify_relationship THEN
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

  IF NEW."organizationRecordId" IS NOT NULL THEN
    RAISE EXCEPTION 'Verified organization must be active and relationship-valid';
  END IF;

  -- Only identifiers with no first-class Organization row retain legacy opaque
  -- compatibility. Existing first-class identities must prove their relationship.
  IF EXISTS (
    SELECT 1
    FROM "Organization" AS organization
    WHERE organization."id" = NEW."organizationId"
  ) THEN
    RAISE EXCEPTION 'First-class organization scope requires a verified relationship';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "00_Invoice_expand_identity_guard"
BEFORE INSERT OR UPDATE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION "enforce_expand_phase_organization_identity"();

CREATE TRIGGER "00_CorporateBillingRecord_expand_identity_guard"
BEFORE INSERT OR UPDATE ON "CorporateBillingRecord"
FOR EACH ROW EXECUTE FUNCTION "enforce_expand_phase_organization_identity"();

CREATE TRIGGER "00_NotificationEvent_expand_identity_guard"
BEFORE INSERT OR UPDATE ON "NotificationEvent"
FOR EACH ROW EXECUTE FUNCTION "enforce_expand_phase_organization_identity"();

CREATE TRIGGER "00_Notification_expand_identity_guard"
BEFORE INSERT OR UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION "enforce_expand_phase_organization_identity"();

COMMIT;

-- Historical verified-organization links are intentionally reconciled after
-- prisma migrate deploy by a bounded, idempotent backfill. Keeping these scans out
-- of the migration prevents long-lived row locks while the temporary expand guard
-- protects all new and identity-changing writes during deployment.

-- Historical child Notification rows are intentionally not backfilled inside
-- prisma migrate deploy. The verified relation remains nullable for legacy history,
-- while temporary and permanent guards protect all new or identity-changing writes.
-- The production migration workflow runs a separate bounded transaction backfill
-- after schema deployment so notification workers are never held behind a table-wide
-- migration transaction.

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
  can_derive_verified_organization BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    identity_changed := TRUE;
  ELSE
    identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";

    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Invoice organization identity is immutable';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId" THEN
      RAISE EXCEPTION 'Notification event organization identity is immutable';
    END IF;

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

  -- Expand-phase compatibility: the pre-Slice-E application writes only the
  -- legacy-compatible organizationId. Derive the verified relation only for a
  -- new row or an explicit organization-identity change. Routine updates to
  -- unmatched historical rows must never reinterpret an opaque legacy identifier.
  IF NEW."organizationRecordId" IS NULL THEN
    IF TG_OP = 'UPDATE' AND NOT identity_changed THEN
      RETURN NEW;
    END IF;

    IF EXISTS (
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

    IF can_derive_verified_organization THEN
      NEW."organizationRecordId" := NEW."organizationId";
    ELSE
      -- Opaque identifiers that do not resolve to a first-class Organization
      -- remain legacy-compatible during expansion. Once an identifier names a
      -- first-class Organization, every integrated table must prove its verified
      -- relationship instead of silently falling back to legacy mode.
      IF EXISTS (
        SELECT 1
        FROM "Organization" AS organization
        WHERE organization."id" = NEW."organizationId"
      ) THEN
        RAISE EXCEPTION 'First-class organization scope requires a verified relationship';
      END IF;

      RETURN NEW;
    END IF;
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

-- PostgreSQL fires same-kind triggers in name order. Keep the derivation guard
-- ahead of table-specific relationship guards so legacy writers can be upgraded
-- safely before those stronger verified-scope checks execute.
CREATE TRIGGER "Invoice_derive_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "CorporateBillingRecord_derive_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "CorporateBillingRecord"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "NotificationEvent_derive_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "NotificationEvent"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE TRIGGER "Notification_derive_verified_organization_guard"
BEFORE INSERT OR UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION "enforce_verified_organization_link"();

CREATE OR REPLACE FUNCTION "enforce_corporate_billing_invoice_organization"()
RETURNS TRIGGER AS $$
DECLARE
  invoice_organization_id TEXT;
  invoice_organization_record_id TEXT;
  identity_changed BOOLEAN;
BEGIN
  SELECT "organizationId", "organizationRecordId"
    INTO invoice_organization_id, invoice_organization_record_id
  FROM "Invoice"
  WHERE "id" = NEW."invoiceId"
  FOR UPDATE;

  IF TG_OP = 'INSERT' THEN
    identity_changed := TRUE;
  ELSE
    identity_changed := OLD."invoiceId" IS DISTINCT FROM NEW."invoiceId"
      OR OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";
  END IF;

  -- Preserve routine updates to historical inconsistent rows, but every new or
  -- identity-changing billing write must match the parent invoice even when the
  -- organization identifier is genuinely opaque and therefore unverified.
  IF identity_changed
     AND NEW."organizationId" IS DISTINCT FROM invoice_organization_id THEN
    RAISE EXCEPTION 'Corporate billing organization must match invoice organization';
  END IF;

  IF NEW."organizationRecordId" IS NOT NULL
     AND invoice_organization_record_id IS NULL
     AND NEW."organizationId" IS NOT DISTINCT FROM invoice_organization_id THEN
    UPDATE "Invoice"
    SET "organizationRecordId" = NEW."organizationRecordId"
    WHERE "id" = NEW."invoiceId"
      AND "organizationRecordId" IS NULL;
    invoice_organization_record_id := NEW."organizationRecordId";
  END IF;

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
  IF TG_OP = 'UPDATE'
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
    RAISE EXCEPTION 'Notification event recipient identity is immutable';
  END IF;

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
  event_organization_id TEXT;
  event_organization_record_id TEXT;
  event_recipient_id TEXT;
  identity_changed BOOLEAN;
  recipient_identity_changed BOOLEAN;
BEGIN
  SELECT "organizationId", "organizationRecordId", "recipientId"
    INTO event_organization_id, event_organization_record_id, event_recipient_id
  FROM "NotificationEvent"
  WHERE "id" = NEW."eventId"
  FOR UPDATE;

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

  IF identity_changed
     AND NEW."organizationId" IS DISTINCT FROM event_organization_id THEN
    RAISE EXCEPTION 'Notification organization must match notification event organization';
  END IF;

  IF NEW."organizationRecordId" IS NOT NULL
     AND event_organization_record_id IS NULL
     AND NEW."organizationId" IS NOT DISTINCT FROM event_organization_id
     AND NEW."recipientId" IS NOT DISTINCT FROM event_recipient_id THEN
    UPDATE "NotificationEvent"
    SET "organizationRecordId" = NEW."organizationRecordId"
    WHERE "id" = NEW."eventId"
      AND "organizationRecordId" IS NULL;
    event_organization_record_id := NEW."organizationRecordId";
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

-- Full guards are now active. Remove the temporary expand-phase guard only after
-- the replacement triggers exist, so there is never an unguarded identity-write
-- window during deployment.
DROP TRIGGER "00_Invoice_expand_identity_guard" ON "Invoice";
DROP TRIGGER "00_CorporateBillingRecord_expand_identity_guard" ON "CorporateBillingRecord";
DROP TRIGGER "00_NotificationEvent_expand_identity_guard" ON "NotificationEvent";
DROP TRIGGER "00_Notification_expand_identity_guard" ON "Notification";
DROP FUNCTION "enforce_expand_phase_organization_identity"();

-- Historical Invoice, CorporateBillingRecord, NotificationEvent and Notification
-- links are reconciled after schema deployment in bounded committed batches. New
-- writes are already protected by the permanent guards above.
