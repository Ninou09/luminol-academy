import {
  createMetaInstagramReelsProviderFromEnv,
  db,
  dispatchDueInstagramReelsPublishingAttempts,
} from '@luminol/database';

import { handleSocialPublishingSchedulerRequest } from '../../../../../lib/social-publishing-scheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handleSocialPublishingSchedulerRequest(request, process.env, {
    createProvider: (environment) =>
      createMetaInstagramReelsProviderFromEnv(environment),
    dispatchBatch: ({ provider, limit, now }) =>
      dispatchDueInstagramReelsPublishingAttempts(db, {
        provider,
        limit,
        now,
      }),
    now: () => new Date(),
  });
}
