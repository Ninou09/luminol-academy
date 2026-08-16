import type { EmailProvider } from '@luminol/notifications';
import { z } from 'zod';

export type ResendEmailProviderOptions = {
  apiKey: string;
  from: string;
  timeoutMs: number;
  fetchImplementation?: typeof fetch;
};

export function createResendEmailProvider({
  apiKey,
  from,
  timeoutMs,
  fetchImplementation = fetch,
}: ResendEmailProviderOptions): EmailProvider {
  return {
    async send(input) {
      const response = await fetchImplementation(
        'https://api.resend.com/emails',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': input.idempotencyKey,
          },
          body: JSON.stringify({
            from,
            to: [input.to],
            subject: input.subject,
            text: input.text,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        },
      );

      if (!response.ok)
        throw new Error(`Email provider returned ${response.status}`);

      const body: unknown = await response.json();
      return {
        providerReference: z.object({ id: z.string().min(1) }).parse(body).id,
      };
    },
  };
}
