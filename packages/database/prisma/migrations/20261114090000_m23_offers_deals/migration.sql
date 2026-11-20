-- Milestone 23 Slice A: section offers, opportunities (deals) and append-only deal history.
-- Stage keys per section are defined in packages/validation/src/crm-sections.ts.

-- CreateEnum
CREATE TYPE "CrmSection" AS ENUM ('PSYCHOLOGY', 'LANGUAGES', 'PROFESSIONAL', 'EVENTS');

-- CreateEnum
CREATE TYPE "CrmOfferKind" AS ENUM ('CONSULTATION', 'LANGUAGE_COURSE', 'PROFESSIONAL_PROGRAMME', 'FAMILY_WORKSHOP', 'FREE_SESSION', 'EVENT');

-- CreateEnum
CREATE TYPE "CrmOfferStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrmDealState" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "CrmDealEventType" AS ENUM ('CREATED', 'STAGE_CHANGED');

-- CreateTable
CREATE TABLE "CrmOffer" (
    "id" TEXT NOT NULL,
    "section" "CrmSection" NOT NULL,
    "kind" "CrmOfferKind" NOT NULL,
    "title" TEXT NOT NULL,
    "priceMinor" INTEGER,
    "currency" CHAR(3) NOT NULL DEFAULT 'DZD',
    "startsOn" DATE,
    "endsOn" DATE,
    "capacity" INTEGER,
    "trainerUserId" TEXT,
    "status" "CrmOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDeal" (
    "id" TEXT NOT NULL,
    "section" "CrmSection" NOT NULL,
    "stage" TEXT NOT NULL,
    "state" "CrmDealState" NOT NULL DEFAULT 'OPEN',
    "enquiryId" TEXT,
    "clientId" TEXT,
    "offerId" TEXT,
    "valueMinor" INTEGER,
    "currency" CHAR(3) NOT NULL DEFAULT 'DZD',
    "ownerUserId" TEXT,
    "expectedCloseOn" DATE,
    "lostReason" TEXT,
    "closedAt" TIMESTAMP(3),
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDealEvent" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" "CrmDealEventType" NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmDealEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmOffer_section_status_startsOn_idx" ON "CrmOffer"("section", "status", "startsOn");

-- CreateIndex
CREATE INDEX "CrmOffer_trainerUserId_idx" ON "CrmOffer"("trainerUserId");

-- CreateIndex
CREATE INDEX "CrmDeal_section_state_updatedAt_idx" ON "CrmDeal"("section", "state", "updatedAt");

-- CreateIndex
CREATE INDEX "CrmDeal_enquiryId_idx" ON "CrmDeal"("enquiryId");

-- CreateIndex
CREATE INDEX "CrmDeal_clientId_idx" ON "CrmDeal"("clientId");

-- CreateIndex
CREATE INDEX "CrmDeal_offerId_state_idx" ON "CrmDeal"("offerId", "state");

-- CreateIndex
CREATE INDEX "CrmDeal_ownerUserId_state_idx" ON "CrmDeal"("ownerUserId", "state");

-- CreateIndex
CREATE INDEX "CrmDealEvent_dealId_occurredAt_idx" ON "CrmDealEvent"("dealId", "occurredAt");

-- CreateIndex
CREATE INDEX "CrmDealEvent_actorUserId_occurredAt_idx" ON "CrmDealEvent"("actorUserId", "occurredAt");

-- AddForeignKey
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_trainerUserId_fkey" FOREIGN KEY ("trainerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "CrmOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDealEvent" ADD CONSTRAINT "CrmDealEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDealEvent" ADD CONSTRAINT "CrmDealEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Data rules
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_title_length" CHECK (char_length("title") BETWEEN 2 AND 160);
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_price_nonnegative" CHECK ("priceMinor" IS NULL OR "priceMinor" >= 0);
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_capacity_range" CHECK ("capacity" IS NULL OR "capacity" BETWEEN 1 AND 10000);
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_dates_ordered" CHECK ("startsOn" IS NULL OR "endsOn" IS NULL OR "endsOn" >= "startsOn");
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_currency_dzd" CHECK ("currency" = 'DZD');
ALTER TABLE "CrmOffer" ADD CONSTRAINT "CrmOffer_section_kind" CHECK (
  ("section" = 'PSYCHOLOGY' AND "kind" IN ('CONSULTATION', 'FAMILY_WORKSHOP')) OR
  ("section" = 'LANGUAGES' AND "kind" = 'LANGUAGE_COURSE') OR
  ("section" = 'PROFESSIONAL' AND "kind" IN ('PROFESSIONAL_PROGRAMME', 'FAMILY_WORKSHOP')) OR
  ("section" = 'EVENTS' AND "kind" IN ('FREE_SESSION', 'EVENT'))
);

ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_subject" CHECK ("enquiryId" IS NOT NULL OR "clientId" IS NOT NULL);
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_stage_format" CHECK ("stage" ~ '^[A-Z_]{2,32}$');
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_closed_state" CHECK (("state" = 'OPEN') = ("closedAt" IS NULL));
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_value_nonnegative" CHECK ("valueMinor" IS NULL OR "valueMinor" >= 0);
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_currency_dzd" CHECK ("currency" = 'DZD');
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_lost_reason" CHECK (
  "lostReason" IS NULL OR ("state" = 'LOST' AND char_length("lostReason") BETWEEN 2 AND 240)
);
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_revision_positive" CHECK ("revision" >= 1);

ALTER TABLE "CrmDealEvent" ADD CONSTRAINT "CrmDealEvent_stage_format" CHECK (
  "toStage" ~ '^[A-Z_]{2,32}$' AND ("fromStage" IS NULL OR "fromStage" ~ '^[A-Z_]{2,32}$')
);
ALTER TABLE "CrmDealEvent" ADD CONSTRAINT "CrmDealEvent_reason_length" CHECK ("reason" IS NULL OR char_length("reason") BETWEEN 2 AND 240);

-- One open opportunity per person and section
CREATE UNIQUE INDEX "CrmDeal_open_enquiry_section_key" ON "CrmDeal"("enquiryId", "section") WHERE "state" = 'OPEN' AND "enquiryId" IS NOT NULL;
CREATE UNIQUE INDEX "CrmDeal_open_client_section_key" ON "CrmDeal"("clientId", "section") WHERE "state" = 'OPEN' AND "clientId" IS NOT NULL;

-- Deal history is append-only
CREATE OR REPLACE FUNCTION "prevent_crm_deal_event_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'CRM deal history is append-only';
END;
$$;

CREATE TRIGGER "CrmDealEvent_append_only_update"
BEFORE UPDATE ON "CrmDealEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_crm_deal_event_mutation"();

CREATE TRIGGER "CrmDealEvent_append_only_delete"
BEFORE DELETE ON "CrmDealEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_crm_deal_event_mutation"();

-- Offer catalogue is managed by the owner
INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_offer_manage', 'offer:manage', 'Manage the section offers catalogue: create offers and change their status')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" = 'offer:manage'
ON CONFLICT DO NOTHING;
