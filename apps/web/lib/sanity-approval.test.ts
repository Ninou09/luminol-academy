import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProgrammesForSchool } from './sanity';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('programme image publication approval', () => {
  it('projects image data only after explicit publication approval', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ result: [] }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getProgrammesForSchool('languages')).resolves.toEqual([]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const query = requestUrl.searchParams.get('query') ?? '';

    expect(query).toContain('"image": select(');
    expect(query).toContain('defined(image.asset) &&');
    expect(query).toContain(
      'coalesce(image.publicationApproved, false) == true',
    );
  });
});
