-- CreateEnum
CREATE TYPE "AiProviderMode" AS ENUM ('OFF', 'OPENAI');

-- CreateEnum
CREATE TYPE "AiProviderTaskClass" AS ENUM ('SUMMARIZE_OPERATIONAL_STATE', 'DRAFT_OPERATOR_RECOMMENDATIONS', 'ANALYZE_CAMPAIGN_METRICS');

-- CreateEnum
CREATE TYPE "AiProviderUsageOutcome" AS ENUM ('SUCCEEDED', 'FAILED', 'BLOCKED');

-- CreateTable
CREATE TABLE "AiProviderUsage" (
    "id" TEXT NOT NULL,
    "providerMode" "AiProviderMode" NOT NULL,
    "taskClass" "AiProviderTaskClass" NOT NULL,
    "outcome" "AiProviderUsageOutcome" NOT NULL,
    "model" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCostUsdMicros" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "errorCode" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiProviderUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProviderUsage_occurredAt_idx" ON "AiProviderUsage"("occurredAt");

-- CreateIndex
CREATE INDEX "AiProviderUsage_providerMode_taskClass_occurredAt_idx" ON "AiProviderUsage"("providerMode", "taskClass", "occurredAt");

-- CreateIndex
CREATE INDEX "AiProviderUsage_outcome_occurredAt_idx" ON "AiProviderUsage"("outcome", "occurredAt");
