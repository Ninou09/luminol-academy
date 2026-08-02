import 'server-only';

import {
  db,
  InvoiceStatus as DbInvoiceStatus,
  SubscriptionStatus as DbSubscriptionStatus,
  type Prisma,
} from '@luminol/database';
import { z } from 'zod';

import { requireFinancePermission, type FinanceActor } from './access';

import {
  calculateInvoiceTotals,
  canTransitionInvoiceStatus,
  invoiceStatusSchema,
} from './index';
import { canTransitionSubscriptionStatus } from './subscriptions';
import { currencyCodeSchema } from './currency';

const lineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().positive().max(10_000),
  unitAmountMinor: z.number().int().nonnegative().max(2_000_000_000),
});

export const createInvoiceInputSchema = z.object({
  number: z.string().trim().min(1).max(100),
  customerId: z.string().min(1),
  organizationId: z.string().min(1).optional(),
  currency: currencyCodeSchema,
  lines: z.array(lineSchema).min(1).max(100),
  discountMinor: z.number().int().nonnegative().default(0),
  taxRateBasisPoints: z.number().int().min(0).max(10_000).default(0),
  dueAt: z.coerce.date().optional(),
});
export type CreateInvoiceInput = z.input<typeof createInvoiceInputSchema>;

async function writeAudit(
  transaction: Prisma.TransactionClient,
  actorUserId: string,
  entityType: string,
  entityId: string,
  action: string,
  metadata: Prisma.InputJsonObject = {},
  idempotencyKey?: string,
) {
  await transaction.financeAuditEvent.create({
    data: {
      actorUserId,
      entityType,
      entityId,
      action,
      metadata,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    },
  });
}

export async function createInvoice(
  actorInput: FinanceActor,
  input: CreateInvoiceInput,
) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const parsed = createInvoiceInputSchema.parse(input);
  const domainInvoice = {
    id: 'pending',
    customerId: parsed.customerId,
    currency: parsed.currency,
    status: 'draft' as const,
    lines: parsed.lines.map((line, index) => ({
      id: String(index),
      description: line.description,
      quantity: line.quantity,
      unitPriceMinor: line.unitAmountMinor,
    })),
    discountMinor: parsed.discountMinor,
    taxRateBasisPoints: parsed.taxRateBasisPoints,
  };
  const totals = calculateInvoiceTotals(domainInvoice);

  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const customer = await transaction.user.findFirst({
      where: { id: parsed.customerId, deletedAt: null },
      select: { id: true },
    });
    if (!customer) throw new Error('Invoice customer not found');
    const invoice = await transaction.invoice.create({
      data: {
        number: parsed.number,
        customerId: customer.id,
        ...(parsed.organizationId
          ? { organizationId: parsed.organizationId }
          : {}),
        currency: parsed.currency,
        discountMinor: totals.discountMinor,
        taxRateBasisPoints: parsed.taxRateBasisPoints,
        subtotalMinor: totals.subtotalMinor,
        taxMinor: totals.taxMinor,
        totalMinor: totals.totalMinor,
        ...(parsed.dueAt ? { dueAt: parsed.dueAt } : {}),
        lines: {
          create: parsed.lines.map((line) => ({
            ...line,
            lineTotalMinor: line.quantity * line.unitAmountMinor,
          })),
        },
      },
      include: { lines: true },
    });
    await writeAudit(
      transaction,
      actor.userId,
      'invoice',
      invoice.id,
      'created',
      {
        number: invoice.number,
        totalMinor: invoice.totalMinor,
        currency: invoice.currency,
      },
    );
    return invoice;
  });
}

