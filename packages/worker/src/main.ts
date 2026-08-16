import { db } from '@luminol/database';
import {
  claimDueEmailDeliveries,
  deliverEmail,
} from '@luminol/notifications/server';
import { runWorker, workerEnvironmentSchema } from './index';
import { createResendEmailProvider } from './resend';

const mode = process.argv.includes('--once') ? 'once' : 'continuous';
const environment = workerEnvironmentSchema.safeParse(process.env);
const emailProvider = environment.success
  ? createResendEmailProvider({
      apiKey: environment.data.RESEND_API_KEY,
      from: environment.data.NOTIFICATION_FROM_EMAIL,
      timeoutMs: environment.data.NOTIFICATION_PROVIDER_TIMEOUT_MS,
    })
  : undefined;

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
      if (!emailProvider)
        throw new Error('Notification email provider failed to initialize');
      return deliverEmail(id, emailProvider, lockToken);
    },
    disconnect: () => db.$disconnect(),
    sleep: (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  },
  () => stopping,
);

process.exitCode = exitCode;
