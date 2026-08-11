import type { Locale } from '@luminol/localization';

import {
  getSocialPreviewAlt,
  SOCIAL_PREVIEW_SIZE,
} from './social-preview-image';

export function getSocialPreviewImage(locale: Locale) {
  return {
    url: `/api/social-preview?locale=${locale}`,
    width: SOCIAL_PREVIEW_SIZE.width,
    height: SOCIAL_PREVIEW_SIZE.height,
    alt: getSocialPreviewAlt(locale),
  } as const;
}
