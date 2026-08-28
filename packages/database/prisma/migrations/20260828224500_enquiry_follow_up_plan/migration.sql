-- Add an internal, auditable next-action plan to enquiries.
ALTER TABLE "Enquiry"
ADD COLUMN "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN "nextAction" TEXT;

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_follow_up_plan_pair_check"
CHECK (
  ("nextFollowUpAt" IS NULL AND "nextAction" IS NULL)
  OR (
    "nextFollowUpAt" IS NOT NULL
    AND "nextAction" IS NOT NULL
    AND length(btrim("nextAction")) BETWEEN 1 AND 240
  )
);

CREATE INDEX "Enquiry_nextFollowUpAt_status_idx"
ON "Enquiry"("nextFollowUpAt", "status");

CREATE TABLE "EnquiryFollowUpEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromNextFollowUpAt" TIMESTAMP(3),
    "toNextFollowUpAt" TIMESTAMP(3),
    "fromNextAction" TEXT,
    "toNextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryFollowUpEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnquiryFollowUpEvent_enquiryId_createdAt_idx"
ON "EnquiryFollowUpEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryFollowUpEvent_actorUserId_createdAt_idx"
ON "EnquiryFollowUpEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryFollowUpEvent"
ADD CONSTRAINT "EnquiryFollowUpEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryFollowUpEvent"
ADD CONSTRAINT "EnquiryFollowUpEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_follow_up_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry follow-up history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryFollowUpEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryFollowUpEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_follow_up_event_mutation"();
