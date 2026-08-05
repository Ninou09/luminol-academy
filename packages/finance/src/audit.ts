import { z } from 'zod';

export const financeAuditEntitySchema = z.enum([
  'invoice',
  'payment_intent',
  'refund',
  'pricing_plan',
  'coupon',
  'installment_schedule',
  'corporate_invoice',
]);

export type FinanceAuditEntity = z.infer<typeof financeAuditEntitySchema>;

export const financeAuditActionSchema = z.enum([
  'created',
  'updated',
  'status_changed',
  'payment_requested',
  'payment_succeeded',
  'payment_failed',
  'refund_requested',
  'refund_succeeded',
  'refund_failed',
  'reconciled',
  'voided',
]);

export type FinanceAuditAction = z.infer<typeof financeAuditActionSchema>;

const safeMetadataValueSchema = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const financeAuditEventSchema = z.object({
  id: z.string().min(1),
  entityType: financeAuditEntitySchema,
  entityId: z.string().min(1),
  action: financeAuditActionSchema,
  actorUserId: z.string().min(1).optional(),
  occurredAt: z.coerce.date(),
  idempotencyKey: z.string().min(1).optional(),
  metadata: z
    .record(z.string().min(1).max(100), safeMetadataValueSchema)
    .default({}),
});

export type FinanceAuditEvent = z.infer<typeof financeAuditEventSchema>;

export interface CreateFinanceAuditEventInput {
  id: string;
  entityType: FinanceAuditEntity;
  entityId: string;
  action: FinanceAuditAction;
  actorUserId?: string;
  occurredAt?: Date;
  idempotencyKey?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export function createFinanceAuditEvent(
  input: CreateFinanceAuditEventInput,
): FinanceAuditEvent {
  return financeAuditEventSchema.parse({
    ...input,
    occurredAt: input.occurredAt ?? new Date(),
    metadata: input.metadata ?? {},
  });
}

export function redactFinanceAuditMetadata(
  metadata: Record<string, unknown>,
  blockedKeys: readonly string[] = [
    'cardNumber',
    'cvc',
    'cvv',
    'password',
    'secret',
    'token',
    'authorization',
  ],
): Record<string, string | number | boolean | null> {
  const blocked = new Set(blockedKeys.map((key) => key.toLowerCase()));

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !blocked.has(key.toLowerCase()))
      .flatMap(([key, value]) => {
        const parsed = safeMetadataValueSchema.safeParse(value);
        return parsed.success ? [[key, parsed.data] as const] : [];
      }),
  );
}
