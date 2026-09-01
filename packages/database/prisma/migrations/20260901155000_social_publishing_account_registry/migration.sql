CREATE TYPE "SocialPublishingAccountEventType" AS ENUM ('CREATED', 'UPDATED', 'ACTIVATION_CHANGED');

CREATE TABLE "SocialPublishingAccount" (
  "id" TEXT NOT NULL,
  "accountRef" TEXT NOT NULL,
  "platform" "ContentCalendarPlatform" NOT NULL,
  "displayName" TEXT NOT NULL,
  "externalAccountId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdByUserId" TEXT NOT NULL,
  "updatedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialPublishingAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPublishingAccountEvent" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "eventType" "SocialPublishingAccountEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "fromActive" BOOLEAN,
  "toActive" BOOLEAN NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPublishingAccountEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialPublishingAccount_accountRef_key" ON "SocialPublishingAccount"("accountRef");
CREATE UNIQUE INDEX "SocialPublishingAccount_platform_externalAccountId_key" ON "SocialPublishingAccount"("platform", "externalAccountId");
CREATE INDEX "SocialPublishingAccount_platform_active_accountRef_idx" ON "SocialPublishingAccount"("platform", "active", "accountRef");
CREATE INDEX "SocialPublishingAccount_createdByUserId_createdAt_idx" ON "SocialPublishingAccount"("createdByUserId", "createdAt");
CREATE INDEX "SocialPublishingAccount_updatedByUserId_updatedAt_idx" ON "SocialPublishingAccount"("updatedByUserId", "updatedAt");
CREATE INDEX "SocialPublishingAccountEvent_accountId_occurredAt_idx" ON "SocialPublishingAccountEvent"("accountId", "occurredAt");
CREATE INDEX "SocialPublishingAccountEvent_actorUserId_occurredAt_idx" ON "SocialPublishingAccountEvent"("actorUserId", "occurredAt");

ALTER TABLE "SocialPublishingAccount" ADD CONSTRAINT "SocialPublishingAccount_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAccount" ADD CONSTRAINT "SocialPublishingAccount_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAccountEvent" ADD CONSTRAINT "SocialPublishingAccountEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SocialPublishingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAccountEvent" ADD CONSTRAINT "SocialPublishingAccountEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_social_publishing_account_event_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'SocialPublishingAccountEvent is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_publishing_account_event_no_update
BEFORE UPDATE ON "SocialPublishingAccountEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_social_publishing_account_event_mutation();

CREATE TRIGGER social_publishing_account_event_no_delete
BEFORE DELETE ON "SocialPublishingAccountEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_social_publishing_account_event_mutation();
