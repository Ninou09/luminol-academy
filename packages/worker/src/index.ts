import { z } from 'zod';

export const workerEnvironmentSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  NOTIFICATION_FROM_EMAIL: z.email(),
  NOTIFICATION_PROVIDER_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(120_000)
    .default(30_000),
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

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export type DeliveryClaim = { ids: string[]; lockToken: string };

export type WorkerDependencies = {
  claimDueEmailDeliveries(batchSize: number): Promise<DeliveryClaim>;
  deliverEmail(id: string, lockToken: string): Promise<unknown>;
  disconnect(): Promise<void>;
  sleep(milliseconds: number): Promise<void>;
};

export async function processOneBatch(
  batchSize: number,
  dependencies: WorkerDependencies,
) {
  const claim = await dependencies.claimDueEmailDeliveries(batchSize);
  const results = await Promise.allSettled(
    claim.ids.map((id) => dependencies.deliverEmail(id, claim.lockToken)),
  );
  const fatalFailures = results.filter(
    (result) => result.status === 'rejected',
  );
  if (fatalFailures.length > 0)
    throw new AggregateError(
      fatalFailures.map(({ reason }) => reason),
      'One or more deliveries failed outside the provider retry flow',
    );
  return claim.ids.length;
}

export async function runWorker(
  mode: 'continuous' | 'once',
  environmentInput: unknown,
  dependencies: WorkerDependencies,
  shouldStop: () => boolean = () => false,
) {
  try {
    const environment = workerEnvironmentSchema.parse(environmentInput);
    do {
      const processed = await processOneBatch(
        environment.NOTIFICATION_WORKER_BATCH_SIZE,
        dependencies,
      );
      if (mode === 'once') return 0;
      if (!shouldStop() && processed === 0)
        await dependencies.sleep(environment.NOTIFICATION_WORKER_INTERVAL_MS);
    } while (!shouldStop());
    return 0;
  } catch (error) {
    console.error(
      'Notification worker failed to initialize or process a batch',
      error,
    );
    return 1;
  } finally {
    try {
      await dependencies.disconnect();
    } catch (error) {
      console.error(
        'Notification worker failed to disconnect from the database',
        error,
      );
    }
  }
}
