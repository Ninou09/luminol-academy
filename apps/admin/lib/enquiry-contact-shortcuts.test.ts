import { describe, expect, it } from 'vitest';

import { buildEnquiryContactShortcuts } from './enquiry-contact-shortcuts';

describe('enquiry contact shortcuts', () => {
  it('builds deterministic email, phone and WhatsApp shortcuts from safe stored values', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '+213 (555) 12-34-56',
        preferredContact: 'WHATSAPP',
      }),
    ).toEqual([
      {
        kind: 'email',
        href: 'mailto:lead%40example.com',
        preferred: false,
      },
      {
        kind: 'phone',
        href: 'tel:+213555123456',
        preferred: false,
      },
      {
        kind: 'whatsapp',
        href: 'https://wa.me/213555123456',
        preferred: true,
      },
    ]);
  });

  it('keeps a local phone callable without guessing a WhatsApp country code', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '0550 12 34 56',
        preferredContact: 'WHATSAPP',
      }),
    ).toEqual([
      {
        kind: 'email',
        href: 'mailto:lead%40example.com',
        preferred: false,
      },
      {
        kind: 'phone',
        href: 'tel:0550123456',
        preferred: false,
      },
    ]);
  });

  it('rejects malformed phone values instead of creating external links', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '+213 555 123 456;99',
        preferredContact: 'PHONE',
      }),
    ).toEqual([
      {
        kind: 'email',
        href: 'mailto:lead%40example.com',
        preferred: false,
      },
    ]);
  });

  it('requires an international plus-prefixed E.164-style value for WhatsApp', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '+0123456789',
        preferredContact: 'WHATSAPP',
      }),
    ).toEqual([
      {
        kind: 'email',
        href: 'mailto:lead%40example.com',
        preferred: false,
      },
      {
        kind: 'phone',
        href: 'tel:+0123456789',
        preferred: false,
      },
    ]);
  });

  it('marks only the shortcut matching the persisted preferred-contact enum', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '+33123456789',
        preferredContact: 'EMAIL',
      }).map(({ kind, preferred }) => ({ kind, preferred })),
    ).toEqual([
      { kind: 'email', preferred: true },
      { kind: 'phone', preferred: false },
      { kind: 'whatsapp', preferred: false },
    ]);
  });

  it('omits unsafe email and absent phone values', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead\n@example.com',
        phone: null,
        preferredContact: null,
      }),
    ).toEqual([]);
  });

  it('rejects phone values beyond the bounded digit length', () => {
    expect(
      buildEnquiryContactShortcuts({
        email: 'lead@example.com',
        phone: '+1234567890123456',
        preferredContact: 'PHONE',
      }),
    ).toHaveLength(1);
  });
});
