import { deactivateClerkUser, synchronizeClerkUser } from '@luminol/auth/sync';
import { Webhook } from 'svix';
import { z } from 'zod';

const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.enum(['user.created', 'user.updated']),
    data: z.unknown(),
  }),
  z.object({
    type: z.literal('user.deleted'),
    data: z.object({ id: z.string().min(1) }),
  }),
]);

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret)
    return new Response('Webhook is not configured', { status: 503 });

  const body = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
  };

  let payload: unknown;
  try {
    payload = new Webhook(secret).verify(body, headers);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = eventSchema.safeParse(payload);
  if (!event.success) return new Response('Unsupported event', { status: 400 });

  if (event.data.type === 'user.deleted')
    await deactivateClerkUser(event.data.data.id);
  else await synchronizeClerkUser(event.data.data);

  return Response.json({ received: true });
}
