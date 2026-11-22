import {
  LOCALE_COOKIE_NAME,
  LOCALE_REQUEST_HEADER,
} from '@luminol/localization';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from './proxy';

function request(
  path: string,
  init: { locale?: string; cookie?: string } = {},
) {
  const headers = new Headers();
  if (init.locale) headers.set(LOCALE_REQUEST_HEADER, init.locale);
  if (init.cookie)
    headers.set('cookie', `${LOCALE_COOKIE_NAME}=${init.cookie}`);
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

describe('public website locale proxy', () => {
  it('rewrites a localized path and passes the locale to the page', () => {
    const response = proxy(request('/ar/about'));
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:3000/about',
    );
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects an unprefixed path to the stored locale', () => {
    const response = proxy(request('/about', { cookie: 'fr' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/fr/about',
    );
  });

  it('lets its own rewritten request through instead of redirecting again', () => {
    const response = proxy(request('/about', { locale: 'ar', cookie: 'ar' }));
    expect(response.headers.get('location')).toBeNull();
    expect(response.status).toBe(200);
  });

  it('ignores an invalid locale header', () => {
    const response = proxy(request('/about', { locale: 'xx', cookie: 'en' }));
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/about',
    );
  });
});