export const transitionInvoiceInputSchema = z.object({
  invoiceId: z.string().min(1),
  toStatus: invoiceStatusSchema,
});
export async function transitionInvoice(
  actorInput: FinanceActor,
  input: unknown,
) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const parsed = transitionInvoiceInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const current = await transaction.invoice.findUnique({
      where: { id: parsed.invoiceId },
    });
    if (!current) throw new Error('Invoice not found');
    const from = invoiceStatusSchema.parse(current.status.toLowerCase());
    if (!canTransitionInvoiceStatus(from, parsed.toStatus))
      throw new Error('Invalid invoice status transition');
    const status =
      DbInvoiceStatus[
        parsed.toStatus.toUpperCase() as keyof typeof DbInvoiceStatus
      ];
    const updated = await transaction.invoice.updateMany({
      where: { id: current.id, status: current.status },
      data: {
        status,
        ...(parsed.toStatus === 'paid' ? { paidAt: new Date() } : {}),
        ...(parsed.toStatus === 'void' ? { voidedAt: new Date() } : {}),
      },
    });
    if (updated.count !== 1)
      throw new Error('Invoice was updated concurrently');
    await writeAudit(
      transaction,
      actor.userId,
      'invoice',
      current.id,
      'status_changed',
      { from, to: parsed.toStatus },
    );
    return transaction.invoice.findUniqueOrThrow({ where: { id: current.id } });
  });
}

export const recordPaymentInputSchema = z.object({
  invoiceId: z.string().min(1),
  provider: z.string().trim().min(1).max(100),
  providerReference: z.string().trim().min(1).max(255),
  idempotencyKey: z.string().min(8).max(255),
  amountMinor: z.number().int().positive(),
  currency: currencyCodeSchema,
  occurredAt: z.coerce.date().optional(),
});
export async function recordPayment(actorInput: FinanceActor, input: unknown) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const parsed = recordPaymentInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const existing = await transaction.paymentIntent.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
    });
    if (existing) return existing;
    const invoice = await transaction.invoice.findUnique({
      where: { id: parsed.invoiceId },
    });
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.currency !== parsed.currency)
      throw new Error('Payment currency must match invoice currency');
    if (invoice.status !== 'OPEN' && invoice.status !== 'PAST_DUE')
      throw new Error('Invoice is not payable');
    const paid = await transaction.paymentIntent.aggregate({
      where: { invoiceId: invoice.id, status: 'SUCCEEDED' },
      _sum: { amountMinor: true },
    });
    if (parsed.amountMinor > invoice.totalMinor - (paid._sum.amountMinor ?? 0))
      throw new Error('Payment exceeds invoice balance');
    const payment = await transaction.paymentIntent.create({
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amountMinor: parsed.amountMinor,
        currency: parsed.currency,
        status: 'SUCCEEDED',
        provider: parsed.provider,
        providerReference: parsed.providerReference,
        idempotencyKey: parsed.idempotencyKey,
        transactions: {
          create: {
            type: 'CHARGE',
            status: 'SUCCEEDED',
            amountMinor: parsed.amountMinor,
            currency: parsed.currency,
            providerReference: parsed.providerReference,
            idempotencyKey: `${parsed.idempotencyKey}:charge`,
            ...(parsed.occurredAt ? { occurredAt: parsed.occurredAt } : {}),
          },
        },
      },
    });
    const newPaid = (paid._sum.amountMinor ?? 0) + parsed.amountMinor;
    if (newPaid === invoice.totalMinor)
      await transaction.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID', paidAt: parsed.occurredAt ?? new Date() },
      });
    await writeAudit(
      transaction,
      actor.userId,
      'payment_intent',
      payment.id,
      'payment_succeeded',
      {
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        provider: payment.provider,
      },
      parsed.idempotencyKey,
    );
    return payment;
  });
}

