-- Add structured conversion qualification without changing existing enquiry state.
CREATE TYPE "EnquiryRequestKind" AS ENUM ('CONSULTATION', 'PROGRAMME', 'GENERAL');
CREATE TYPE "EnquiryReadiness" AS ENUM ('INFORMATION', 'REGISTRATION_BOOKING');

ALTER TABLE "Enquiry"
ADD COLUMN "profession" TEXT,
ADD COLUMN "requestKind" "EnquiryRequestKind" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN "readiness" "EnquiryReadiness";

CREATE INDEX "Enquiry_requestKind_readiness_createdAt_idx"
ON "Enquiry"("requestKind", "readiness", "createdAt");
