import { db } from '@luminol/database';
import { after } from 'next/server';
import { z } from 'zod';

import { sendTelegramEnquiryAlert } from '../../../lib/telegram-notify.server';
import { verifyTurnstileToken } from '../../../lib/turnstile.server';

/**
 * Newsletter sign-ups. They are stored as enquiries with source
 * "newsletter" so the team sees them in the existing enquiry desk without a
 * database migration. Consent to receive news is explicit and required.
 */
const MAX_BODY_SIZE = 4_000;
const WINDOW_MS = 15 * 60 * 1_000;
const MAX_PER_WINDOW = 3;
const limits = new Map<string, { count: number; resetAt: number }>();
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

const newsletterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  interest: z.enum(['PSYCHOLOGY', 'LANGUAGES', 'TRAINING', 'GENERAL']),
  locale: z.enum(['en', 'fr', 'ar']).default('en'),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: NO_STORE });
}

function clientAddress(request: Request): string | null {
  if (process.env.VERCEL !== '1') return null;
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
}

function rateLimited(address: string | null, now = Date.now()): boolean {
  if (!address) return false;
  const entry = limits.get(address);
  if (!entry || entry.resetAt <= now) {
    limits.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ error: 'Cross-site submission is not allowed' }, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Content-Type must be application/json' }, 415);
  }
  const address = clientAddress(request);
  if (rateLimited(address)) {
    return json({ error: 'Too many requests. Please try again later.' }, 429);
  }
  const human = await verifyTurnstileToken(
    request.headers.get('x-turnstile-token'),
    address,
  );
  if (!human) return json({ error: 'Please confirm the security check.' }, 400);

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_SIZE) return json({ error: 'Too large' }, 413);
    body = JSON.parse(raw) as unknown;
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const result = newsletterSchema.safeParse(body);
  if (!result.success) {
    return json({ error: 'Please check your name and email.' }, 400);
  }
  const data = result.data;

  let saved: { id: string };
  try {
    saved = await db.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        preferredContact: 'EMAIL',
        school: data.interest,
        message: 'Newsletter subscription: news, events and programmes.',
        locale: data.locale,
        consent: true,
        source: 'newsletter',
        landingPath: '/newsletter',
      },
      select: { id: true },
    });
  } catch {
    return json({ error: 'We could not save your subscription.' }, 500);
  }

  after(async () => {
    await sendTelegramEnquiryAlert({
      id: saved.id,
      name: `${data.name} (newsletter)`,
      preferredContact: 'EMAIL',
      phone: null,
      email: data.email,
      school: data.interest,
      programmeTitle: null,
      locale: data.locale,
    });
  });

  return json({ subscribed: true }, 201);
}
