-- Milestone 22 Slice A: append-only CRM activity log for leads and contacts.

CREATE TYPE "CrmActivityType" AS ENUM ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'NOTE');
CREATE TYPE "CrmActivityDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "CrmActivityOutcome" AS ENUM ('REACHED', 'NO_ANSWER', 'LEFT_MESSAGE', 'BOOKED', 'NOT_INTERESTED', 'OTHER');

CREATE TABLE "CrmActivity" (
  "id" TEXT NOT NULL,
  "type" "CrmActivityType" NOT NULL,
  "direction" "CrmActivityDirection",
  "outcome" "CrmActivityOutcome",
  "summary" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "enquiryId" TEXT,
  "clientId" TEXT,
  "actorUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CrmActivity_subject" CHECK ("enquiryId" IS NOT NULL OR "clientId" IS NOT NULL),
  CONSTRAINT "CrmActivity_direction" CHECK (("type" = 'NOTE') = ("direction" IS NULL)),
  CONSTRAINT "CrmActivity_summary_length" CHECK (char_length("summary") BETWEEN 2 AND 1000)
);

CREATE INDEX "CrmActivity_enquiryId_occurredAt_idx" ON "CrmActivity"("enquiryId", "occurredAt");
CREATE INDEX "CrmActivity_clientId_occurredAt_idx" ON "CrmActivity"("clientId", "occurredAt");
CREATE INDEX "CrmActivity_actorUserId_occurredAt_idx" ON "CrmActivity"("actorUserId", "occurredAt");
CREATE INDEX "CrmActivity_occurredAt_idx" ON "CrmActivity"("occurredAt");

ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "prevent_crm_activity_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'CRM activity history is append-only';
END;
$$;

CREATE TRIGGER "CrmActivity_append_only_update"
BEFORE UPDATE ON "CrmActivity"
FOR EACH ROW EXECUTE FUNCTION "prevent_crm_activity_mutation"();

CREATE TRIGGER "CrmActivity_append_only_delete"
BEFORE DELETE ON "CrmActivity"
FOR EACH ROW EXECUTE FUNCTION "prevent_crm_activity_mutation"();
