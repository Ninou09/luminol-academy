-- Add internal ownership to enquiries without changing public enquiry collection.
ALTER TABLE "Enquiry"
ADD COLUMN "ownerUserId" TEXT;

CREATE INDEX "Enquiry_ownerUserId_status_createdAt_idx"
ON "Enquiry"("ownerUserId", "status", "createdAt");

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "EnquiryOwnershipEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromOwnerUserId" TEXT,
    "toOwnerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryOwnershipEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnquiryOwnershipEvent_enquiryId_createdAt_idx"
ON "EnquiryOwnershipEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryOwnershipEvent_actorUserId_createdAt_idx"
ON "EnquiryOwnershipEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryOwnershipEvent"
ADD CONSTRAINT "EnquiryOwnershipEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryOwnershipEvent"
ADD CONSTRAINT "EnquiryOwnershipEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_ownership_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry ownership history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryOwnershipEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryOwnershipEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_ownership_event_mutation"();
