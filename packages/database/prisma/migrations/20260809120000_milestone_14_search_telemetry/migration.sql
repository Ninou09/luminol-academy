-- Milestone 14 search telemetry intentionally stores no raw query text,
-- user identifiers, session identifiers, IP addresses, or sensitive content.
CREATE TYPE "SearchSurface" AS ENUM ('LEARNER', 'PUBLIC_PROGRAMMES', 'ADMIN');

CREATE TYPE "SearchOutcome" AS ENUM ('HIT', 'NO_MATCH');

CREATE TYPE "SearchResultBucket" AS ENUM ('ZERO', 'ONE_TO_FIVE', 'SIX_TO_TWENTY', 'TWENTY_PLUS');

CREATE TABLE "SearchTelemetryDaily" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "surface" "SearchSurface" NOT NULL,
    "outcome" "SearchOutcome" NOT NULL,
    "resultBucket" "SearchResultBucket" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchTelemetryDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SearchTelemetryDaily_day_surface_outcome_resultBucket_key"
ON "SearchTelemetryDaily"("day", "surface", "outcome", "resultBucket");

CREATE INDEX "SearchTelemetryDaily_surface_day_idx"
ON "SearchTelemetryDaily"("surface", "day");
