import { parseLocale } from '@luminol/localization';

import { renderSocialPreviewImage } from '../../../lib/social-preview-image';

export function GET(request: Request) {
  const locale = parseLocale(new URL(request.url).searchParams.get('locale'));

  if (locale === 'ar') {
    return Response.redirect(
      new URL('/social-preview-ar.png', request.url),
      307,
    );
  }

  return renderSocialPreviewImage(locale);
}
