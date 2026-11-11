-- Milestone 21 Slice B: clients and psychology consultation scheduling.
-- Operational records only: no clinical or assessment fields.

CREATE TYPE "ConsultationMode" AS ENUM ('ONSITE', 'ONLINE');
CREATE TYPE "ConsultationStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE "ConsultationEventType" AS ENUM ('CREATED', 'RESCHEDULED', 'STATUS_CHANGED', 'NOTE_UPDATED');

CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "preferredLocale" TEXT NOT NULL DEFAULT 'ar',
  "contactConsent" BOOLEAN NOT NULL DEFAULT false,
  "contactConsentRecordedAt" TIMESTAMP(3),
  "sourceEnquiryId" TEXT,
  "operationalNote" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Client_operationalNote_length" CHECK ("operationalNote" IS NULL OR char_length("operationalNote") <= 500)
);

CREATE TABLE "ConsultationAppointment" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "consultantUserId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "mode" "ConsultationMode" NOT NULL,
  "status" "ConsultationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "priceMinor" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'DZD',
  "operationalNote" TEXT,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConsultationAppointment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConsultationAppointment_window" CHECK ("endsAt" > "startsAt"),
  CONSTRAINT "ConsultationAppointment_price_nonnegative" CHECK ("priceMinor" >= 0),
  CONSTRAINT "ConsultationAppointment_operationalNote_length" CHECK ("operationalNote" IS NULL OR char_length("operationalNote") <= 500)
);

CREATE TABLE "ConsultationAppointmentEvent" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "eventType" "ConsultationEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "fromStatus" "ConsultationStatus",
  "toStatus" "ConsultationStatus" NOT NULL,
  "fromStartsAt" TIMESTAMP(3),
  "toStartsAt" TIMESTAMP(3) NOT NULL,
  "fromRevision" INTEGER,
  "toRevision" INTEGER NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConsultationAppointmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Client_sourceEnquiryId_key" ON "Client"("sourceEnquiryId");
CREATE INDEX "Client_displayName_idx" ON "Client"("displayName");
CREATE INDEX "Client_phone_idx" ON "Client"("phone");
CREATE INDEX "Client_createdByUserId_createdAt_idx" ON "Client"("createdByUserId", "createdAt");
CREATE INDEX "Client_archivedAt_idx" ON "Client"("archivedAt");
CREATE INDEX "ConsultationAppointment_consultantUserId_startsAt_idx" ON "ConsultationAppointment"("consultantUserId", "startsAt");
CREATE INDEX "ConsultationAppointment_status_startsAt_idx" ON "ConsultationAppointment"("status", "startsAt");
CREATE INDEX "ConsultationAppointment_clientId_startsAt_idx" ON "ConsultationAppointment"("clientId", "startsAt");
CREATE INDEX "ConsultationAppointmentEvent_appointmentId_occurredAt_idx" ON "ConsultationAppointmentEvent"("appointmentId", "occurredAt");
CREATE INDEX "ConsultationAppointmentEvent_actorUserId_occurredAt_idx" ON "ConsultationAppointmentEvent"("actorUserId", "occurredAt");

ALTER TABLE "Client" ADD CONSTRAINT "Client_sourceEnquiryId_fkey" FOREIGN KEY ("sourceEnquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultationAppointment" ADD CONSTRAINT "ConsultationAppointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultationAppointment" ADD CONSTRAINT "ConsultationAppointment_consultantUserId_fkey" FOREIGN KEY ("consultantUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultationAppointment" ADD CONSTRAINT "ConsultationAppointment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultationAppointmentEvent" ADD CONSTRAINT "ConsultationAppointmentEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "ConsultationAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsultationAppointmentEvent" ADD CONSTRAINT "ConsultationAppointmentEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "prevent_consultation_event_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Consultation event history is append-only';
END;
$$;

CREATE TRIGGER "ConsultationAppointmentEvent_append_only_update"
BEFORE UPDATE ON "ConsultationAppointmentEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_consultation_event_mutation"();

CREATE TRIGGER "ConsultationAppointmentEvent_append_only_delete"
BEFORE DELETE ON "ConsultationAppointmentEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_consultation_event_mutation"();

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_consultation_manage', 'consultation:manage', 'Manage all clients and consultation appointments'),
  ('permission_consultation_deliver', 'consultation:deliver', 'Deliver and manage own consultation appointments')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Role" ("id", "key", "name", "description", "updatedAt") VALUES
  ('role_consultant', 'consultant', 'Consultant', 'Delivers psychology consultations; sees only own appointments and their clients', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" = 'consultation:manage'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM "Role", "Permission"
WHERE "Role"."key" = 'consultant' AND "Permission"."key" = 'consultation:deliver'
ON CONFLICT DO NOTHING;
