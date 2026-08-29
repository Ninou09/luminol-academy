-- Add privacy-bounded campaign attribution to public enquiries.
ALTER TABLE "Enquiry"
ADD COLUMN "landingPath" TEXT,
ADD COLUMN "utmSource" TEXT,
ADD COLUMN "utmMedium" TEXT,
ADD COLUMN "utmCampaign" TEXT,
ADD COLUMN "utmContent" TEXT;

CREATE INDEX "Enquiry_utmSource_utmCampaign_createdAt_idx"
ON "Enquiry"("utmSource", "utmCampaign", "createdAt");
