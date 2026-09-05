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

function dependencies(processed = 0): SocialPublishingWorkerDependencies {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    dispatchDueBatch: vi.fn().mockResolvedValue(processed),
    disconnect: vi.fn().mockResolvedValue(undefined),
    sleep: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => new Date('2026-09-04T12:00:00.000Z')),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scheduled social publishing worker', () => {
  it('is OFF by default and performs no provider preflight or dispatch', async () => {
    const worker = dependencies(1);

    await expect(runSocialPublishingWorker('once', {}, worker)).resolves.toBe(
      0,
    );

    expect(worker.initialize).not.toHaveBeenCalled();
    expect(worker.dispatchDueBatch).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('preflights configuration before dispatching due attempts', async () => {
    const worker = dependencies(1);

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(0);

    expect(worker.initialize).toHaveBeenCalledOnce();
    expect(
      vi.mocked(worker.initialize!).mock.invocationCallOrder[0]!,
    ).toBeLessThan(
      vi.mocked(worker.dispatchDueBatch).mock.invocationCallOrder[0]!,
    );
  });

  it('fails closed when provider preflight fails and never dispatches due work', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies(1);
    vi.mocked(worker.initialize!).mockRejectedValue(
      new Error('provider disabled'),
    );

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(worker.dispatchDueBatch).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(Error),
    );
  });

  it('processes exactly one bounded due batch when explicitly enabled', async () => {
    const worker = dependencies(2);
    const expectedNow = new Date('2026-09-04T12:00:00.000Z');

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(0);

    expect(worker.dispatchDueBatch).toHaveBeenCalledOnce();
    expect(worker.dispatchDueBatch).toHaveBeenCalledWith(8, expectedNow);
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('fails when the shared batch reports an escaped execution failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies();
    vi.mocked(worker.dispatchDueBatch).mockRejectedValue(
      new AggregateError(
        [new Error('database')],
        'One or more social publishing attempts failed outside the provider retry flow',
      ),
    );

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(AggregateError),
    );
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('rejects an invalid worker clock before dispatching attempts', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const worker = dependencies();
    vi.mocked(worker.now).mockReturnValue(new Date(Number.NaN));

    await expect(
      runSocialPublishingWorker('once', enabledEnvironment, worker),
    ).resolves.toBe(1);

    expect(worker.dispatchDueBatch).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      workerFailureMessage,
      expect.any(Error),
    );
  });

  it('sleeps between empty continuous batches without busy polling', async () => {
    const worker = dependencies(0);
    let stopChecks = 0;

    await expect(
      runSocialPublishingWorker(
        'continuous',
        enabledEnvironment,
        worker,
        () => {
          stopChecks += 1;
          return stopChecks >= 2;
        },
      ),
    ).resolves.toBe(0);

    expect(worker.dispatchDueBatch).toHaveBeenCalledOnce();
    expect(worker.sleep).toHaveBeenCalledWith(2000);
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
