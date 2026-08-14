-- Milestone 16 Slice E follow-up: keep verified notification-event recipient
-- identity consistent with existing and concurrently-created child notifications.

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

    -- A verified event is the parent identity for all of its child notifications.
    -- Once a child exists, changing the event recipient would strand that child
    -- under a different recipient. The event row is already update-locked by this
    -- statement; child inserts take a SHARE row lock below so the two directions
    -- serialize and cannot race past one another.
    IF OLD."recipientId" IS DISTINCT FROM NEW."recipientId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event recipient is immutable once notifications exist';
    END IF;
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

CREATE OR REPLACE FUNCTION "enforce_notification_event_organization"()
RETURNS TRIGGER AS $$
DECLARE
  event_organization_record_id TEXT;
  event_recipient_id TEXT;
  identity_changed BOOLEAN;
  recipient_identity_changed BOOLEAN;
BEGIN
  -- Lock the parent event while validating a child identity. FOR SHARE conflicts
  -- with an update that changes the event recipient, closing the race where a
  -- child could otherwise validate against the old recipient while the parent
  -- concurrently commits a new one.
  SELECT "organizationRecordId", "recipientId"
    INTO event_organization_record_id, event_recipient_id
  FROM "NotificationEvent"
  WHERE "id" = NEW."eventId"
  FOR SHARE;

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
