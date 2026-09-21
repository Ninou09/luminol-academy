import { describe, expect, it, vi } from 'vitest';

import {
  buildStaffEnquiryNotification,
  buildVisitorAcknowledgement,
  dispatchEnquiryCommunications,
  type EnquiryCommunicationRecord,
} from './enquiry-communications.server';

const enquiry: EnquiryCommunicationRecord = {
  id: 'enquiry_123456789',
  name: 'Luminol Learner',
  email: 'learner@example.com',
  phone: '+213 555 12 34 56',
  preferredContact: 'EMAIL',
  school: 'PSYCHOLOGY',
  programmeTitleSnapshot: 'Acceptance and Commitment Therapy',
  locale: 'ar',
  message:
    'Private details that must remain inside the protected enquiry desk.',
};

describe('new-enquiry communications', () => {
  it('builds a privacy-minimized staff alert pointing to the protected desk', () => {
    const notification = buildStaffEnquiryNotification(enquiry, 'admin-1');

    expect(notification).toMatchObject({
      idempotencyKey: 'enquiry-received-enquiry_123456789-admin-1',
      recipientId: 'admin-1',
      templateKey: 'enquiry_received',
      category: 'transactional',
      channels: ['in_app', 'email'],
    });
    expect(notification.payload.message).toContain('enquiry_123456789');
    expect(notification.payload.message).toContain('لوحة الاستفسارات المحمية');
    expect(notification.payload.message).not.toContain(enquiry.message);
    expect(notification.payload.message).not.toContain(enquiry.email);
    expect(notification.payload.message).not.toContain(enquiry.phone);
  });

  it('builds a localized acknowledgement that does not claim registration is confirmed', () => {
    const acknowledgement = buildVisitorAcknowledgement(enquiry);

    expect(acknowledgement.to).toBe(enquiry.email);
    expect(acknowledgement.subject).toContain('لومينول');
    expect(acknowledgement.text).toContain('enquiry_123456789');
    expect(acknowledgement.text).toContain('لا يعني تأكيد التسجيل أو الموعد');
    expect(acknowledgement.idempotencyKey).toBe(
      'enquiry-acknowledgement-enquiry_123456789',
    );
  });

  it('alerts every protected academy administrator and acknowledges the visitor', async () => {
    const createInternalNotification = vi.fn().mockResolvedValue(undefined);
    const sendVisitorEmail = vi.fn().mockResolvedValue(undefined);

    const result = await dispatchEnquiryCommunications(enquiry, {
      loadAdminRecipientIds: vi.fn().mockResolvedValue(['admin-1', 'admin-2']),
      createInternalNotification,
      sendVisitorEmail,
    });

    expect(result).toEqual({
      staffNotificationsQueued: 2,
      visitorAcknowledgement: 'sent',
      failures: 0,
    });
    expect(createInternalNotification).toHaveBeenCalledTimes(2);
    expect(sendVisitorEmail).toHaveBeenCalledOnce();
  });

  it('does not let one delivery failure prevent other recipients or lose the lead', async () => {
    const createInternalNotification = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary notification failure'))
      .mockResolvedValueOnce(undefined);
    const sendVisitorEmail = vi
      .fn()
      .mockRejectedValue(new Error('email provider unavailable'));

    await expect(
      dispatchEnquiryCommunications(enquiry, {
        loadAdminRecipientIds: vi
          .fn()
          .mockResolvedValue(['admin-1', 'admin-2']),
        createInternalNotification,
        sendVisitorEmail,
      }),
    ).resolves.toEqual({
      staffNotificationsQueued: 1,
      visitorAcknowledgement: 'failed',
      failures: 2,
    });
    expect(createInternalNotification).toHaveBeenCalledTimes(2);
  });

  it('skips visitor email when the enquiry has no email address', async () => {
    const sendVisitorEmail = vi.fn().mockResolvedValue(undefined);

    const result = await dispatchEnquiryCommunications(
      { ...enquiry, email: '', preferredContact: 'WHATSAPP' },
      {
        loadAdminRecipientIds: vi.fn().mockResolvedValue([]),
        createInternalNotification: vi.fn().mockResolvedValue(undefined),
        sendVisitorEmail,
      },
    );

    expect(result.visitorAcknowledgement).toBe('skipped');
    expect(result.failures).toBe(1);
    expect(sendVisitorEmail).not.toHaveBeenCalled();
  });
});
