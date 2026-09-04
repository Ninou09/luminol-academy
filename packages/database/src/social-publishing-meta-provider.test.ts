import { describe, expect, it, vi } from 'vitest';

import type { SocialPublishingDeliveryPlan } from './social-publishing-delivery';
import {
  createMetaInstagramReelsProvider,
  createMetaInstagramReelsProviderFromEnv,
  getMetaInstagramReelsProviderStatus,
  MetaSocialPublishingSafeError,
} from './social-publishing-meta-provider';

const plan: SocialPublishingDeliveryPlan = {
  proposalId: 'proposal-1',
  actionId: 'action-1',
  platform: 'INSTAGRAM',
  accountRef: 'instagram-main',
  externalAccountId: '17841400000000000',
  contentCalendarItemId: 'content-1',
  contentRevision: 4,
  format: 'REEL',
  caption: 'Reviewed caption',
  assetReference: 'https://cdn.example.test/reel.mp4',
  scheduledFor: null,
  timezone: null,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Meta Instagram Reels provider', () => {
  it('defaults to OFF and only becomes ready with explicit server configuration', () => {
    expect(getMetaInstagramReelsProviderStatus({} as NodeJS.ProcessEnv)).toEqual({
      mode: 'OFF',
      ready: false,
    });
    expect(
      getMetaInstagramReelsProviderStatus({
        LUMINOL_META_PUBLISHING_MODE: 'INSTAGRAM_REELS',
      } as NodeJS.ProcessEnv),
    ).toEqual({ mode: 'MISCONFIGURED', ready: false });
    expect(
      getMetaInstagramReelsProviderStatus({
        LUMINOL_META_PUBLISHING_MODE: 'INSTAGRAM_REELS',
        LUMINOL_META_GRAPH_VERSION: 'v25.0',
        LUMINOL_META_ACCESS_TOKEN: 'server-token',
      } as NodeJS.ProcessEnv),
    ).toEqual({ mode: 'INSTAGRAM_REELS', ready: true });
  });

  it('fails closed when environment mode is off', () => {
    expect(() =>
      createMetaInstagramReelsProviderFromEnv({} as NodeJS.ProcessEnv),
    ).toThrowError(expect.objectContaining({ code: 'META_PROVIDER_OFF' }));
  });

  it(
    'creates an Instagram Reel container without putting the token in URL or body',
    async () => {
      const fetchImplementation = vi.fn(async () =>
        jsonResponse({ id: 'container-123' }),
      );
      const provider = createMetaInstagramReelsProvider({
        graphVersion: 'v25.0',
        accessToken: 'secret-token',
        fetchImplementation,
      });

      await expect(
        provider.begin({ plan, idempotencyKey: 'social-publish:v1:test' }),
      ).resolves.toEqual({ sessionReference: 'container-123' });

      expect(fetchImplementation).toHaveBeenCalledTimes(1);
      const [url, init] = fetchImplementation.mock.calls[0]!;
      expect(url).toBe(
        'https://graph.facebook.com/v25.0/17841400000000000/media',
      );
      expect(url).not.toContain('secret-token');
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer secret-token',
      });
      const body = String(init?.body);
      expect(body).toContain('media_type=REELS');
      expect(body).toContain(
        'video_url=https%3A%2F%2Fcdn.example.test%2Freel.mp4',
      );
      expect(body).toContain('caption=Reviewed+caption');
      expect(body).not.toContain('secret-token');
    },
  );

  it(
    'checks container readiness before publishing the persisted session',
    async () => {
      const fetchImplementation = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse({ status_code: 'FINISHED' }))
        .mockResolvedValueOnce(jsonResponse({ id: 'media-456' }));
      const provider = createMetaInstagramReelsProvider({
        graphVersion: 'v25.0',
        accessToken: 'secret-token',
        fetchImplementation,
      });

      await expect(
        provider.complete({
          plan,
          idempotencyKey: 'social-publish:v1:test',
          sessionReference: 'container-123',
        }),
      ).resolves.toEqual({ providerReference: 'media-456' });

      expect(fetchImplementation).toHaveBeenCalledTimes(2);
      expect(fetchImplementation.mock.calls[0]?.[0]).toBe(
        'https://graph.facebook.com/v25.0/container-123?fields=status_code',
      );
      expect(fetchImplementation.mock.calls[1]?.[0]).toBe(
        'https://graph.facebook.com/v25.0/17841400000000000/media_publish',
      );
      expect(String(fetchImplementation.mock.calls[1]?.[1]?.body)).toBe(
        'creation_id=container-123',
      );
    },
  );

  it(
    'treats a published container as completed without publishing it again',
    async () => {
      const fetchImplementation = vi.fn(async () =>
        jsonResponse({ status_code: 'PUBLISHED' }),
      );
      const provider = createMetaInstagramReelsProvider({
        graphVersion: 'v25.0',
        accessToken: 'secret-token',
        fetchImplementation,
      });

      await expect(
        provider.complete({
          plan,
          idempotencyKey: 'social-publish:v1:ambiguous-response',
          sessionReference: 'container-already-published',
        }),
      ).resolves.toEqual({
        providerReference: 'container-already-published',
      });

      expect(fetchImplementation).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'returns a bounded retryable code while Meta is still processing',
    async () => {
      const fetchImplementation = vi.fn(async () =>
        jsonResponse({ status_code: 'IN_PROGRESS' }),
      );
      const provider = createMetaInstagramReelsProvider({
        graphVersion: 'v25.0',
        accessToken: 'secret-token',
        fetchImplementation,
      });

      await expect(
        provider.complete({
          plan,
          idempotencyKey: 'social-publish:v1:test',
          sessionReference: 'container-123',
        }),
      ).rejects.toMatchObject({ code: 'META_MEDIA_PROCESSING_PENDING' });
    },
  );

  it(
    'rejects Facebook, unsupported formats and non-HTTPS assets before network access',
    async () => {
      const fetchImplementation = vi.fn(async () =>
        jsonResponse({ id: 'should-not-run' }),
      );
      const provider = createMetaInstagramReelsProvider({
        graphVersion: 'v25.0',
        accessToken: 'secret-token',
        fetchImplementation,
      });

      await expect(
        provider.begin({
          plan: { ...plan, platform: 'FACEBOOK' },
          idempotencyKey: 'one',
        }),
      ).rejects.toMatchObject({ code: 'META_PLATFORM_UNSUPPORTED' });
      await expect(
        provider.begin({
          plan: { ...plan, format: 'STATIC_POST' },
          idempotencyKey: 'two',
        }),
      ).rejects.toMatchObject({ code: 'META_FORMAT_UNSUPPORTED' });
      await expect(
        provider.begin({
          plan: { ...plan, assetReference: 'http://example.test/reel.mp4' },
          idempotencyKey: 'three',
        }),
      ).rejects.toMatchObject({ code: 'META_ASSET_URL_INVALID' });

      expect(fetchImplementation).not.toHaveBeenCalled();
    },
  );

  it('maps provider HTTP failures to bounded safe codes', async () => {
    const fetchImplementation = vi.fn(async () => jsonResponse({}, 429));
    const provider = createMetaInstagramReelsProvider({
      graphVersion: 'v25.0',
      accessToken: 'secret-token',
      fetchImplementation,
    });

    await expect(
      provider.begin({ plan, idempotencyKey: 'rate-limited' }),
    ).rejects.toBeInstanceOf(MetaSocialPublishingSafeError);
    await expect(
      provider.begin({ plan, idempotencyKey: 'rate-limited-again' }),
    ).rejects.toMatchObject({ code: 'META_RATE_LIMITED' });
  });
});
