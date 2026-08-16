import { describe, expect, it, vi } from 'vitest';
import { workerEnvironmentSchema } from './index';
import { createResendEmailProvider } from './resend';

const email = {
  to: 'learner@example.com',
  subject: 'Account notice',
  text: 'A notification body',
  idempotencyKey: 'notification/test-delivery',
};

const baseEnvironment = {
  RESEND_API_KEY: 're_test',
  NOTIFICATION_FROM_EMAIL: 'notifications@example.com',
};

describe('notification provider timeout configuration', () => {
  it('uses a finite default safely below the delivery lease', () => {
    const environment = workerEnvironmentSchema.parse(baseEnvironment);
    expect(environment.NOTIFICATION_PROVIDER_TIMEOUT_MS).toBe(30_000);
  });

  it('rejects provider timeouts outside the bounded range', () => {
    expect(
      workerEnvironmentSchema.safeParse({
        ...baseEnvironment,
        NOTIFICATION_PROVIDER_TIMEOUT_MS: '999',
      }).success,
    ).toBe(false);
    expect(
      workerEnvironmentSchema.safeParse({
        ...baseEnvironment,
        NOTIFICATION_PROVIDER_TIMEOUT_MS: '120001',
      }).success,
    ).toBe(false);
  });
});

describe('Resend email provider', () => {
  it('preserves the idempotency key and parses the provider reference', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      from: 'notifications@example.com',
      timeoutMs: 30_000,
      fetchImplementation,
    });

    await expect(provider.send(email)).resolves.toEqual({
      providerReference: 'email_123',
    });
    expect(fetchImplementation).toHaveBeenCalledOnce();
    const [url, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      Authorization: 'Bearer re_test',
      'Content-Type': 'application/json',
      'Idempotency-Key': email.idempotencyKey,
    });
    expect(init?.body).toBe(
      JSON.stringify({
        from: 'notifications@example.com',
        to: [email.to],
        subject: email.subject,
        text: email.text,
      }),
    );
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('surfaces provider HTTP failures to the existing retry flow', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      from: 'notifications@example.com',
      timeoutMs: 30_000,
      fetchImplementation,
    });

    await expect(provider.send(email)).rejects.toThrow(
      'Email provider returned 503',
    );
  });

  it('aborts a stalled provider request when the timeout expires', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error('Expected a request abort signal'));
          return;
        }
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        });
      });
    });
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      from: 'notifications@example.com',
      timeoutMs: 5,
      fetchImplementation,
    });

    await expect(provider.send(email)).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('rejects malformed successful provider responses', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      from: 'notifications@example.com',
      timeoutMs: 30_000,
      fetchImplementation,
    });

    await expect(provider.send(email)).rejects.toThrow();
  });
});
