import { expect, test } from '@playwright/test';

function parseContentSecurityPolicy(value: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();

  for (const directive of value
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    const [name, ...sources] = directive.split(/\s+/);
    const normalizedName = name.toLowerCase();
    if (directives.has(normalizedName)) {
      throw new Error(`Duplicate CSP directive: ${normalizedName}`);
    }
    directives.set(normalizedName, sources);
  }

  return directives;
}

test('localized public responses preserve the governed security-header contract', async ({
  page,
}) => {
  for (const route of ['/en', '/fr/about', '/ar/contact']) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const headers = response!.headers();
    const contentSecurityPolicy = headers['content-security-policy'];

    expect(contentSecurityPolicy).toBeTruthy();
    const directives = parseContentSecurityPolicy(contentSecurityPolicy!);
    expect(directives.get('default-src')).toEqual(["'self'"]);
    expect(directives.get('frame-ancestors')).toEqual(["'none'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
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
