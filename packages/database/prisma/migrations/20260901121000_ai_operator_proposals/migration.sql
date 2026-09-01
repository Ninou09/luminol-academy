-- CreateEnum
CREATE TYPE "AiOperatorProposalStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiOperatorProposalEventType" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AiOperatorProposal" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "actionVersion" TEXT NOT NULL,
    "actionKind" TEXT NOT NULL,
    "executionPolicy" TEXT NOT NULL,
    "sourceSurface" TEXT NOT NULL,
    "sourceReference" TEXT NOT NULL,
    "actionEnvelope" JSONB NOT NULL,
    "status" "AiOperatorProposalStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "proposedByUserId" TEXT,
    "decidedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiOperatorProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiOperatorProposalEvent" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "eventType" "AiOperatorProposalEventType" NOT NULL,
    "actorUserId" TEXT,
    "fromStatus" "AiOperatorProposalStatus",
    "toStatus" "AiOperatorProposalStatus" NOT NULL,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiOperatorProposalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiOperatorProposal_actionId_key" ON "AiOperatorProposal"("actionId");

-- CreateIndex
CREATE INDEX "AiOperatorProposal_status_createdAt_idx" ON "AiOperatorProposal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AiOperatorProposal_actionKind_status_createdAt_idx" ON "AiOperatorProposal"("actionKind", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AiOperatorProposal_proposedByUserId_createdAt_idx" ON "AiOperatorProposal"("proposedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AiOperatorProposal_decidedByUserId_decidedAt_idx" ON "AiOperatorProposal"("decidedByUserId", "decidedAt");

-- CreateIndex
CREATE INDEX "AiOperatorProposalEvent_proposalId_occurredAt_idx" ON "AiOperatorProposalEvent"("proposalId", "occurredAt");

-- CreateIndex
CREATE INDEX "AiOperatorProposalEvent_actorUserId_occurredAt_idx" ON "AiOperatorProposalEvent"("actorUserId", "occurredAt");

-- AddForeignKey
ALTER TABLE "AiOperatorProposal" ADD CONSTRAINT "AiOperatorProposal_proposedByUserId_fkey" FOREIGN KEY ("proposedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiOperatorProposal" ADD CONSTRAINT "AiOperatorProposal_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiOperatorProposalEvent" ADD CONSTRAINT "AiOperatorProposalEvent_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AiOperatorProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiOperatorProposalEvent" ADD CONSTRAINT "AiOperatorProposalEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Proposal decision history is append-only.
CREATE FUNCTION "prevent_ai_operator_proposal_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AI Operator proposal events are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AiOperatorProposalEvent_append_only"
BEFORE UPDATE OR DELETE ON "AiOperatorProposalEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_ai_operator_proposal_event_mutation"();
