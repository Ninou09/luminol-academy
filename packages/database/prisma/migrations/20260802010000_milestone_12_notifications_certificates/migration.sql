CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');
CREATE TYPE "NotificationCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'RETRY_SCHEDULED', 'DEAD_LETTER', 'CANCELLED');
CREATE TYPE "NotificationAttemptStatus" AS ENUM ('SUCCEEDED', 'FAILED');
CREATE TYPE "CertificateStatus" AS ENUM ('ACTIVE', 'REVOKED', 'SUPERSEDED');

ALTER TABLE "Certificate" ADD COLUMN "serialNumber" TEXT;
ALTER TABLE "Certificate" ADD COLUMN "completionId" TEXT;
ALTER TABLE "Certificate" ADD COLUMN "status" "CertificateStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Certificate" ADD COLUMN "recipientNameSnapshot" TEXT;
ALTER TABLE "Certificate" ADD COLUMN "courseTitleSnapshot" TEXT;
ALTER TABLE "Certificate" ADD COLUMN "issuerNameSnapshot" TEXT NOT NULL DEFAULT 'Luminol Academy';
ALTER TABLE "Certificate" ADD COLUMN "snapshot" JSONB;
ALTER TABLE "Certificate" ADD COLUMN "replacedById" TEXT;
UPDATE "Certificate" SET "serialNumber" = 'LUM-LEGACY-' || UPPER(SUBSTRING(MD5("id"), 1, 12)), "recipientNameSnapshot" = "recipientName";
ALTER TABLE "Certificate" ALTER COLUMN "serialNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Certificate_serialNumber_key" ON "Certificate"("serialNumber");
CREATE UNIQUE INDEX "Certificate_completionId_key" ON "Certificate"("completionId");
CREATE UNIQUE INDEX "Certificate_replacedById_key" ON "Certificate"("replacedById");
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "NotificationPreference" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "organizationId" TEXT, "channel" "NotificationChannel" NOT NULL, "category" "NotificationCategory" NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT true, "timeZone" TEXT NOT NULL DEFAULT 'UTC', "quietStartMinutes" INTEGER, "quietEndMinutes" INTEGER, "consentedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "NotificationPreference_scope_channel_category_key" ON "NotificationPreference"("userId", COALESCE("organizationId", ''), "channel", "category");
CREATE INDEX "NotificationPreference_organizationId_userId_idx" ON "NotificationPreference"("organizationId", "userId");
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NotificationEvent" ("id" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "organizationId" TEXT, "recipientId" TEXT NOT NULL, "templateKey" TEXT NOT NULL, "category" "NotificationCategory" NOT NULL, "payload" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "NotificationEvent_idempotencyKey_key" ON "NotificationEvent"("idempotencyKey");
CREATE INDEX "NotificationEvent_organizationId_recipientId_createdAt_idx" ON "NotificationEvent"("organizationId", "recipientId", "createdAt");
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Notification" ("id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "recipientId" TEXT NOT NULL, "organizationId" TEXT, "channel" "NotificationChannel" NOT NULL, "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING', "title" TEXT NOT NULL, "preview" TEXT NOT NULL, "body" TEXT NOT NULL, "provider" TEXT, "providerReference" TEXT, "attemptCount" INTEGER NOT NULL DEFAULT 0, "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deliveredAt" TIMESTAMP(3), "readAt" TIMESTAMP(3), "lastErrorCode" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Notification_eventId_channel_key" ON "Notification"("eventId", "channel");
CREATE UNIQUE INDEX "Notification_provider_providerReference_key" ON "Notification"("provider", "providerReference");
CREATE INDEX "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");
CREATE INDEX "Notification_status_scheduledAt_idx" ON "Notification"("status", "scheduledAt");
CREATE INDEX "Notification_organizationId_status_scheduledAt_idx" ON "Notification"("organizationId", "status", "scheduledAt");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NotificationEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NotificationDeliveryAttempt" ("id" TEXT NOT NULL, "notificationId" TEXT NOT NULL, "attemptNumber" INTEGER NOT NULL, "status" "NotificationAttemptStatus" NOT NULL, "providerReference" TEXT, "errorCode" TEXT, "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "NotificationDeliveryAttempt_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "NotificationDeliveryAttempt_notificationId_attemptNumber_key" ON "NotificationDeliveryAttempt"("notificationId", "attemptNumber");
CREATE INDEX "NotificationDeliveryAttempt_status_attemptedAt_idx" ON "NotificationDeliveryAttempt"("status", "attemptedAt");
ALTER TABLE "NotificationDeliveryAttempt" ADD CONSTRAINT "NotificationDeliveryAttempt_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NotificationAuditEvent" ("id" TEXT NOT NULL, "notificationId" TEXT NOT NULL, "action" TEXT NOT NULL, "metadata" JSONB NOT NULL, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "NotificationAuditEvent_pkey" PRIMARY KEY ("id"));
CREATE INDEX "NotificationAuditEvent_notificationId_occurredAt_idx" ON "NotificationAuditEvent"("notificationId", "occurredAt");
ALTER TABLE "NotificationAuditEvent" ADD CONSTRAINT "NotificationAuditEvent_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CertificateRevocation" ("id" TEXT NOT NULL, "certificateId" TEXT NOT NULL, "actorUserId" TEXT NOT NULL, "reasonCode" TEXT NOT NULL, "reason" TEXT, "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CertificateRevocation_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "CertificateRevocation_certificateId_key" ON "CertificateRevocation"("certificateId");
ALTER TABLE "CertificateRevocation" ADD CONSTRAINT "CertificateRevocation_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CertificateRevocation" ADD CONSTRAINT "CertificateRevocation_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "CertificateAuditEvent" ("id" TEXT NOT NULL, "certificateId" TEXT NOT NULL, "actorUserId" TEXT, "action" TEXT NOT NULL, "metadata" JSONB NOT NULL, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CertificateAuditEvent_pkey" PRIMARY KEY ("id"));
CREATE INDEX "CertificateAuditEvent_certificateId_occurredAt_idx" ON "CertificateAuditEvent"("certificateId", "occurredAt");
CREATE INDEX "CertificateAuditEvent_actorUserId_occurredAt_idx" ON "CertificateAuditEvent"("actorUserId", "occurredAt");
ALTER TABLE "CertificateAuditEvent" ADD CONSTRAINT "CertificateAuditEvent_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CertificateAuditEvent" ADD CONSTRAINT "CertificateAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_quiet_minutes_check" CHECK (("quietStartMinutes" IS NULL AND "quietEndMinutes" IS NULL) OR ("quietStartMinutes" BETWEEN 0 AND 1439 AND "quietEndMinutes" BETWEEN 0 AND 1439));
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_attempt_count_check" CHECK ("attemptCount" BETWEEN 0 AND 5);
INSERT INTO "Permission" ("id", "key", "description") VALUES
 ('permission_certificate_revoke', 'certificate:revoke', 'Revoke and replace certificates'),
 ('permission_certificate_audit_read', 'certificate:audit:read', 'View certificate audit history'),
 ('permission_notification_manage', 'notification:manage', 'Manage notification delivery'),
 ('permission_notification_failures_read', 'notification:failures:read', 'View notification delivery failures')
ON CONFLICT ("key") DO NOTHING;
INSERT INTO "RolePermission" ("roleId", "permissionId") SELECT 'role_admin', "id" FROM "Permission" WHERE "key" IN ('certificate:revoke', 'certificate:audit:read', 'notification:manage', 'notification:failures:read') ON CONFLICT DO NOTHING;
