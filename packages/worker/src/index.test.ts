import { describe, expect, it, vi } from 'vitest';
import { runWorker, type WorkerDependencies } from './index';

const environment = {
  RESEND_API_KEY: 're_test',
  NOTIFICATION_FROM_EMAIL: 'notifications@example.com',
  NOTIFICATION_WORKER_BATCH_SIZE: '10',
};

function dependencies(ids: string[] = []): WorkerDependencies {
  return {
    claimDueEmailDeliveries: vi
      .fn()
      .mockResolvedValue({ ids, lockToken: 'lease' }),
    deliverEmail: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    sleep: vi.fn().mockResolvedValue(undefined),
  };
}

describe('run-once notification worker', () => {
  it('exits successfully and disconnects when no work is due', async () => {
    const worker = dependencies();
    await expect(runWorker('once', environment, worker)).resolves.toBe(0);
    expect(worker.deliverEmail).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('claims and processes exactly one bounded batch', async () => {
    const worker = dependencies(['first', 'second']);
    await expect(runWorker('once', environment, worker)).resolves.toBe(0);
    expect(worker.claimDueEmailDeliveries).toHaveBeenCalledWith(10);
    expect(worker.deliverEmail).toHaveBeenCalledTimes(2);
    expect(worker.deliverEmail).toHaveBeenCalledWith('first', 'lease');
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('treats a partial provider failure as a processed batch', async () => {
    const worker = dependencies(['failed', 'successful']);
    vi.mocked(worker.deliverEmail).mockResolvedValueOnce({
      status: 'RETRY_SCHEDULED',
    });
    await expect(runWorker('once', environment, worker)).resolves.toBe(0);
    expect(worker.deliverEmail).toHaveBeenCalledTimes(2);
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('returns failure for fatal initialization and still disconnects', async () => {
    const worker = dependencies();
    await expect(runWorker('once', {}, worker)).resolves.toBe(1);
    expect(worker.claimDueEmailDeliveries).not.toHaveBeenCalled();
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('returns failure for a fatal claim error and still disconnects', async () => {
    const worker = dependencies();
    vi.mocked(worker.claimDueEmailDeliveries).mockRejectedValue(
      new Error('database'),
    );
    await expect(runWorker('once', environment, worker)).resolves.toBe(1);
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });

  it('returns failure when delivery fails outside the provider retry flow', async () => {
    const worker = dependencies(['delivery']);
    vi.mocked(worker.deliverEmail).mockRejectedValue(new Error('database'));
    await expect(runWorker('once', environment, worker)).resolves.toBe(1);
    expect(worker.disconnect).toHaveBeenCalledOnce();
  });
});
