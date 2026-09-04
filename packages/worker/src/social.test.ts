import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  runSocialPublishingWorker,
  type SocialPublishingWorkerDependencies,
} from './social';

const enabledEnvironment = {
  LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE: 'INSTAGRAM_REELS_DUE',
  LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE: '8',
  LUMINOL_SOCIAL_PUBLISHING_WORKER_INTERVAL_MS: '2000',
};

const workerFailureMessage =
  'Social publishing worker failed to initialize or process a batch';
const disconnectFailureMessage =
  'Social publishing worker failed to disconnect from the database';

function dependencies(ids: string[] = []): SocialPublishingWorkerDependencies {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    listDueAttemptIds: vi.fn().mockResolvedValue(ids),
    executeAttempt: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    sleep: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => new Date('2026-09-04T12:00:00.000Z')),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scheduled social publishing worker', () => {
  it('is OFF by default and performs no provider preflight, dispatch query or execution', async () => {
    const worker = dependencies(['attempt-should-not-run']);

    await expect(runSocialPublishingWorker('once', {}, worker)).resolves.toBe(
      0,
    );

    expect(worker.initialize).not.toHaveBeenCalled();
    expect(worker.listDueAttemptIds).not.toHaveBeenCalled();
    expect(worker.executeAttempt).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('preflights configuration before querying due attempts', async () => {
    const worker = dependencies(['attempt-a']);

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(0);

    expect(worker.initialize).toHaveBeenCalledOnce();
    expect(
      vi.mocked(worker.initialize).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(worker.listDueAttemptIds).mock.invocationCallOrder[0]!,
    );
  });

  it('fails closed when provider preflight fails and never queries due work', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies(['attempt-should-not-run']);
    vi.mocked(worker.initialize!).mockRejectedValue(
      new Error('provider disabled'),
    );

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(worker.listDueAttemptIds).not.toHaveBeenCalled();
    expect(worker.executeAttempt).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(Error),
    );
  });

  it('processes exactly one bounded due batch when explicitly enabled', async () => {
    const worker = dependencies(['attempt-a', 'attempt-b']);
    const expectedNow = new Date('2026-09-04T12:00:00.000Z');

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(0);

    expect(worker.listDueAttemptIds).toHaveBeenCalledWith(8, expectedNow);
    expect(worker.executeAttempt).toHaveBeenCalledTimes(2);
    expect(worker.executeAttempt).toHaveBeenCalledWith(
      'attempt-a',
      expectedNow,
    );
    expect(worker.executeAttempt).toHaveBeenCalledWith(
      'attempt-b',
      expectedNow,
    );
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('treats executor-managed retry outcomes as a processed batch', async () => {
    const worker = dependencies(['attempt-retry']);
    vi.mocked(worker.executeAttempt).mockResolvedValue({
      status: 'RETRY_SCHEDULED',
    });

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(0);

    expect(worker.executeAttempt).toHaveBeenCalledOnce();
  });

  it('fails when an execution escapes the bounded provider retry flow', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies(['attempt-fatal']);
    vi.mocked(worker.executeAttempt).mockRejectedValue(new Error('database'));

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(AggregateError),
    );
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('rejects an invalid worker clock before querying attempts', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies();
    vi.mocked(worker.now).mockReturnValue(new Date(Number.NaN));

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(worker.listDueAttemptIds).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(Error),
    );
  });

  it('logs disconnect failure without replacing a successful disabled result', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies();
    vi.mocked(worker.disconnect).mockRejectedValue(new Error('database'));

    await expect(runSocialPublishingWorker('once', {}, worker)).resolves.toBe(
      0,
    );

    expect(consoleError).toHaveBeenCalledWith(
      disconnectFailureMessage,
      expect.any(Error),
    );
  });
});
