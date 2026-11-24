const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://*.sanity.io https://vercel.live https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.sanity.io https://*.api.sanity.io https://vercel.live wss://*.clerk.com https://clerk-telemetry.com",
  'frame-src https://*.clerk.accounts.dev https://*.clerk.com https://vercel.live https://challenges.cloudflare.com',
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

export const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/**
 * The public website embeds the academy's Google map and lets visitors share
 * their location to plan a route, so it allows Google Maps frames and
 * same-origin geolocation. React's development build also needs `eval` for
 * debugging; production never receives 'unsafe-eval'.
 */
const isDevelopment = globalThis.process?.env?.NODE_ENV === 'development';
const publicWebsiteCsp = csp
  .replace(
    "script-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  )
  .replace(
    'frame-src https://*.clerk.accounts.dev',
    'frame-src https://www.google.com https://maps.google.com https://*.clerk.accounts.dev',
  );

export const publicWebsiteSecurityHeaders = securityHeaders.map((header) => {
  if (header.key === 'Content-Security-Policy') {
    return { key: header.key, value: publicWebsiteCsp };
  }
  if (header.key === 'Permissions-Policy') {
    return {
      key: header.key,
      value: 'camera=(), microphone=(), geolocation=(self)',
    };
  }
  return header;
});

export const privateCacheHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
];

export const adminProtectedResponseSource =
  '/((?!_next/static|_next/image|favicon.ico|sign-in(?:/|$)).*)';
export const portalProtectedResponseSource =
  '/((?!_next/static|_next/image|favicon.ico|sign-in(?:/|$)|sign-up(?:/|$)).*)';
