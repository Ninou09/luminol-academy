ALTER TABLE "Notification" ADD COLUMN "lockToken" TEXT;
ALTER TABLE "Notification" ADD COLUMN "lockedUntil" TIMESTAMP(3);
CREATE UNIQUE INDEX "Notification_lockToken_key" ON "Notification"("lockToken");
DROP INDEX "Certificate_userId_courseId_key";
CREATE INDEX "Certificate_userId_courseId_status_idx" ON "Certificate"("userId", "courseId", "status");

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "windowEnd" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_windowEnd_idx" ON "RateLimitBucket"("windowEnd");
ALTER TABLE "RateLimitBucket" ADD CONSTRAINT "RateLimitBucket_count_check" CHECK ("count" > 0);
