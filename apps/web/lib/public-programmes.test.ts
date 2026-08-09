import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPublicProgrammes } from './sanity';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function publicProgramme(index: number) {
  return {
    _id: `programme-${index}`,
    title: `Programme ${index}`,
    summary: `A governed public programme summary for catalogue record ${index}.`,
    slug: { current: `programme-${index}` },
    school: 'languages',
    languages: ['en'],
    delivery: 'Hybrid',
    featured: false,
    image: null,
  };
}

describe('getPublicProgrammes', () => {
  it('fails closed when the CMS is unconfigured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'placeholder');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPublicProgrammes()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('queries only active published programme documents', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: [
            {
              ...publicProgramme(1),
              title: 'English Conversation',
              summary:
                'Build practical confidence for everyday English conversation.',
              slug: { current: 'english-conversation' },
              languages: ['en', 'fr'],
              featured: true,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPublicProgrammes()).resolves.toHaveLength(1);

    const endpoint = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const query = endpoint.searchParams.get('query') ?? '';
    expect(query).toContain('active == true');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('defined(slug.current)');
  });

  it('accepts a complete governed catalogue above 250 programmes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: Array.from({ length: 251 }, (_, index) =>
              publicProgramme(index),
            ),
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getPublicProgrammes()).resolves.toHaveLength(251);
  });

  it('fails closed for unknown public taxonomy values', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: [
              {
                ...publicProgramme(2),
                title: 'Unknown programme',
                summary:
                  'This record should not pass the governed public programme contract.',
                slug: { current: 'unknown-programme' },
                school: 'unknown',
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getPublicProgrammes()).resolves.toBeNull();
  });
});