export const refundPaymentInputSchema = z.object({
  paymentIntentId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  reason: z.string().trim().min(1).max(500),
  idempotencyKey: z.string().min(8).max(255),
  providerReference: z.string().trim().min(1).max(255),
});
export async function refundPayment(actorInput: FinanceActor, input: unknown) {
  const actor = requireFinancePermission(actorInput, 'finance:refund');
  const parsed = refundPaymentInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const existing = await transaction.refund.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
    });
    if (existing) return existing;
    const payment = await transaction.paymentIntent.findUnique({
      where: { id: parsed.paymentIntentId },
      include: { refunds: true },
    });
    if (
      !payment ||
      !['SUCCEEDED', 'PARTIALLY_REFUNDED'].includes(payment.status)
    )
      throw new Error('Payment cannot be refunded');
    const refundedMinor = payment.refunds
      .filter((refund) => refund.status === 'SUCCEEDED')
      .reduce((sum, refund) => sum + refund.amountMinor, 0);
    if (parsed.amountMinor > payment.amountMinor - refundedMinor)
      throw new Error('Refund exceeds refundable payment balance');
    const transactionRecord = await transaction.paymentTransaction.create({
      data: {
        paymentIntentId: payment.id,
        type: 'REFUND',
        status: 'SUCCEEDED',
        amountMinor: -parsed.amountMinor,
        currency: payment.currency,
        providerReference: parsed.providerReference,
        idempotencyKey: `${parsed.idempotencyKey}:refund`,
      },
    });
    const refund = await transaction.refund.create({
      data: {
        paymentIntentId: payment.id,
        transactionId: transactionRecord.id,
        amountMinor: parsed.amountMinor,
        currency: payment.currency,
        reason: parsed.reason,
        status: 'SUCCEEDED',
        providerReference: parsed.providerReference,
        idempotencyKey: parsed.idempotencyKey,
      },
    });
    const fullyRefunded =
      refundedMinor + parsed.amountMinor === payment.amountMinor;
    await transaction.paymentIntent.update({
      where: { id: payment.id },
      data: { status: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
    });
    if (fullyRefunded)
      await transaction.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'REFUNDED' },
      });
    await writeAudit(
      transaction,
      actor.userId,
      'refund',
      refund.id,
      'refund_succeeded',
      { amountMinor: refund.amountMinor, currency: refund.currency },
      parsed.idempotencyKey,
    );
    return refund;
  });
}

export const redeemCouponInputSchema = z.object({
  couponCode: z.string().trim().min(1),
  invoiceId: z.string().min(1),
});
export async function redeemCoupon(actorInput: FinanceActor, input: unknown) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const parsed = redeemCouponInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const [coupon, invoice] = await Promise.all([
      transaction.coupon.findUnique({
        where: { code: parsed.couponCode.toUpperCase() },
      }),
      transaction.invoice.findUnique({ where: { id: parsed.invoiceId } }),
    ]);
    if (
      !coupon ||
      !coupon.active ||
      (coupon.expiresAt && coupon.expiresAt <= new Date())
    )
      throw new Error('Coupon is not redeemable');
    if (!invoice || invoice.status !== 'DRAFT')
      throw new Error('Coupon requires a draft invoice');
    if (
      coupon.maxRedemptions !== null &&
      coupon.redeemedCount >= coupon.maxRedemptions
    )
      throw new Error('Coupon redemption limit reached');
    if (coupon.currency && coupon.currency !== invoice.currency)
      throw new Error('Coupon currency must match invoice currency');
    const discountMinor = Math.min(
      invoice.subtotalMinor,
      coupon.percentOff !== null
        ? Math.round((invoice.subtotalMinor * coupon.percentOff) / 100)
        : (coupon.amountOffMinor ?? 0),
    );
    const taxableMinor = invoice.subtotalMinor - discountMinor;
    const taxMinor = Math.round(
      (taxableMinor * invoice.taxRateBasisPoints) / 10_000,
    );
    await transaction.coupon.update({
      where: { id: coupon.id },
      data: { redeemedCount: { increment: 1 } },
    });
    await transaction.couponRedemption.create({
      data: {
        couponId: coupon.id,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        discountMinor,
      },
    });
    const updated = await transaction.invoice.update({
      where: { id: invoice.id },
      data: { discountMinor, taxMinor, totalMinor: taxableMinor + taxMinor },
    });
    await writeAudit(
      transaction,
      actor.userId,
      'coupon',
      coupon.id,
      'updated',
      { invoiceId: invoice.id, discountMinor },
    );
    return updated;
  });
}

export const manageSubscriptionInputSchema = z.object({
  subscriptionId: z.string().min(1),
  toStatus: z.enum([
    'trialing',
    'active',
    'past_due',
    'paused',
    'cancelled',
    'expired',
  ]),
});
export async function transitionSubscription(
  actorInput: FinanceActor,
  input: unknown,
) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const parsed = manageSubscriptionInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const subscription = await transaction.subscription.findUnique({
      where: { id: parsed.subscriptionId },
    });
    if (!subscription) throw new Error('Subscription not found');
    const from = subscription.status.toLowerCase() as z.infer<
      typeof manageSubscriptionInputSchema
    >['toStatus'];
    if (!canTransitionSubscriptionStatus(from, parsed.toStatus))
      throw new Error('Invalid subscription status transition');
    const status =
      DbSubscriptionStatus[
        parsed.toStatus.toUpperCase() as keyof typeof DbSubscriptionStatus
      ];
    const updated = await transaction.subscription.update({
      where: { id: subscription.id },
      data: {
        status,
        ...(parsed.toStatus === 'cancelled' ? { cancelledAt: new Date() } : {}),
      },
    });
    await writeAudit(
      transaction,
      actor.userId,
      'subscription',
      updated.id,
      'status_changed',
      { from, to: parsed.toStatus },
    );
    return updated;
  });
}

