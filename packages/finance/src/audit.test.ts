import { describe, expect, it } from 'vitest';

import {
  createFinanceAuditEvent,
  financeAuditEventSchema,
  redactFinanceAuditMetadata,
} from './audit';

describe('finance audit events', () => {
  it('creates a validated audit event with safe metadata', () => {
    const occurredAt = new Date('2026-07-27T10:00:00.000Z');
    const event = createFinanceAuditEvent({
      id: 'audit_1',
      entityType: 'payment_intent',
      entityId: 'pi_1',
      action: 'payment_succeeded',
      actorUserId: 'user_1',
      occurredAt,
      idempotencyKey: 'invoice-inv_1-attempt-1',
      metadata: {
        provider: 'test-provider',
        amountMinor: 25_000,
        liveMode: false,
      },
    });

    expect(event.occurredAt).toEqual(occurredAt);
    expect(event.metadata).toEqual({
      provider: 'test-provider',
      amountMinor: 25_000,
      liveMode: false,
    });
  });

  it('redacts sensitive keys and unsupported metadata values', () => {
    expect(
      redactFinanceAuditMetadata({
        provider: 'test-provider',
        amountMinor: 5_000,
        token: 'must-not-be-recorded',
        cardNumber: '4242424242424242',
        nested: { unsafe: true },
      }),
    ).toEqual({
      provider: 'test-provider',
      amountMinor: 5_000,
    });
  });

  it('rejects unbounded or nested audit metadata', () => {
    expect(() =>
      financeAuditEventSchema.parse({
        id: 'audit_2',
        entityType: 'refund',
        entityId: 'refund_1',
        action: 'refund_succeeded',
        occurredAt: new Date(),
        metadata: { providerPayload: { raw: true } },
      }),
    ).toThrow();
  });
});
