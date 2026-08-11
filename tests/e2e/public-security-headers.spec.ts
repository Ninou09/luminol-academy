import { expect, test } from '@playwright/test';

test('localized public responses preserve the governed security-header contract', async ({
  page,
}) => {
  for (const route of ['/en', '/fr/about', '/ar/contact']) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();

    const headers = response!.headers();
    const contentSecurityPolicy = headers['content-security-policy'];

    expect(contentSecurityPolicy).toBeTruthy();
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['x-dns-prefetch-control']).toBe('off');

    const permissionsPolicy = headers['permissions-policy'];
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');
  }
});
