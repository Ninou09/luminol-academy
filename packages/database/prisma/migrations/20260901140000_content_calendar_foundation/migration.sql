CREATE TYPE "ContentCalendarPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK');
CREATE TYPE "ContentCalendarFormat" AS ENUM ('REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'OTHER');
CREATE TYPE "ContentCalendarStatus" AS ENUM ('DRAFT', 'READY', 'SCHEDULED', 'ARCHIVED');
CREATE TYPE "ContentCalendarEventType" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED');

CREATE TABLE "ContentCalendarItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "platform" "ContentCalendarPlatform" NOT NULL,
  "accountRef" TEXT NOT NULL,
  "format" "ContentCalendarFormat" NOT NULL,
  "status" "ContentCalendarStatus" NOT NULL DEFAULT 'DRAFT',
  "assetReference" TEXT,
  "scheduledFor" TIMESTAMP(3),
  "timezone" TEXT,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdByUserId" TEXT NOT NULL,
  "updatedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentCalendarItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentCalendarItemEvent" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "eventType" "ContentCalendarEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "fromStatus" "ContentCalendarStatus",
  "toStatus" "ContentCalendarStatus" NOT NULL,
  "fromRevision" INTEGER,
  "toRevision" INTEGER NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentCalendarItemEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContentCalendarItem_status_scheduledFor_idx" ON "ContentCalendarItem"("status", "scheduledFor");
CREATE INDEX "ContentCalendarItem_platform_status_scheduledFor_idx" ON "ContentCalendarItem"("platform", "status", "scheduledFor");
CREATE INDEX "ContentCalendarItem_createdByUserId_createdAt_idx" ON "ContentCalendarItem"("createdByUserId", "createdAt");
CREATE INDEX "ContentCalendarItem_updatedByUserId_updatedAt_idx" ON "ContentCalendarItem"("updatedByUserId", "updatedAt");
CREATE INDEX "ContentCalendarItemEvent_itemId_occurredAt_idx" ON "ContentCalendarItemEvent"("itemId", "occurredAt");
CREATE INDEX "ContentCalendarItemEvent_actorUserId_occurredAt_idx" ON "ContentCalendarItemEvent"("actorUserId", "occurredAt");

ALTER TABLE "ContentCalendarItem" ADD CONSTRAINT "ContentCalendarItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentCalendarItem" ADD CONSTRAINT "ContentCalendarItem_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentCalendarItemEvent" ADD CONSTRAINT "ContentCalendarItemEvent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ContentCalendarItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentCalendarItemEvent" ADD CONSTRAINT "ContentCalendarItemEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
