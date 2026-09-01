-- Extend proposal decision state into controlled execution.
ALTER TYPE "AiOperatorProposalStatus" ADD VALUE 'EXECUTED';
ALTER TYPE "AiOperatorProposalEventType" ADD VALUE 'EXECUTED';

ALTER TABLE "AiOperatorProposal"
  ADD COLUMN "executedByUserId" TEXT,
  ADD COLUMN "executedAt" TIMESTAMP(3);

CREATE INDEX "AiOperatorProposal_executedByUserId_executedAt_idx"
  ON "AiOperatorProposal"("executedByUserId", "executedAt");

ALTER TABLE "AiOperatorProposal"
  ADD CONSTRAINT "AiOperatorProposal_executedByUserId_fkey"
  FOREIGN KEY ("executedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
