import 'server-only';

import type { Prisma } from '@luminol/database';

import {
  getProfessionalNotificationCopy,
  type ProfessionalNotificationTemplateKey,
} from './professional-notification-localization';

type ProfessionalNotificationInput = {
  auditEventId: string;
  recipientUserId: string;
  templateKey: ProfessionalNotificationTemplateKey;
};

export async function createProfessionalTransitionNotification(
  transaction: Prisma.TransactionClient,
  input: ProfessionalNotificationInput,
) {
  const copy = getProfessionalNotificationCopy('en', input.templateKey);
  if (!copy) throw new Error('Unsupported professional notification template');

  const idempotencyKey = `professional-submission:${input.auditEventId}`;
  const existing = await transaction.notificationEvent.findUnique({
    where: { idempotencyKey },
    include: { notifications: true },
  });
  if (existing) return existing;

  return transaction.notificationEvent.create({
    data: {
      idempotencyKey,
      recipient: { connect: { id: input.recipientUserId } },
      templateKey: input.templateKey,
      category: 'TRANSACTIONAL',
      payload: {
        subject: copy.title,
        message: copy.message,
      },
      notifications: {
        create: [
          {
            recipient: { connect: { id: input.recipientUserId } },
            channel: 'IN_APP',
            title: copy.title,
            preview: copy.message.slice(0, 140),
            body: copy.message,
          },
        ],
      },
    },
    include: { notifications: true },
  });
}
