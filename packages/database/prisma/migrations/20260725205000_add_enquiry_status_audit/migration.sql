CREATE TABLE "EnquiryStatusEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromStatus" "EnquiryStatus" NOT NULL,
    "toStatus" "EnquiryStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnquiryStatusEvent_enquiryId_createdAt_idx"
ON "EnquiryStatusEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryStatusEvent_actorUserId_createdAt_idx"
ON "EnquiryStatusEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryStatusEvent"
ADD CONSTRAINT "EnquiryStatusEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryStatusEvent"
ADD CONSTRAINT "EnquiryStatusEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
