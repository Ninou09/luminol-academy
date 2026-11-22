import { Webhook } from 'svix';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@luminol/database', () => ({ db: {} }));

const { verifyClerkWebhook } = await import('./index');

// A test-only signing secret in Svix format; it is not a real credential.
const secret = `whsec_${Buffer.from('luminol-test-signing-secret-32b!').toString('base64')}`;

function signed(payload: string) {
  const id = 'msg_test_1';
  const timestamp = new Date();
  const signature = new Webhook(secret).sign(id, timestamp, payload);
  return {
    id,
    timestamp: String(Math.floor(timestamp.getTime() / 1000)),
    signature,
  };
}

describe('Clerk webhook verification', () => {
  const payload = JSON.stringify({
    type: 'user.deleted',
    data: { id: 'user_123' },
  });

  it('accepts an event signed with the webhook secret', () => {
    expect(verifyClerkWebhook(payload, signed(payload), secret)).toEqual({
      type: 'user.deleted',
      data: { id: 'user_123' },
    });
  });

  it('rejects an event whose body was changed after signing', () => {
    const headers = signed(payload);
    const tampered = payload.replace('user_123', 'user_999');
    expect(() => verifyClerkWebhook(tampered, headers, secret)).toThrow();
  });

  it('rejects an event signed with a different secret', () => {
    const other = `whsec_${Buffer.from('another-secret-for-tests-only-32').toString('base64')}`;
    const headers = {
      ...signed(payload),
      signature: new Webhook(other).sign('msg_test_1', new Date(), payload),
    };
    expect(() => verifyClerkWebhook(payload, headers, secret)).toThrow();
  });
});
