import { describe, expect, it } from 'vitest';
import { Resend } from 'resend';
import { createEmailClient } from './index';

describe('createEmailClient', () => {
  it('constructs a Resend client with the provided API key', () => {
    const client = createEmailClient('re_test_key');

    expect(client).toBeInstanceOf(Resend);
    expect(client.key).toBe('re_test_key');
  });
});
