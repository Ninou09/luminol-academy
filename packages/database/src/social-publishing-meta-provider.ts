import { z } from 'zod';

import {
  SocialPublishingProviderSafeError,
  type ResumableSocialPublishingProvider,
} from './social-publishing-attempts';
import type { SocialPublishingDeliveryPlan } from './social-publishing-delivery';

const graphVersionSchema = z.string().trim().regex(/^v\d+\.\d+$/).max(20);
const accessTokenSchema = z.string().trim().min(1).max(4_096);
const providerReferenceSchema = z.string().trim().min(1).max(255);
const timeoutSchema = z.coerce.number().int().min(1_000).max(30_000);

const metaIdResponseSchema = z
  .object({ id: providerReferenceSchema })
  .passthrough();

const metaContainerStatusSchema = z
  .object({
    status_code: z.enum([
      'IN_PROGRESS',
      'FINISHED',
      'PUBLISHED',
      'ERROR',
      'EXPIRED',
    ]),
  })
  .passthrough();

export type MetaSocialPublishingErrorCode =
  | 'META_PROVIDER_OFF'
  | 'META_CONFIG_INVALID'
  | 'META_PLATFORM_UNSUPPORTED'
  | 'META_FORMAT_UNSUPPORTED'
  | 'META_ASSET_URL_INVALID'
  | 'META_AUTH_FAILED'
  | 'META_RATE_LIMITED'
  | 'META_TIMEOUT'
  | 'META_UNAVAILABLE'
  | 'META_REQUEST_FAILED'
  | 'META_NETWORK_ERROR'
  | 'META_RESPONSE_INVALID'
  | 'META_MEDIA_PROCESSING_PENDING'
  | 'META_MEDIA_PROCESSING_FAILED';

export class MetaSocialPublishingSafeError
  extends SocialPublishingProviderSafeError
{
  override readonly code: MetaSocialPublishingErrorCode;

  constructor(code: MetaSocialPublishingErrorCode) {
    super(code);
    this.name = 'MetaSocialPublishingSafeError';
    this.code = code;
  }
}

export type MetaInstagramReelsProviderStatus =
  | { mode: 'OFF'; ready: false }
  | { mode: 'INSTAGRAM_REELS'; ready: true }
  | { mode: 'MISCONFIGURED'; ready: false };

function normalizedMode(env: NodeJS.ProcessEnv) {
  return env.LUMINOL_META_PUBLISHING_MODE?.trim().toUpperCase() || 'OFF';
}

export function getMetaInstagramReelsProviderStatus(
  env: NodeJS.ProcessEnv = process.env,
): MetaInstagramReelsProviderStatus {
  const mode = normalizedMode(env);
  if (mode === 'OFF') return { mode: 'OFF', ready: false };
  if (mode !== 'INSTAGRAM_REELS') {
    return { mode: 'MISCONFIGURED', ready: false };
  }

  const graphVersion = graphVersionSchema.safeParse(
    env.LUMINOL_META_GRAPH_VERSION,
  );
  const accessToken = accessTokenSchema.safeParse(
    env.LUMINOL_META_ACCESS_TOKEN,
  );
  const timeout = timeoutSchema.safeParse(
    env.LUMINOL_META_REQUEST_TIMEOUT_MS ?? '10000',
  );

  return graphVersion.success && accessToken.success && timeout.success
    ? { mode: 'INSTAGRAM_REELS', ready: true }
    : { mode: 'MISCONFIGURED', ready: false };
}

function metaHttpError(status: number) {
  if (status === 401 || status === 403) {
    return new MetaSocialPublishingSafeError('META_AUTH_FAILED');
  }
  if (status === 429) {
    return new MetaSocialPublishingSafeError('META_RATE_LIMITED');
  }
  if (status >= 500) {
    return new MetaSocialPublishingSafeError('META_UNAVAILABLE');
  }
  return new MetaSocialPublishingSafeError('META_REQUEST_FAILED');
}

function isTimeoutError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

function requireHostedAssetUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new MetaSocialPublishingSafeError('META_ASSET_URL_INVALID');
  }

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new MetaSocialPublishingSafeError('META_ASSET_URL_INVALID');
  }
  return url.toString();
}

