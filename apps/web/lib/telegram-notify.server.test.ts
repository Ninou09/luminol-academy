import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildTelegramEnquiryText,
  sendTelegramEnquiryAlert,
} from './telegram-notify.server';
import { verifyTurnstileToken } from './turnstile.server';

const alert = {
  id: 'enquiry_1',
  name: 'Learner <script>',
  preferredContact: 'WHATSAPP',
  phone: '+213 555 00 00 00',
  email: '',
  school: 'PSYCHOLOGY',
  programmeTitle: null,
  locale: 'ar',
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Telegram enquiry alert', () => {
  it('escapes HTML and leaves out empty fields', () => {
    const text = buildTelegramEnquiryText(alert);
    expect(text).toContain('Learner &lt;script&gt;');
    expect(text).not.toContain('Email:');
    expect(text).not.toContain('Programme:');
  });

  it('is skipped until the bot token and chat are configured', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    const fetchImpl = vi.fn();
    await expect(sendTelegramEnquiryAlert(alert, fetchImpl)).resolves.toBe(
      'skipped',
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts to the configured chat', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'token');
    vi.stubEnv('TELEGRAM_CHAT_ID', '42');
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'));
    await expect(sendTelegramEnquiryAlert(alert, fetchImpl)).resolves.toBe(
      'sent',
    );
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.telegram.org/bottoken/sendMessage');
    expect(JSON.parse(String(init.body)).chat_id).toBe('42');
  });
});

describe('Turnstile verification', () => {
  it('passes when no secret is configured', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    await expect(verifyTurnstileToken(null, null)).resolves.toBe(true);
  });

  it('rejects a missing token once enabled', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    await expect(verifyTurnstileToken(null, null)).resolves.toBe(false);
  });

  it('accepts a token Cloudflare confirms', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(Response.json({ success: true }));
    await expect(
      verifyTurnstileToken('token', '1.2.3.4', fetchImpl),
    ).resolves.toBe(true);
  });
});
