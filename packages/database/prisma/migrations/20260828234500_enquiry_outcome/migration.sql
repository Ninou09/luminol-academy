-- Add a protected, auditable operational outcome to enquiries.
ALTER TABLE "Enquiry"
ADD COLUMN "outcome" TEXT,
ADD COLUMN "outcomeAt" TIMESTAMP(3);

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_outcome_pair_check"
CHECK (
  ("outcome" IS NULL AND "outcomeAt" IS NULL)
  OR (
    "outcome" IS NOT NULL
    AND "outcomeAt" IS NOT NULL
    AND length(btrim("outcome")) BETWEEN 1 AND 240
  )
);

CREATE TABLE "EnquiryOutcomeEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromOutcome" TEXT,
    "toOutcome" TEXT,
    "fromOutcomeAt" TIMESTAMP(3),
    "toOutcomeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryOutcomeEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EnquiryOutcomeEvent_from_pair_check" CHECK (
      ("fromOutcome" IS NULL AND "fromOutcomeAt" IS NULL)
      OR (
        "fromOutcome" IS NOT NULL
        AND "fromOutcomeAt" IS NOT NULL
        AND length(btrim("fromOutcome")) BETWEEN 1 AND 240
      )
    ),
    CONSTRAINT "EnquiryOutcomeEvent_to_pair_check" CHECK (
      ("toOutcome" IS NULL AND "toOutcomeAt" IS NULL)
      OR (
        "toOutcome" IS NOT NULL
        AND "toOutcomeAt" IS NOT NULL
        AND length(btrim("toOutcome")) BETWEEN 1 AND 240
      )
    )
);

CREATE INDEX "EnquiryOutcomeEvent_enquiryId_createdAt_idx"
ON "EnquiryOutcomeEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryOutcomeEvent_actorUserId_createdAt_idx"
ON "EnquiryOutcomeEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryOutcomeEvent"
ADD CONSTRAINT "EnquiryOutcomeEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryOutcomeEvent"
ADD CONSTRAINT "EnquiryOutcomeEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_outcome_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry outcome history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryOutcomeEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryOutcomeEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_outcome_event_mutation"();
