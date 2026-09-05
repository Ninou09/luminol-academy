import { describe, expect, it, vi } from 'vitest';

import type { SocialPublishingProvider } from '@luminol/database';

import {
  handleSocialPublishingSchedulerRequest,
  type SocialPublishingSchedulerDependencies,
} from './social-publishing-scheduler';

const secret = 's'.repeat(48);
const enabledEnvironment = {
  CRON_SECRET: secret,
  LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE: 'INSTAGRAM_REELS_DUE',
  LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE: '8',
} as NodeJS.ProcessEnv;

function provider(): SocialPublishingProvider {
  return {
    begin: vi.fn(),
    complete: vi.fn(),
  };
}

function dependencies(): SocialPublishingSchedulerDependencies {
  return {
    createProvider: vi.fn(() => provider()),
    dispatchBatch: vi.fn().mockResolvedValue({ processed: 2 }),
    now: vi.fn(() => new Date('2026-09-05T09:15:00.000Z')),
  };
}

function request(authorization = `Bearer ${secret}`) {
  return new Request(
    'https://admin.example.test/api/internal/social-publishing/dispatch',
    {
      headers: { authorization },
    },
  );
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe('social publishing scheduler request boundary', () => {
  it('rejects unauthorized requests before provider or database work', async () => {
    const runtime = dependencies();

    const response = await handleSocialPublishingSchedulerRequest(
      request('Bearer wrong'),
      enabledEnvironment,
      runtime,
    );

    expect(response.status).toBe(401);
    await expect(json(response)).resolves.toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
    });
    expect(runtime.createProvider).not.toHaveBeenCalled();
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });

  it('fails closed when scheduler authentication is not configured strongly enough', async () => {
    const runtime = dependencies();
    const environment = {
      ...enabledEnvironment,
      CRON_SECRET: 'too-short',
    } as NodeJS.ProcessEnv;

    const response = await handleSocialPublishingSchedulerRequest(
      request('Bearer too-short'),
      environment,
      runtime,
    );

    expect(response.status).toBe(401);
    expect(runtime.createProvider).not.toHaveBeenCalled();
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });

  it('keeps the scheduler OFF by default after successful authentication', async () => {
    const runtime = dependencies();
    const environment = { CRON_SECRET: secret } as NodeJS.ProcessEnv;

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      environment,
      runtime,
    );

    expect(response.status).toBe(503);
    await expect(json(response)).resolves.toEqual({
      ok: false,
      code: 'DISPATCHER_OFF',
    });
    expect(runtime.createProvider).not.toHaveBeenCalled();
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });

  it('rejects invalid bounded batch configuration before provider initialization', async () => {
    const runtime = dependencies();
    const environment = {
      ...enabledEnvironment,
      LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE: '101',
    } as NodeJS.ProcessEnv;

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      environment,
      runtime,
    );

    expect(response.status).toBe(503);
    await expect(json(response)).resolves.toEqual({
      ok: false,
      code: 'DISPATCHER_CONFIG_INVALID',
    });
    expect(runtime.createProvider).not.toHaveBeenCalled();
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });

  it('fails closed when the Meta provider is unavailable or misconfigured', async () => {
    const runtime = dependencies();
    vi.mocked(runtime.createProvider).mockImplementation(() => {
      throw new Error('provider unavailable');
    });

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      enabledEnvironment,
      runtime,
    );

    expect(response.status).toBe(503);
    await expect(json(response)).resolves.toEqual({
      ok: false,
      code: 'PROVIDER_NOT_READY',
    });
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });

  it('runs exactly one bounded due batch and returns only a processed count', async () => {
    const runtime = dependencies();
    const expectedNow = new Date('2026-09-05T09:15:00.000Z');

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      enabledEnvironment,
      runtime,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(json(response)).resolves.toEqual({ ok: true, processed: 2 });
    expect(runtime.createProvider).toHaveBeenCalledWith(enabledEnvironment);
    expect(runtime.dispatchBatch).toHaveBeenCalledOnce();
    expect(runtime.dispatchBatch).toHaveBeenCalledWith({
      provider: expect.any(Object),
      limit: 8,
      now: expectedNow,
    });
  });

  it('returns a bounded server failure when shared dispatch escapes retry handling', async () => {
    const runtime = dependencies();
    vi.mocked(runtime.dispatchBatch).mockRejectedValue(
      new AggregateError([new Error('database unavailable')]),
    );

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      enabledEnvironment,
      runtime,
    );

    expect(response.status).toBe(500);
    await expect(json(response)).resolves.toEqual({
      ok: false,
      code: 'DISPATCH_FAILED',
    });
  });

  it('fails without dispatching when the runtime clock is invalid', async () => {
    const runtime = dependencies();
    vi.mocked(runtime.now).mockReturnValue(new Date(Number.NaN));

    const response = await handleSocialPublishingSchedulerRequest(
      request(),
      enabledEnvironment,
      runtime,
    );

    expect(response.status).toBe(500);
    expect(runtime.dispatchBatch).not.toHaveBeenCalled();
  });
});
