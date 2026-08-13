import { parseLocale } from '@luminol/localization';

import { renderSocialPreviewImage } from '../../../lib/social-preview-image';

const GENERATED_PREVIEW_CACHE_CONTROL =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export function GET(request: Request) {
  const locale = parseLocale(new URL(request.url).searchParams.get('locale'));

  if (locale === 'ar') {
    return Response.redirect(
      new URL('/social-preview-ar.png', request.url),
      307,
    );
  }

  const response = renderSocialPreviewImage(locale);
  response.headers.set('Cache-Control', GENERATED_PREVIEW_CACHE_CONTROL);
  return response;
}
