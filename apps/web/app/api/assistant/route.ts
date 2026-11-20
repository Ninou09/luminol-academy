import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { buildAssistantSystemPrompt } from '../../../lib/assistant-knowledge.server';
import { crisisReply, looksLikeCrisis } from '../../../lib/assistant-safety';

/**
 * Luminol Assistant: answers questions about the academy from the site's
 * own facts and hands visitors over to a person. Conversations are not
 * stored by Luminol. Switched on only when ANTHROPIC_API_KEY is set.
 */
export const runtime = 'nodejs';

const MODEL = process.env.LUMINOL_ASSISTANT_MODEL?.trim() || 'claude-haiku-5-5';
const WINDOW_MS = 10 * 60 * 1_000;
const MAX_PER_WINDOW = 30;
const limits = new Map<string, { count: number; resetAt: number }>();

const requestSchema = z.object({
  locale: z.enum(['en', 'fr', 'ar']).default('en'),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1_200),
      }),
    )
    .min(1)
    .max(16)
    .refine(
      (messages) => messages[0]?.role === 'user',
      'Must start with the visitor',
    )
    .refine(
      (messages) => messages.at(-1)?.role === 'user',
      'Must end with the visitor',
    ),
});

const unavailable: Record<'en' | 'fr' | 'ar', string> = {
  en: 'The assistant is not available right now. Please message us on WhatsApp (+213 556 91 45 17) or call reception (+213 777 07 71 97).',
  fr: 'L’assistant n’est pas disponible pour le moment. Écrivez-nous sur WhatsApp (+213 556 91 45 17) ou appelez l’accueil (+213 777 07 71 97).',
  ar: 'المساعد غير متاح حاليًا. راسلنا على واتساب ‎(+213 556 91 45 17) أو اتصل بالاستقبال ‎(+213 777 07 71 97).',
};

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) return null;
  client ??= new Anthropic({ maxRetries: 1, timeout: 30_000 });
  return client;
}

function clientAddress(request: Request): string | null {
  if (process.env.VERCEL !== '1') return null;
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')
  );
}

function limited(address: string | null, now = Date.now()) {
  if (!address) return false;
  const entry = limits.get(address);
  if (!entry || entry.resetAt <= now) {
    if (limits.size > 2_000) limits.clear();
    limits.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function textStream(text: string, status = 200) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return textStream('Forbidden', 403);
  }
  if (limited(clientAddress(request))) {
    return textStream(
      'Too many messages. Please try again in a few minutes.',
      429,
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    const raw = await request.text();
    if (raw.length > 24_000) return textStream('Too large', 413);
    parsed = requestSchema.parse(JSON.parse(raw));
  } catch {
    return textStream('Invalid request', 400);
  }
  const { locale, messages } = parsed;

  // Safety first: crisis messages get human contacts without the model.
  if (looksLikeCrisis(messages.at(-1)!.content)) {
    return textStream(crisisReply[locale]);
  }

  const anthropic = getClient();
  if (!anthropic) return textStream(unavailable[locale], 503);

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1_024,
    output_config: { effort: 'low' },
    system: [
      {
        type: 'text',
        text: buildAssistantSystemPrompt(),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wrote = false;
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            wrote = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal' || !wrote) {
          controller.enqueue(
            encoder.encode(
              wrote ? `\n\n${unavailable[locale]}` : unavailable[locale],
            ),
          );
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.error('Assistant rate limited');
        } else if (error instanceof Anthropic.APIError) {
          console.error('Assistant API error', error.status);
        } else {
          console.error('Assistant stream failed');
        }
        controller.enqueue(
          encoder.encode(
            wrote ? `\n\n${unavailable[locale]}` : unavailable[locale],
          ),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
