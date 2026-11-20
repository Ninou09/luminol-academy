import { describe, expect, it } from 'vitest';
import { hasPermission, hasPlatformPermission } from './authorization';

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

describe('scoped staff authorization', () => {
  const enquiryWork = { permission: { key: 'enquiry:work' } };

  it('allows any persisted role that carries the permission', () => {
    expect(
      hasPermission(
        [{ role: { key: 'enquiry-agent', permissions: [enquiryWork] } }],
        'enquiry:work',
      ),
    ).toBe(true);
  });

  it('rejects roles without the permission', () => {
    expect(
      hasPermission(
        [{ role: { key: 'enquiry-agent', permissions: [enquiryWork] } }],
        'team:manage',
      ),
    ).toBe(false);
    expect(hasPermission([], 'enquiry:work')).toBe(false);
  });
});
