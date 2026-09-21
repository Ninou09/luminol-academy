import 'server-only';

import { db } from '@luminol/database';
import type { NotificationEventInput } from '@luminol/notifications';
import { createResendEmailProvider } from '@luminol/notifications/resend';
import { createNotificationEvent } from '@luminol/notifications/server';
import { z } from 'zod';

type EnquiryLocale = 'ar' | 'fr' | 'en';

export type EnquiryCommunicationRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP' | null;
  school: 'PSYCHOLOGY' | 'LANGUAGES' | 'TRAINING' | 'GENERAL';
  programmeTitleSnapshot: string | null;
  locale: EnquiryLocale;
  message: string;
};

type VisitorEmail = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
};

export type EnquiryCommunicationDependencies = {
  loadAdminRecipientIds: () => Promise<string[]>;
  createInternalNotification: (
    input: NotificationEventInput,
  ) => Promise<unknown>;
  sendVisitorEmail?: ((input: VisitorEmail) => Promise<unknown>) | undefined;
};

export type EnquiryCommunicationResult = {
  staffNotificationsQueued: number;
  visitorAcknowledgement: 'sent' | 'skipped' | 'failed';
  failures: number;
};

const emailEnvironmentSchema = z.object({
  RESEND_API_KEY: z.string().startsWith('re_'),
  NOTIFICATION_FROM_EMAIL: z.string().email(),
  NOTIFICATION_PROVIDER_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(120_000)
    .default(30_000),
});

const visitorCopy = {
  ar: {
    subject: 'استلمنا طلبك — أكاديمية لومينول',
    greeting: 'مرحبًا',
    received:
      'شكرًا لتواصلك مع أكاديمية لومينول. استلم فريقنا طلبك وسيُراجعه بعناية.',
    next: 'سنتواصل معك عبر الوسيلة التي اخترتها لتأكيد الخطوة التالية.',
    disclaimer:
      'إرسال هذا الطلب لا يعني تأكيد التسجيل أو الموعد؛ يصبح التأكيد نهائيًا بعد تواصل الفريق معك.',
    reference: 'رقم مرجع الطلب',
  },
  fr: {
    subject: 'Nous avons reçu votre demande — Luminol Academy',
    greeting: 'Bonjour',
    received:
      'Merci d’avoir contacté Luminol Academy. Notre équipe a bien reçu votre demande et va l’examiner avec attention.',
    next: 'Nous vous contacterons par le moyen choisi pour confirmer la prochaine étape.',
    disclaimer:
      'Cette demande ne confirme pas encore une inscription ou un rendez-vous ; la confirmation devient définitive après le suivi de notre équipe.',
    reference: 'Référence de la demande',
  },
  en: {
    subject: 'We received your enquiry — Luminol Academy',
    greeting: 'Hello',
    received:
      'Thank you for contacting Luminol Academy. Our team has received your enquiry and will review it carefully.',
    next: 'We will contact you using your chosen method to confirm the next step.',
    disclaimer:
      'This enquiry does not confirm a registration or appointment; confirmation becomes final only after our team follows up with you.',
    reference: 'Enquiry reference',
  },
} as const;

export function buildStaffEnquiryNotification(
  enquiry: EnquiryCommunicationRecord,
  recipientId: string,
): NotificationEventInput {
  const programme = enquiry.programmeTitleSnapshot
    ? ` · البرنامج: ${enquiry.programmeTitleSnapshot}`
    : '';
  return {
    idempotencyKey: `enquiry-received-${enquiry.id}-${recipientId}`,
    recipientId,
    templateKey: 'enquiry_received',
    category: 'transactional',
    payload: {
      subject: 'طلب جديد عبر موقع أكاديمية لومينول',
      message: `وصل طلب جديد عبر الموقع. المرجع: ${enquiry.id} · المجال: ${enquiry.school}${programme}. افتح لوحة الاستفسارات المحمية لمراجعة بيانات التواصل والتفاصيل.`,
    },
    channels: ['in_app', 'email'],
  };
}

export function buildVisitorAcknowledgement(
  enquiry: EnquiryCommunicationRecord,
): VisitorEmail {
  const copy = visitorCopy[enquiry.locale];
  return {
    to: enquiry.email,
    subject: copy.subject,
    text: [
      `${copy.greeting} ${enquiry.name},`,
      '',
      copy.received,
      copy.next,
      '',
      `${copy.reference}: ${enquiry.id}`,
      '',
      copy.disclaimer,
      '',
      'Luminol Academy',
    ].join('\n'),
    idempotencyKey: `enquiry-acknowledgement-${enquiry.id}`,
  };
}

function createDefaultDependencies(): EnquiryCommunicationDependencies {
  const emailEnvironment = emailEnvironmentSchema.safeParse(process.env);
  const provider = emailEnvironment.success
    ? createResendEmailProvider({
        apiKey: emailEnvironment.data.RESEND_API_KEY,
        from: emailEnvironment.data.NOTIFICATION_FROM_EMAIL,
        timeoutMs: emailEnvironment.data.NOTIFICATION_PROVIDER_TIMEOUT_MS,
      })
    : null;

  return {
    async loadAdminRecipientIds() {
      const administrators = await db.user.findMany({
        where: {
          deletedAt: null,
          roles: {
            some: {
              role: {
                permissions: {
                  some: { permission: { key: 'academy:manage' } },
                },
              },
            },
          },
        },
        select: { id: true },
      });
      return administrators.map(({ id }) => id);
    },
    createInternalNotification: createNotificationEvent,
    ...(provider
      ? {
          sendVisitorEmail: (input: VisitorEmail) => provider.send(input),
        }
      : {}),
  };
}

export async function dispatchEnquiryCommunications(
  enquiry: EnquiryCommunicationRecord,
  dependencies: EnquiryCommunicationDependencies = createDefaultDependencies(),
): Promise<EnquiryCommunicationResult> {
  let recipientIds: string[] = [];
  let failures = 0;

  try {
    recipientIds = await dependencies.loadAdminRecipientIds();
    if (recipientIds.length === 0) failures += 1;
  } catch {
    failures += 1;
  }

  const staffResults = await Promise.allSettled(
    recipientIds.map((recipientId) =>
      dependencies.createInternalNotification(
        buildStaffEnquiryNotification(enquiry, recipientId),
      ),
    ),
  );
  const staffNotificationsQueued = staffResults.filter(
    ({ status }) => status === 'fulfilled',
  ).length;
  failures += staffResults.length - staffNotificationsQueued;

  let visitorAcknowledgement: EnquiryCommunicationResult['visitorAcknowledgement'] =
    'skipped';
  if (enquiry.email && dependencies.sendVisitorEmail) {
    try {
      await dependencies.sendVisitorEmail(buildVisitorAcknowledgement(enquiry));
      visitorAcknowledgement = 'sent';
    } catch {
      visitorAcknowledgement = 'failed';
      failures += 1;
    }
  }

  return {
    staffNotificationsQueued,
    visitorAcknowledgement,
    failures,
  };
}
