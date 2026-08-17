CREATE TABLE "CohortDeliveryAuditEvent" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "cohortId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CohortDeliveryAuditEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CohortDeliveryAuditEvent_cohortId_fkey"
    FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CohortDeliveryAuditEvent_actorUserId_fkey"
    FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "CohortDeliveryAuditEvent_cohortId_occurredAt_idx"
  ON "CohortDeliveryAuditEvent"("cohortId", "occurredAt");
CREATE INDEX "CohortDeliveryAuditEvent_actorUserId_occurredAt_idx"
  ON "CohortDeliveryAuditEvent"("actorUserId", "occurredAt");
CREATE INDEX "CohortDeliveryAuditEvent_subjectType_subjectId_occurredAt_idx"
  ON "CohortDeliveryAuditEvent"("subjectType", "subjectId", "occurredAt");

CREATE FUNCTION "prevent_cohort_delivery_audit_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Cohort delivery audit history is immutable';
END;
$$;

CREATE TRIGGER "CohortDeliveryAuditEvent_immutable"
BEFORE UPDATE OR DELETE ON "CohortDeliveryAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_delivery_audit_mutation"();