function assertInstagramReelPlan(plan: SocialPublishingDeliveryPlan) {
  if (plan.platform !== 'INSTAGRAM') {
    throw new MetaSocialPublishingSafeError('META_PLATFORM_UNSUPPORTED');
  }
  if (plan.format !== 'REEL') {
    throw new MetaSocialPublishingSafeError('META_FORMAT_UNSUPPORTED');
  }
  requireHostedAssetUrl(plan.assetReference);
}

async function parseMetaJson(
  response: Response,
  schema: z.ZodType,
): Promise<unknown> {
  if (!response.ok) throw metaHttpError(response.status);

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new MetaSocialPublishingSafeError('META_RESPONSE_INVALID');
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new MetaSocialPublishingSafeError('META_RESPONSE_INVALID');
  }
  return parsed.data;
}

export function createMetaInstagramReelsProvider(input: {
  graphVersion: string;
  accessToken: string;
  timeoutMs?: number;
  fetchImplementation?: typeof fetch;
}): ResumableSocialPublishingProvider {
  const graphVersion = graphVersionSchema.parse(input.graphVersion);
  const accessToken = accessTokenSchema.parse(input.accessToken);
  const timeoutMs = timeoutSchema.parse(input.timeoutMs ?? 10_000);
  const fetchImplementation = input.fetchImplementation ?? fetch;
  const baseUrl = `https://graph.facebook.com/${graphVersion}`;

  async function request(
    url: string,
    init: RequestInit,
    schema: z.ZodType,
  ) {
    let response: Response;
    try {
      response = await fetchImplementation(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(init.headers ?? {}),
        },
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (error instanceof MetaSocialPublishingSafeError) throw error;
      if (isTimeoutError(error)) {
        throw new MetaSocialPublishingSafeError('META_TIMEOUT');
      }
      throw new MetaSocialPublishingSafeError('META_NETWORK_ERROR');
    }

    return parseMetaJson(response, schema);
  }

  return {
    async begin({ plan }) {
      assertInstagramReelPlan(plan);
      const assetUrl = requireHostedAssetUrl(plan.assetReference);
      const body = new URLSearchParams({
        media_type: 'REELS',
        video_url: assetUrl,
        caption: plan.caption,
      });

      const result = (await request(
        `${baseUrl}/${encodeURIComponent(plan.externalAccountId)}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: body.toString(),
        },
        metaIdResponseSchema,
      )) as z.infer<typeof metaIdResponseSchema>;

      return { sessionReference: result.id };
    },

    async complete({ plan, sessionReference }) {
      assertInstagramReelPlan(plan);
      const containerId = providerReferenceSchema.parse(sessionReference);
      const status = (await request(
        `${baseUrl}/${encodeURIComponent(containerId)}?fields=status_code`,
        { method: 'GET' },
        metaContainerStatusSchema,
      )) as z.infer<typeof metaContainerStatusSchema>;

      if (status.status_code === 'IN_PROGRESS') {
        throw new MetaSocialPublishingSafeError(
          'META_MEDIA_PROCESSING_PENDING',
        );
      }
      if (
        status.status_code === 'ERROR' ||
        status.status_code === 'EXPIRED'
      ) {
        throw new MetaSocialPublishingSafeError(
          'META_MEDIA_PROCESSING_FAILED',
        );
      }
      if (status.status_code === 'PUBLISHED') {
        return { providerReference: containerId };
      }

      const body = new URLSearchParams({ creation_id: containerId });
      const result = (await request(
        `${baseUrl}/${encodeURIComponent(plan.externalAccountId)}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: body.toString(),
        },
        metaIdResponseSchema,
      )) as z.infer<typeof metaIdResponseSchema>;

      return { providerReference: result.id };
    },
  };
}

export function createMetaInstagramReelsProviderFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  options?: { fetchImplementation?: typeof fetch },
) {
  const status = getMetaInstagramReelsProviderStatus(env);
  if (status.mode === 'OFF') {
    throw new MetaSocialPublishingSafeError('META_PROVIDER_OFF');
  }
  if (!status.ready) {
    throw new MetaSocialPublishingSafeError('META_CONFIG_INVALID');
  }

  return createMetaInstagramReelsProvider({
    graphVersion: env.LUMINOL_META_GRAPH_VERSION!,
    accessToken: env.LUMINOL_META_ACCESS_TOKEN!,
    timeoutMs: Number(env.LUMINOL_META_REQUEST_TIMEOUT_MS ?? '10000'),
    fetchImplementation: options?.fetchImplementation,
  });
}
