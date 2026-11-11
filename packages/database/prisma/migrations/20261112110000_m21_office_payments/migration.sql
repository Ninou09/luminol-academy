-- Milestone 21 Slice C: office (manual) payments ledger in DZD.
-- Rows are immutable once recorded except for a single governed void.

CREATE TYPE "OfficePaymentMethod" AS ENUM ('CASH', 'BARIDIMOB', 'CCP', 'BANK_TRANSFER');
CREATE TYPE "OfficePaymentPurpose" AS ENUM ('CONSULTATION', 'PROGRAMME', 'OTHER');
CREATE TYPE "OfficePaymentStatus" AS ENUM ('RECORDED', 'VOIDED');
CREATE TYPE "OfficePaymentEventType" AS ENUM ('RECORDED', 'VOIDED');

CREATE SEQUENCE "OfficePaymentReceiptSequence" AS BIGINT START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE TABLE "OfficePayment" (
  "id" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "payerName" TEXT NOT NULL,
  "clientId" TEXT,
  "appointmentId" TEXT,
  "purpose" "OfficePaymentPurpose" NOT NULL,
  "description" TEXT NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'DZD',
  "method" "OfficePaymentMethod" NOT NULL,
  "externalReference" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL,
  "status" "OfficePaymentStatus" NOT NULL DEFAULT 'RECORDED',
  "recordedByUserId" TEXT NOT NULL,
  "voidedByUserId" TEXT,
  "voidedAt" TIMESTAMP(3),
  "voidReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficePayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OfficePayment_amount_positive" CHECK ("amountMinor" > 0),
  CONSTRAINT "OfficePayment_void_fields" CHECK (
    ("status" = 'RECORDED' AND "voidedByUserId" IS NULL AND "voidedAt" IS NULL AND "voidReason" IS NULL)
    OR ("status" = 'VOIDED' AND "voidedByUserId" IS NOT NULL AND "voidedAt" IS NOT NULL AND "voidReason" IS NOT NULL)
  )
);

CREATE TABLE "OfficePaymentEvent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "eventType" "OfficePaymentEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "reason" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficePaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfficePayment_receiptNumber_key" ON "OfficePayment"("receiptNumber");
CREATE INDEX "OfficePayment_receivedAt_idx" ON "OfficePayment"("receivedAt");
CREATE INDEX "OfficePayment_status_receivedAt_idx" ON "OfficePayment"("status", "receivedAt");
CREATE INDEX "OfficePayment_clientId_receivedAt_idx" ON "OfficePayment"("clientId", "receivedAt");
CREATE INDEX "OfficePayment_appointmentId_idx" ON "OfficePayment"("appointmentId");
CREATE INDEX "OfficePayment_recordedByUserId_receivedAt_idx" ON "OfficePayment"("recordedByUserId", "receivedAt");
CREATE INDEX "OfficePaymentEvent_paymentId_occurredAt_idx" ON "OfficePaymentEvent"("paymentId", "occurredAt");
CREATE INDEX "OfficePaymentEvent_actorUserId_occurredAt_idx" ON "OfficePaymentEvent"("actorUserId", "occurredAt");

ALTER TABLE "OfficePayment" ADD CONSTRAINT "OfficePayment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfficePayment" ADD CONSTRAINT "OfficePayment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "ConsultationAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfficePayment" ADD CONSTRAINT "OfficePayment_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfficePayment" ADD CONSTRAINT "OfficePayment_voidedByUserId_fkey" FOREIGN KEY ("voidedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfficePaymentEvent" ADD CONSTRAINT "OfficePaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "OfficePayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfficePaymentEvent" ADD CONSTRAINT "OfficePaymentEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "guard_office_payment_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Office payments cannot be deleted; void them instead';
  END IF;

  IF OLD."status" <> 'RECORDED' OR NEW."status" <> 'VOIDED' THEN
    RAISE EXCEPTION 'Office payments can only change by being voided once';
  END IF;

  IF NEW."receiptNumber" IS DISTINCT FROM OLD."receiptNumber"
    OR NEW."payerName" IS DISTINCT FROM OLD."payerName"
    OR NEW."clientId" IS DISTINCT FROM OLD."clientId"
    OR NEW."appointmentId" IS DISTINCT FROM OLD."appointmentId"
    OR NEW."purpose" IS DISTINCT FROM OLD."purpose"
    OR NEW."description" IS DISTINCT FROM OLD."description"
    OR NEW."amountMinor" IS DISTINCT FROM OLD."amountMinor"
    OR NEW."currency" IS DISTINCT FROM OLD."currency"
    OR NEW."method" IS DISTINCT FROM OLD."method"
    OR NEW."externalReference" IS DISTINCT FROM OLD."externalReference"
    OR NEW."receivedAt" IS DISTINCT FROM OLD."receivedAt"
    OR NEW."recordedByUserId" IS DISTINCT FROM OLD."recordedByUserId"
    OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt" THEN
    RAISE EXCEPTION 'Recorded office payment details are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "OfficePayment_guard_update"
BEFORE UPDATE ON "OfficePayment"
FOR EACH ROW EXECUTE FUNCTION "guard_office_payment_mutation"();

CREATE TRIGGER "OfficePayment_guard_delete"
BEFORE DELETE ON "OfficePayment"
FOR EACH ROW EXECUTE FUNCTION "guard_office_payment_mutation"();

CREATE OR REPLACE FUNCTION "prevent_office_payment_event_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Office payment history is append-only';
END;
$$;

CREATE TRIGGER "OfficePaymentEvent_append_only_update"
BEFORE UPDATE ON "OfficePaymentEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_office_payment_event_mutation"();

CREATE TRIGGER "OfficePaymentEvent_append_only_delete"
BEFORE DELETE ON "OfficePaymentEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_office_payment_event_mutation"();

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_office_payment_record', 'office-payment:record', 'Record manual office payments (cash, BaridiMob, CCP, bank transfer)'),
  ('permission_office_payment_void', 'office-payment:void', 'Void a recorded office payment with a reason')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" IN ('office-payment:record', 'office-payment:void')
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM "Role", "Permission"
WHERE "Role"."key" = 'consultant' AND "Permission"."key" = 'office-payment:record'
ON CONFLICT DO NOTHING;
