-- Build the verified notification-event organization index without blocking production writes.
CREATE INDEX CONCURRENTLY "NotificationEvent_organizationRecordId_recipientId_createdAt_idx"
ON "NotificationEvent"("organizationRecordId", "recipientId", "createdAt");
