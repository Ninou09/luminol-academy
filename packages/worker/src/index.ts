import { db } from '@luminol/database';
import {
  claimDueEmailDeliveries,
  deliverEmail,
} from '@luminol/notifications/server';
import { z } from 'zod';

const environmentSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  NOTIFICATION_FROM_EMAIL: z.email(),
  NOTIFICATION_WORKER_BATCH_SIZE: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25),
  NOTIFICATION_WORKER_INTERVAL_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(300_000)
    .default(5000),
});

const environment = environmentSchema.parse(process.env);
const provider = {
  async send(input: {
    to: string;
    subject: string;
    text: string;
    idempotencyKey: string;
  }) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${environment.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({
        from: environment.NOTIFICATION_FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!response.ok)
      throw new Error(`Email provider returned ${response.status}`);
    const body: unknown = await response.json();
    return {
      providerReference: z.object({ id: z.string().min(1) }).parse(body).id,
    };
  },
};

let stopping = false;
const stop = () => {
  stopping = true;
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);

while (!stopping) {
  const claim = await claimDueEmailDeliveries(
    environment.NOTIFICATION_WORKER_BATCH_SIZE,
  );
  await Promise.allSettled(
    claim.ids.map((id) => deliverEmail(id, provider, claim.lockToken)),
  );
  if (!stopping && claim.ids.length === 0)
    await new Promise((resolve) =>
      setTimeout(resolve, environment.NOTIFICATION_WORKER_INTERVAL_MS),
    );
}
await db.$disconnect();
