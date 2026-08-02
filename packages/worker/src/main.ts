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
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'api-key': environment.data.BREVO_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sender: {
                  name: environment.data.NOTIFICATION_FROM_NAME,
                  email: environment.data.NOTIFICATION_FROM_EMAIL,
                },
                to: [{ email: input.to }],
                subject: input.subject,
                textContent: input.text,
                headers: {
                  idempotencyKey: input.idempotencyKey,
                },
              }),
            });
            if (!response.ok)
              throw new Error(`Email provider returned ${response.status}`);
            const body: unknown = await response.json();
            return {
              providerReference: z
                .object({ messageId: z.string().min(1) })
                .parse(body).messageId,
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
