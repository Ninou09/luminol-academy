import { describe, expect, it } from 'vitest';
import { isPublicAuthPath } from './routes';

describe('protected route policy', () => {
  it.each(['/sign-in', '/sign-up', '/api/webhooks/clerk'])(
    'allows the public authentication path %s',
    (path) => expect(isPublicAuthPath(path)).toBe(true),
  );
  it.each(['/', '/students', '/api/admin/users'])('protects %s', (path) =>
    expect(isPublicAuthPath(path)).toBe(false),
  );
});
