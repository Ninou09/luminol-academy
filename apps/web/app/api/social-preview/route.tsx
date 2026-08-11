import { parseLocale } from '@luminol/localization';

import { renderSocialPreviewImage } from '../../../lib/social-preview-image';

export function GET(request: Request) {
  const locale = parseLocale(new URL(request.url).searchParams.get('locale'));
  return renderSocialPreviewImage(locale);
}
