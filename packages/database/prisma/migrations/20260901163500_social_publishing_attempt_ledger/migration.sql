CREATE TYPE "SocialPublishingAttemptStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'RETRY_SCHEDULED', 'SUCCEEDED', 'DEAD_LETTER');
CREATE TYPE "SocialPublishingAttemptEventType" AS ENUM ('PLANNED', 'STARTED', 'SUCCEEDED', 'PROVIDER_FAILED', 'INVALIDATED');

CREATE TABLE "SocialPublishingAttempt" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "contentCalendarItemId" TEXT NOT NULL,
  "contentRevision" INTEGER NOT NULL,
  "platform" "ContentCalendarPlatform" NOT NULL,
  "accountRef" TEXT NOT NULL,
  "externalAccountId" TEXT NOT NULL,
  "status" "SocialPublishingAttemptStatus" NOT NULL DEFAULT 'PLANNED',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "providerReference" TEXT,
  "lastErrorCode" TEXT,
  "lockToken" TEXT,
  "lockedUntil" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialPublishingAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPublishingAttemptEvent" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "eventType" "SocialPublishingAttemptEventType" NOT NULL,
  "actorUserId" TEXT,
  "fromStatus" "SocialPublishingAttemptStatus",
  "toStatus" "SocialPublishingAttemptStatus" NOT NULL,
  "attemptNumber" INTEGER NOT NULL DEFAULT 0,
  "providerReference" TEXT,
  "errorCode" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPublishingAttemptEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialPublishingAttempt_idempotencyKey_key" ON "SocialPublishingAttempt"("idempotencyKey");
CREATE UNIQUE INDEX "SocialPublishingAttempt_proposalId_key" ON "SocialPublishingAttempt"("proposalId");
CREATE INDEX "SocialPublishingAttempt_status_nextAttemptAt_idx" ON "SocialPublishingAttempt"("status", "nextAttemptAt");
CREATE INDEX "SocialPublishingAttempt_platform_status_nextAttemptAt_idx" ON "SocialPublishingAttempt"("platform", "status", "nextAttemptAt");
CREATE INDEX "SocialPublishingAttempt_contentCalendarItemId_contentRevision_idx" ON "SocialPublishingAttempt"("contentCalendarItemId", "contentRevision");
CREATE INDEX "SocialPublishingAttempt_accountRef_status_createdAt_idx" ON "SocialPublishingAttempt"("accountRef", "status", "createdAt");
CREATE INDEX "SocialPublishingAttemptEvent_attemptId_occurredAt_idx" ON "SocialPublishingAttemptEvent"("attemptId", "occurredAt");
CREATE INDEX "SocialPublishingAttemptEvent_actorUserId_occurredAt_idx" ON "SocialPublishingAttemptEvent"("actorUserId", "occurredAt");

ALTER TABLE "SocialPublishingAttempt" ADD CONSTRAINT "SocialPublishingAttempt_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AiOperatorProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAttempt" ADD CONSTRAINT "SocialPublishingAttempt_contentCalendarItemId_fkey" FOREIGN KEY ("contentCalendarItemId") REFERENCES "ContentCalendarItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAttempt" ADD CONSTRAINT "SocialPublishingAttempt_accountRef_fkey" FOREIGN KEY ("accountRef") REFERENCES "SocialPublishingAccount"("accountRef") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAttemptEvent" ADD CONSTRAINT "SocialPublishingAttemptEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SocialPublishingAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPublishingAttemptEvent" ADD CONSTRAINT "SocialPublishingAttemptEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SocialPublishingAttempt" ADD CONSTRAINT "SocialPublishingAttempt_attempt_count_nonnegative" CHECK ("attemptCount" >= 0);
ALTER TABLE "SocialPublishingAttemptEvent" ADD CONSTRAINT "SocialPublishingAttemptEvent_attempt_number_nonnegative" CHECK ("attemptNumber" >= 0);

CREATE OR REPLACE FUNCTION prevent_social_publishing_attempt_event_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'SocialPublishingAttemptEvent is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_publishing_attempt_event_no_update
BEFORE UPDATE ON "SocialPublishingAttemptEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_social_publishing_attempt_event_mutation();
CREATE TRIGGER social_publishing_attempt_event_no_delete
BEFORE DELETE ON "SocialPublishingAttemptEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_social_publishing_attempt_event_mutation();

CREATE OR REPLACE FUNCTION enforce_social_publishing_attempt_terminal_state()
RETURNS trigger AS $$
BEGIN
  IF OLD."status" IN ('SUCCEEDED', 'DEAD_LETTER') AND NEW."status" <> OLD."status" THEN
    RAISE EXCEPTION 'SocialPublishingAttempt terminal state is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_publishing_attempt_terminal_state_guard
BEFORE UPDATE ON "SocialPublishingAttempt"
FOR EACH ROW EXECUTE FUNCTION enforce_social_publishing_attempt_terminal_state();
