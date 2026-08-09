import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPublicProgrammes } from './sanity';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

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
              _id: 'programme-1',
              title: 'English Conversation',
              summary:
                'Build practical confidence for everyday English conversation.',
              slug: { current: 'english-conversation' },
              school: 'languages',
              languages: ['en', 'fr'],
              delivery: 'Hybrid',
              featured: true,
              image: null,
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

  it('fails closed for unknown public taxonomy values', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: [
              {
                _id: 'programme-2',
                title: 'Unknown programme',
                summary:
                  'This record should not pass the governed public programme contract.',
                slug: { current: 'unknown-programme' },
                school: 'unknown',
                languages: ['en'],
                featured: false,
                image: null,
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
