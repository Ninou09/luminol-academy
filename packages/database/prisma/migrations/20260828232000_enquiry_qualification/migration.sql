-- Add backward-compatible structured routing preferences to public enquiries.
CREATE TYPE "EnquiryContactPreference" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP');
CREATE TYPE "EnquiryDeliveryPreference" AS ENUM ('IN_PERSON', 'ONLINE', 'FLEXIBLE', 'NOT_SURE');
CREATE TYPE "EnquiryTimingPreference" AS ENUM ('SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE');

ALTER TABLE "Enquiry"
ADD COLUMN "city" TEXT,
ADD COLUMN "preferredContact" "EnquiryContactPreference",
ADD COLUMN "deliveryPreference" "EnquiryDeliveryPreference",
ADD COLUMN "timingPreference" "EnquiryTimingPreference";
