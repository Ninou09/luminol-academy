import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const cases = [
  {
    app: 'admin',
    publicRoutes: [
      "pathname === '/sign-in'",
      "pathname === '/api/webhooks/clerk'",
    ],
  },
  {
    app: 'portal',
    publicRoutes: [
      "pathname === '/sign-in'",
      "pathname === '/sign-up'",
      "pathname.startsWith('/sign-up/')",
    ],
  },
];

describe('Next.js 16 Clerk proxy conventions', () => {
  for (const { app, publicRoutes } of cases) {
    it(`preserves ${app} route protection in proxy.ts`, () => {
      const appRoot = resolve(`apps/${app}`);
      const proxyPath = resolve(appRoot, 'proxy.ts');
      const middlewarePath = resolve(appRoot, 'middleware.ts');

      expect(existsSync(proxyPath)).toBe(true);
      expect(existsSync(middlewarePath)).toBe(false);

      const source = readFileSync(proxyPath, 'utf8');
      expect(source).toContain('clerkMiddleware');
      expect(source).toContain('resolveLocaleRequest');
      expect(source).toContain('isPublicPathname');
      expect(source).toContain('decision.pathname');
      expect(source).toContain('await auth.protect()');
      expect(source).toContain('LOCALE_REQUEST_HEADER');
      expect(source).toContain('LOCALE_COOKIE_NAME');
      expect(source).toContain('NextResponse.redirect(request.nextUrl.clone())');
      expect(source).toContain("'/(api|trpc)(.*)'");

      const localePersistenceIndex = source.indexOf(
        'request.cookies.get(LOCALE_COOKIE_NAME)?.value !== decision.locale',
      );
      const localizedProtectionIndex = source.indexOf(
        'if (!isPublicPathname(decision.pathname)) await auth.protect();',
      );
      expect(localePersistenceIndex).toBeGreaterThan(-1);
      expect(localizedProtectionIndex).toBeGreaterThan(localePersistenceIndex);

      for (const route of publicRoutes) {
        expect(source).toContain(route);
      }
    });
  }
});
