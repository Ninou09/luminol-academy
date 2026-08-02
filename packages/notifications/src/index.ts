import { z } from 'zod';

export const notificationCategorySchema = z.enum([
  'transactional',
  'marketing',
]);
export const notificationChannelSchema = z.enum(['in_app', 'email']);
export const notificationEventSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(255),
  organizationId: z.string().trim().min(1).max(128).optional(),
  recipientId: z.string().trim().min(1).max(128),
  templateKey: z.enum([
    'course_completed',
    'certificate_issued',
    'account_notice',
  ]),
  category: notificationCategorySchema,
  payload: z
    .object({
      subject: z.string().trim().min(1).max(120),
      message: z.string().trim().min(1).max(2_000),
    })
    .strict(),
  channels: z.array(notificationChannelSchema).min(1).max(2),
});
export type NotificationEventInput = z.input<typeof notificationEventSchema>;

export function shouldDeliver(
  category: z.infer<typeof notificationCategorySchema>,
  enabled: boolean,
): boolean {
  return category === 'transactional' || enabled;
}

export function isQuietTime(
  now: Date,
  timeZone: string,
  startMinutes?: number | null,
  endMinutes?: number | null,
): boolean {
  if (startMinutes == null || endMinutes == null || startMinutes === endMinutes)
    return false;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value);
  if (!Number.isFinite(hour) || !Number.isFinite(minute))
    throw new Error('Unable to calculate local time');
  const local = hour * 60 + minute;
  return startMinutes < endMinutes
    ? local >= startMinutes && local < endMinutes
    : local >= startMinutes || local < endMinutes;
}

export const MAX_DELIVERY_ATTEMPTS = 5;
export function retryDelayMs(attempt: number): number | null {
  if (!Number.isInteger(attempt) || attempt < 1)
    throw new Error('Attempt must be a positive integer');
  return attempt >= MAX_DELIVERY_ATTEMPTS
    ? null
    : Math.min(60 * 60_000, 30_000 * 2 ** (attempt - 1));
}

export interface EmailDelivery {
  providerReference: string;
}
export interface EmailProvider {
  send(input: {
    to: string;
    subject: string;
    text: string;
    idempotencyKey: string;
  }): Promise<EmailDelivery>;
}
