-- Build the verified invoice organization index without blocking production writes.
CREATE INDEX CONCURRENTLY "Invoice_organizationRecordId_status_createdAt_idx"
ON "Invoice"("organizationRecordId", "status", "createdAt");
