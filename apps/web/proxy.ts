import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const firstSegment = request.nextUrl.pathname.split('/').filter(Boolean)[0];
  const locale = firstSegment === 'fr' || firstSegment === 'en' ? firstSegment : 'ar';

  requestHeaders.set('x-luminol-locale', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
