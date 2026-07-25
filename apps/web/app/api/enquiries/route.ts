import { db } from '@luminol/database';
import { contactSchema } from '@luminol/validation';

const MAX_BODY_SIZE = 20_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_MAX = 5;

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

function getClientAddress(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return request.headers.get('x-real-ip');
}

function isRateLimited(address: string | null, now = Date.now()): boolean {
  if (!address) return false;

  const current = enquiryRateLimits.get(address);
  if (!current || current.resetAt <= now) {
    enquiryRateLimits.set(address, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request): Promise<Response> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_SIZE) {
    return Response.json({ error: 'Request is too large' }, { status: 413 });
  }

  if (isRateLimited(getClientAddress(request))) {
    return Response.json(
      { error: 'Too many enquiries. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return Response.json({ error: 'Request is too large' }, { status: 413 });
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: 'Please review the enquiry details and try again.' },
      { status: 400 },
    );
  }

  try {
    await db.enquiry.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        school: result.data.school,
        message: result.data.message,
        locale: result.data.locale,
        consent: result.data.consent,
      },
    });
  } catch {
    return Response.json(
      { error: 'We could not save your enquiry. Please try again.' },
      { status: 500 },
    );
  }

  return Response.json({ submitted: true }, { status: 201 });
}
