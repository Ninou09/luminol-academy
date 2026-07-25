import { synchronizeClerkUser, verifyClerkWebhook } from '@luminol/auth';
import { headers } from 'next/headers';

export async function POST(request: Request): Promise<Response> {
  const headerStore = await headers();
  const id = headerStore.get('svix-id');
  const timestamp = headerStore.get('svix-timestamp');
  const signature = headerStore.get('svix-signature');
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!id || !timestamp || !signature || !secret) {
    return Response.json(
      { error: 'Invalid webhook configuration or headers' },
      { status: 400 },
    );
  }

  let event;
  try {
    event = verifyClerkWebhook(
      await request.text(),
      { id, timestamp, signature },
      secret,
    );
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
  try {
    await synchronizeClerkUser(event);
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: 'Synchronization failed' }, { status: 500 });
  }
}
