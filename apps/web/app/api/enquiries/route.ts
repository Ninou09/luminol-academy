import { db } from '@luminol/database';
import { contactSchema } from '@luminol/validation';

import { getPublicProgrammeBySlug } from '../../../lib/programme-detail';

const MAX_BODY_SIZE = 20_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_MAX = 5;
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForEnquiries = globalThis as unknown as {
  enquiryRateLimits?: Map<string, RateLimitEntry>;
};

const enquiryRateLimits =
  globalForEnquiries.enquiryRateLimits ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== 'production') {
  globalForEnquiries.enquiryRateLimits = enquiryRateLimits;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...headers },
  });
}

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  if (!contentType) return false;
  return (
    contentType.split(';', 1)[0]?.trim().toLowerCase() === 'application/json'
  );
}

function isExplicitCrossSiteRequest(request: Request): boolean {
  return (
    request.headers.get('sec-fetch-site')?.trim().toLowerCase() === 'cross-site'
  );
}

function getClientAddress(request: Request): string | null {
  // Vercel removes the incoming x-forwarded-for value and supplies its trusted
  // edge-derived value. Outside that boundary, do not trust caller headers.
  if (process.env.VERCEL !== '1') return null;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return request.headers.get('x-real-ip');
}

function getRateLimitRetryAfter(
  address: string | null,
  now = Date.now(),
): number | null {
  if (!address) return null;

  const current = enquiryRateLimits.get(address);
  if (enquiryRateLimits.size > 1_000) {
    for (const [key, entry] of enquiryRateLimits) {
      if (entry.resetAt <= now) enquiryRateLimits.delete(key);
    }
  }
  if (!current || current.resetAt <= now) {
    enquiryRateLimits.set(address, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  current.count += 1;
  if (current.count <= RATE_LIMIT_MAX) return null;

  return Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
}

export async function POST(request: Request): Promise<Response> {
  if (isExplicitCrossSiteRequest(request)) {
    return jsonResponse({ error: 'Cross-site submission is not allowed' }, 403);
  }

  if (!hasJsonContentType(request)) {
    return jsonResponse(
      { error: 'Content-Type must be application/json' },
      415,
    );
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_SIZE) {
    return jsonResponse({ error: 'Request is too large' }, 413);
  }

  const retryAfter = getRateLimitRetryAfter(getClientAddress(request));
  if (retryAfter !== null) {
    return jsonResponse(
      { error: 'Too many enquiries. Please try again later.' },
      429,
      { 'Retry-After': String(retryAfter) },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return jsonResponse({ error: 'Request is too large' }, 413);
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return jsonResponse(
      { error: 'Please review the enquiry details and try again.' },
      400,
    );
  }

  const programme = result.data.programmeSlug
    ? await getPublicProgrammeBySlug(result.data.programmeSlug).catch(
        () => null,
      )
    : null;

  try {
    await db.enquiry.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        city: result.data.city,
        preferredContact: result.data.preferredContact,
        deliveryPreference: result.data.deliveryPreference,
        timingPreference: result.data.timingPreference,
        school: result.data.school,
        programmeSlug: programme?.slug.current ?? null,
        programmeTitleSnapshot: programme?.title ?? null,
        message: result.data.message,
        locale: result.data.locale,
        consent: result.data.consent,
      },
    });
  } catch {
    return jsonResponse(
      { error: 'We could not save your enquiry. Please try again.' },
      500,
    );
  }

  return jsonResponse({ submitted: true }, 201);
}
