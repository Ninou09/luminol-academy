import {
  createMetaInstagramReelsProviderFromEnv,
  db,
  dispatchDueInstagramReelsPublishingAttempts,
  type ResumableSocialPublishingProvider,
} from '@luminol/database';

import {
  runSocialPublishingWorker,
  socialPublishingWorkerEnvironmentSchema,
} from './social';

const mode = process.argv.includes('--once') ? 'once' : 'continuous';
const environment = socialPublishingWorkerEnvironmentSchema.safeParse(
  process.env,
);
let provider: ResumableSocialPublishingProvider | undefined;

let stopping = false;
const stop = () => {
  stopping = true;
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);

const exitCode = await runSocialPublishingWorker(
  mode,
  process.env,
  {
    async initialize() {
      if (!environment.success) throw environment.error;
      provider = createMetaInstagramReelsProviderFromEnv(process.env);
    },
    async dispatchDueBatch(batchSize, now) {
      if (!provider) {
        throw new Error('Social publishing provider failed to initialize');
      }
      const result = await dispatchDueInstagramReelsPublishingAttempts(db, {
        limit: batchSize,
        now,
        provider,
      });
      return result.processed;
    },
    disconnect: () => db.$disconnect(),
    sleep: (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    now: () => new Date(),
  },
  () => stopping,
);

process.exitCode = exitCode;
