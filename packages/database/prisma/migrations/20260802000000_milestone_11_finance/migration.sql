-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'PAST_DUE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('CHARGE', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'MATCHED', 'DISCREPANCY');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "organizationId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "taxRateBasisPoints" INTEGER NOT NULL DEFAULT 0,
    "subtotalMinor" INTEGER NOT NULL,
    "taxMinor" INTEGER NOT NULL,
    "totalMinor" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitAmountMinor" INTEGER NOT NULL,
    "lineTotalMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "PaymentIntentStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD',
    "provider" TEXT NOT NULL,
    "providerReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "type" "PaymentTransactionType" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "providerReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "reason" TEXT,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "providerReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "subtotalMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL,
    "taxMinor" INTEGER NOT NULL,
    "totalMinor" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER,
    "amountOffMinor" INTEGER,
    "currency" CHAR(3),
    "maxRedemptions" INTEGER,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "discountMinor" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,
    "latestInvoiceId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "providerReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRecord" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerReference" TEXT NOT NULL,
    "grossMinor" INTEGER NOT NULL,
    "feeMinor" INTEGER NOT NULL DEFAULT 0,
    "netMinor" INTEGER NOT NULL,
    "ledgerMinor" INTEGER NOT NULL,
    "differenceMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "settledAt" TIMESTAMP(3) NOT NULL,
    "reconciledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceAuditEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateBillingRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "billingContactName" TEXT NOT NULL,
    "billingContactEmail" TEXT NOT NULL,
    "purchaseOrderReference" TEXT,
    "seatCount" INTEGER NOT NULL,
    "pricePerSeatMinor" INTEGER NOT NULL,
    "paymentTermsDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateBillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "Invoice_customerId_status_createdAt_idx" ON "Invoice"("customerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_status_createdAt_idx" ON "Invoice"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentIntent_invoiceId_status_idx" ON "PaymentIntent"("invoiceId", "status");

-- CreateIndex
CREATE INDEX "PaymentIntent_customerId_createdAt_idx" ON "PaymentIntent"("customerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_provider_providerReference_key" ON "PaymentIntent"("provider", "providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "PaymentTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentIntentId_occurredAt_idx" ON "PaymentTransaction"("paymentIntentId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_providerReference_type_key" ON "PaymentTransaction"("providerReference", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_transactionId_key" ON "Refund"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_providerReference_key" ON "Refund"("providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Refund_paymentIntentId_status_idx" ON "Refund"("paymentIntentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "Receipt_customerId_issuedAt_idx" ON "Receipt"("customerId", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentIntentId_key" ON "Receipt"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_code_key" ON "PricingPlan"("code");

-- CreateIndex
CREATE INDEX "PricingPlan_active_billingInterval_idx" ON "PricingPlan"("active", "billingInterval");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_active_expiresAt_idx" ON "Coupon"("active", "expiresAt");

-- CreateIndex
CREATE INDEX "CouponRedemption_customerId_redeemedAt_idx" ON "CouponRedemption"("customerId", "redeemedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_couponId_invoiceId_key" ON "CouponRedemption"("couponId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerReference_key" ON "Subscription"("providerReference");

-- CreateIndex
CREATE INDEX "Subscription_customerId_status_idx" ON "Subscription"("customerId", "status");

-- CreateIndex
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "Subscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "ReconciliationRecord_status_settledAt_idx" ON "ReconciliationRecord"("status", "settledAt");

-- CreateIndex
CREATE INDEX "ReconciliationRecord_paymentIntentId_idx" ON "ReconciliationRecord"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationRecord_provider_providerReference_key" ON "ReconciliationRecord"("provider", "providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceAuditEvent_idempotencyKey_key" ON "FinanceAuditEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "FinanceAuditEvent_entityType_entityId_occurredAt_idx" ON "FinanceAuditEvent"("entityType", "entityId", "occurredAt");

-- CreateIndex
CREATE INDEX "FinanceAuditEvent_actorUserId_occurredAt_idx" ON "FinanceAuditEvent"("actorUserId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateBillingRecord_invoiceId_key" ON "CorporateBillingRecord"("invoiceId");

-- CreateIndex
CREATE INDEX "CorporateBillingRecord_organizationId_createdAt_idx" ON "CorporateBillingRecord"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CorporateBillingRecord_purchaseOrderReference_idx" ON "CorporateBillingRecord"("purchaseOrderReference");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_latestInvoiceId_fkey" FOREIGN KEY ("latestInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRecord" ADD CONSTRAINT "ReconciliationRecord_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceAuditEvent" ADD CONSTRAINT "FinanceAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateBillingRecord" ADD CONSTRAINT "CorporateBillingRecord_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Domain invariants not expressible in Prisma's schema language.
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_amounts_check" CHECK ("discountMinor" >= 0 AND "taxRateBasisPoints" BETWEEN 0 AND 10000 AND "subtotalMinor" >= 0 AND "taxMinor" >= 0 AND "totalMinor" >= 0);
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_amounts_check" CHECK ("quantity" > 0 AND "unitAmountMinor" >= 0 AND "lineTotalMinor" = "quantity" * "unitAmountMinor");
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_amount_check" CHECK ("amountMinor" > 0);
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_amount_check" CHECK (("type" = 'CHARGE' AND "amountMinor" > 0) OR ("type" = 'REFUND' AND "amountMinor" < 0));
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_amount_check" CHECK ("amountMinor" > 0);
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_amounts_check" CHECK ("subtotalMinor" >= 0 AND "discountMinor" >= 0 AND "taxMinor" >= 0 AND "totalMinor" >= 0);
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_amount_check" CHECK ("amountMinor" >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_discount_check" CHECK ((("percentOff" IS NOT NULL)::int + ("amountOffMinor" IS NOT NULL)::int) = 1 AND ("percentOff" IS NULL OR "percentOff" BETWEEN 1 AND 100) AND ("amountOffMinor" IS NULL OR "amountOffMinor" > 0) AND ("maxRedemptions" IS NULL OR "maxRedemptions" > 0) AND "redeemedCount" >= 0);
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_period_check" CHECK ("currentPeriodEnd" > "currentPeriodStart");
ALTER TABLE "ReconciliationRecord" ADD CONSTRAINT "ReconciliationRecord_amounts_check" CHECK ("grossMinor" > 0 AND "feeMinor" >= 0 AND "netMinor" = "grossMinor" - "feeMinor" AND "differenceMinor" = "ledgerMinor" - "netMinor");
ALTER TABLE "CorporateBillingRecord" ADD CONSTRAINT "CorporateBillingRecord_terms_check" CHECK ("seatCount" > 0 AND "pricePerSeatMinor" >= 0 AND "paymentTermsDays" BETWEEN 0 AND 365);

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_finance_manage', 'finance:manage', 'Manage invoices, payments, pricing, and subscriptions'),
  ('permission_finance_refund', 'finance:refund', 'Issue refunds'),
  ('permission_finance_reconcile', 'finance:reconcile', 'Reconcile payment settlements')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" IN ('finance:manage', 'finance:refund', 'finance:reconcile')
ON CONFLICT DO NOTHING;
