import { describe, expect, it } from 'vitest';
import { hasPlatformPermission } from './authorization';

const permission = { permission: { key: 'certificate:audit:read' } };

describe('platform authorization', () => {
  it('requires the trusted platform admin role as well as the permission', () => {
    expect(
      hasPlatformPermission(
        [{ role: { key: 'organization_admin', permissions: [permission] } }],
        'certificate:audit:read',
      ),
    ).toBe(false);
  });

  it('rejects a platform admin whose permission was not assigned', () => {
    expect(
      hasPlatformPermission(
        [{ role: { key: 'admin', permissions: [] } }],
        'certificate:audit:read',
      ),
    ).toBe(false);
  });

  it('allows only a platform admin with the server-side permission', () => {
    expect(
      hasPlatformPermission(
        [{ role: { key: 'admin', permissions: [permission] } }],
        'certificate:audit:read',
      ),
    ).toBe(true);
  });
});
