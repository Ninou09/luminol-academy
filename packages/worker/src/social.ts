import { z } from 'zod';

export const socialPublishingWorkerEnvironmentSchema = z.object({
  LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE: z
    .enum(['OFF', 'INSTAGRAM_REELS_DUE'])
    .default('OFF'),
  LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
  LUMINOL_SOCIAL_PUBLISHING_WORKER_INTERVAL_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(300_000)
    .default(15_000),
});

export type SocialPublishingWorkerDependencies = {
  initialize?(): Promise<void>;
  listDueAttemptIds(batchSize: number, now: Date): Promise<string[]>;
  executeAttempt(attemptId: string, now: Date): Promise<unknown>;
  disconnect(): Promise<void>;
  sleep(milliseconds: number): Promise<void>;
  now(): Date;
};

export async function processOneSocialPublishingBatch(
  batchSize: number,
  dependencies: SocialPublishingWorkerDependencies,
) {
  const now = dependencies.now();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing worker clock is invalid');
  }

  const ids = await dependencies.listDueAttemptIds(batchSize, now);
  const results = await Promise.allSettled(
    ids.map((id) => dependencies.executeAttempt(id, now)),
  );
  const fatalFailures = results.filter((result) => result.status === 'rejected');
  if (fatalFailures.length > 0) {
    throw new AggregateError(
      fatalFailures.map(({ reason }) => reason),
      'One or more social publishing attempts failed outside the provider retry flow',
    );
  }

  return ids.length;
}

export async function runSocialPublishingWorker(
  mode: 'continuous' | 'once',
  environmentInput: unknown,
  dependencies: SocialPublishingWorkerDependencies,
  shouldStop: () => boolean = () => false,
) {
  try {
    const environment = socialPublishingWorkerEnvironmentSchema.parse(
      environmentInput,
    );
    if (environment.LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE === 'OFF') return 0;

    await dependencies.initialize?.();

    do {
      const processed = await processOneSocialPublishingBatch(
        environment.LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE,
        dependencies,
      );
      if (mode === 'once') return 0;
      if (!shouldStop() && processed === 0) {
        await dependencies.sleep(
          environment.LUMINOL_SOCIAL_PUBLISHING_WORKER_INTERVAL_MS,
        );
      }
    } while (!shouldStop());

    return 0;
  } catch (error) {
    console.error(
      'Social publishing worker failed to initialize or process a batch',
      error,
    );
    return 1;
  } finally {
    try {
      await dependencies.disconnect();
    } catch (error) {
      console.error(
        'Social publishing worker failed to disconnect from the database',
        error,
      );
    }
  }
}
