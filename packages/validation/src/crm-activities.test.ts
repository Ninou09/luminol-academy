import { describe, expect, it } from 'vitest';

import { checkCrmActivity, crmActivitySummarySchema } from './crm-activities';

describe('CRM activity rules', () => {
  it('always allows notes and inbound conversations', () => {
    expect(
      checkCrmActivity({
        type: 'NOTE',
        direction: null,
        contactConsent: false,
      }),
    ).toBeNull();
    expect(
      checkCrmActivity({
        type: 'CALL',
        direction: 'INBOUND',
        contactConsent: false,
      }),
    ).toBeNull();
  });

  it('refuses outbound contact without consent', () => {
    expect(
      checkCrmActivity({
        type: 'WHATSAPP',
        direction: 'OUTBOUND',
        contactConsent: false,
      }),
    ).toBe('consent-required');
    expect(
      checkCrmActivity({
        type: 'WHATSAPP',
        direction: 'OUTBOUND',
        contactConsent: true,
      }),
    ).toBeNull();
  });

  it('requires a direction for conversations and bounds summaries', () => {
    expect(
      checkCrmActivity({
        type: 'EMAIL',
        direction: null,
        contactConsent: true,
      }),
    ).toBe('direction-required');
    expect(() => crmActivitySummarySchema.parse('x')).toThrow();
    expect(() => crmActivitySummarySchema.parse('x'.repeat(1001))).toThrow();
  });
});
