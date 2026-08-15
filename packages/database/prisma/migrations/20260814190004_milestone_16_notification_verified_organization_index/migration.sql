-- Build the verified notification organization index without blocking production writes.
CREATE INDEX CONCURRENTLY "Notification_organizationRecordId_status_scheduledAt_idx"
ON "Notification"("organizationRecordId", "status", "scheduledAt");
