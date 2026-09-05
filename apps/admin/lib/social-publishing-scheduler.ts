import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import type { SocialPublishingProvider } from '@luminol/database';

const schedulerEnvironmentSchema = z.object({
  LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE: z
    .enum(['OFF', 'INSTAGRAM_REELS_DUE'])
    .default('OFF'),
  LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

export type SocialPublishingSchedulerDependencies = {
  createProvider(environment: NodeJS.ProcessEnv): SocialPublishingProvider;
  dispatchBatch(input: {
    provider: SocialPublishingProvider;
    limit: number;
    now: Date;
  }): Promise<{ processed: number }>;
  now(): Date;
};

type SchedulerErrorCode =
  | 'UNAUTHORIZED'
  | 'DISPATCHER_OFF'
  | 'DISPATCHER_CONFIG_INVALID'
  | 'PROVIDER_NOT_READY'
  | 'DISPATCH_FAILED';

function response(
  status: number,
  body:
    | { ok: true; processed: number }
    | { ok: false; code: SchedulerErrorCode },
) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isAuthorized(request: Request, environment: NodeJS.ProcessEnv) {
  const secret = environment.CRON_SECRET?.trim();
  if (!secret || secret.length < 32 || secret.length > 512) return false;

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return false;

  return constantTimeEqual(authorization.slice('Bearer '.length), secret);
}

export async function handleSocialPublishingSchedulerRequest(
  request: Request,
  environment: NodeJS.ProcessEnv,
  dependencies: SocialPublishingSchedulerDependencies,
) {
  if (!isAuthorized(request, environment)) {
    return response(401, { ok: false, code: 'UNAUTHORIZED' });
  }

  const configuration = schedulerEnvironmentSchema.safeParse(environment);
  if (!configuration.success) {
    return response(503, {
      ok: false,
      code: 'DISPATCHER_CONFIG_INVALID',
    });
  }
  if (
    configuration.data.LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE !==
    'INSTAGRAM_REELS_DUE'
  ) {
    return response(503, { ok: false, code: 'DISPATCHER_OFF' });
  }

  let provider: SocialPublishingProvider;
  try {
    provider = dependencies.createProvider(environment);
  } catch {
    return response(503, { ok: false, code: 'PROVIDER_NOT_READY' });
  }

  const now = dependencies.now();
  if (!Number.isFinite(now.getTime())) {
    return response(500, { ok: false, code: 'DISPATCH_FAILED' });
  }

  try {
    const result = await dependencies.dispatchBatch({
      provider,
      limit: configuration.data.LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE,
      now,
    });
    return response(200, { ok: true, processed: result.processed });
  } catch {
    return response(500, { ok: false, code: 'DISPATCH_FAILED' });
  }
}
