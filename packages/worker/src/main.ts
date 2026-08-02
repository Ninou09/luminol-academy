import { db } from '@luminol/database';
import {
  claimDueEmailDeliveries,
  deliverEmail,
} from '@luminol/notifications/server';
import { z } from 'zod';
import { runWorker, workerEnvironmentSchema } from './index';

const mode = process.argv.includes('--once') ? 'once' : 'continuous';
const environment = workerEnvironmentSchema.safeParse(process.env);

let stopping = false;
const stop = () => {
  stopping = true;
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);

const exitCode = await runWorker(
  mode,
  process.env,
  {
    claimDueEmailDeliveries,
    async deliverEmail(id, lockToken) {
      if (!environment.success) throw environment.error;
      return deliverEmail(
        id,
        {
          async send(input) {
            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${environment.data.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': input.idempotencyKey,
              },
              body: JSON.stringify({
                from: environment.data.NOTIFICATION_FROM_EMAIL,
                to: [input.to],
                subject: input.subject,
                text: input.text,
              }),
            });
            if (!response.ok)
              throw new Error(`Email provider returned ${response.status}`);
            const body: unknown = await response.json();
            return {
              providerReference: z.object({ id: z.string().min(1) }).parse(body)
                .id,
            };
          },
        },
        lockToken,
      );
    },
    disconnect: () => db.$disconnect(),
    sleep: (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  },
  () => stopping,
);

process.exitCode = exitCode;
