const PUBLIC_AUTH_PATHS = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
] as const;

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
