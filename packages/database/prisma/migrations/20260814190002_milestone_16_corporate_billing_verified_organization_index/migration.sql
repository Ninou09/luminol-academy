-- Build the verified corporate billing organization index without blocking production writes.
CREATE INDEX CONCURRENTLY "CorporateBillingRecord_organizationRecordId_createdAt_idx"
ON "CorporateBillingRecord"("organizationRecordId", "createdAt");