export async function issueReceipt(
  actorInput: FinanceActor,
  paymentIntentId: string,
  receiptNumber: string,
) {
  const actor = requireFinancePermission(actorInput, 'finance:manage');
  const input = z
    .object({
      paymentIntentId: z.string().min(1),
      receiptNumber: z.string().trim().min(1).max(100),
    })
    .parse({ paymentIntentId, receiptNumber });
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const existing = await transaction.receipt.findUnique({
      where: { paymentIntentId: input.paymentIntentId },
    });
    if (existing) return existing;
    const payment = await transaction.paymentIntent.findUnique({
      where: { id: input.paymentIntentId },
      include: { invoice: true },
    });
    if (!payment || payment.status !== 'SUCCEEDED')
      throw new Error('Receipt requires a successful payment');
    const receipt = await transaction.receipt.create({
      data: {
        receiptNumber: input.receiptNumber,
        invoiceId: payment.invoiceId,
        paymentIntentId: payment.id,
        customerId: payment.customerId,
        currency: payment.currency,
        subtotalMinor: payment.invoice.subtotalMinor,
        discountMinor: payment.invoice.discountMinor,
        taxMinor: payment.invoice.taxMinor,
        totalMinor: payment.amountMinor,
      },
    });
    await writeAudit(
      transaction,
      actor.userId,
      'receipt',
      receipt.id,
      'created',
      { receiptNumber: receipt.receiptNumber },
    );
    return receipt;
  });
}

export const reconcilePaymentInputSchema = z.object({
  paymentIntentId: z.string().min(1),
  provider: z.string().min(1),
  providerReference: z.string().min(1),
  grossMinor: z.number().int().positive(),
  feeMinor: z.number().int().nonnegative().default(0),
  currency: currencyCodeSchema,
  settledAt: z.coerce.date(),
});
export async function reconcilePayment(
  actorInput: FinanceActor,
  input: unknown,
) {
  const actor = requireFinancePermission(actorInput, 'finance:reconcile');
  const parsed = reconcilePaymentInputSchema.parse(input);
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const existing = await transaction.reconciliationRecord.findUnique({
      where: {
        provider_providerReference: {
          provider: parsed.provider,
          providerReference: parsed.providerReference,
        },
      },
    });
    if (existing) return existing;
    const payment = await transaction.paymentIntent.findUnique({
      where: { id: parsed.paymentIntentId },
    });
    if (!payment) throw new Error('Payment not found');
    if (payment.currency !== parsed.currency)
      throw new Error('Settlement currency must match payment currency');
    const netMinor = parsed.grossMinor - parsed.feeMinor;
    const differenceMinor = payment.amountMinor - netMinor;
    const record = await transaction.reconciliationRecord.create({
      data: {
        ...parsed,
        netMinor,
        ledgerMinor: payment.amountMinor,
        differenceMinor,
        status: differenceMinor === 0 ? 'MATCHED' : 'DISCREPANCY',
        reconciledAt: new Date(),
      },
    });
    await writeAudit(
      transaction,
      actor.userId,
      'reconciliation',
      record.id,
      'reconciled',
      { differenceMinor, currency: record.currency },
    );
    return record;
  });
}

export async function getCustomerFinanceSummary(customerIdInput: string) {
  const customerId = z.string().min(1).parse(customerIdInput);
  const [invoices, payments, receipts, subscriptions] = await Promise.all([
    db.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    }),
    db.paymentIntent.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    }),
    db.receipt.findMany({
      where: { customerId },
      orderBy: { issuedAt: 'desc' },
    }),
    db.subscription.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { pricingPlan: true },
    }),
  ]);
  return { invoices, payments, receipts, subscriptions };
}
