import {
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  LOCALE_REQUEST_HEADER,
  resolveLocaleRequest,
  type Locale,
} from '@luminol/localization';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const localeRoutingOptions = {
  bypassPrefixes: ['/api', '/trpc', '/.well-known'],
  bypassExact: ['/robots.txt', '/sitemap.xml'],
} as const;

function persistLocale(
  response: NextResponse,
  request: NextRequest,
  locale: Locale,
) {
  if (request.cookies.get(LOCALE_COOKIE_NAME)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const decision = resolveLocaleRequest(
    request.nextUrl.pathname,
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    localeRoutingOptions,
  );

  if (decision.kind === 'bypass') return NextResponse.next();

  if (decision.kind === 'redirect') {
    const destination = request.nextUrl.clone();
    destination.pathname = decision.pathname;
    return persistLocale(
      NextResponse.redirect(destination),
      request,
      decision.locale,
    );
  }

  const destination = request.nextUrl.clone();
  destination.pathname = decision.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_REQUEST_HEADER, decision.locale);

  return persistLocale(
    NextResponse.rewrite(destination, {
      request: { headers: requestHeaders },
    }),
    request,
    decision.locale,
  );
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
