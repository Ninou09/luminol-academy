import {
  renderSocialPreviewImage,
  SOCIAL_PREVIEW_ALT,
  SOCIAL_PREVIEW_CONTENT_TYPE,
  SOCIAL_PREVIEW_SIZE,
} from '../lib/social-preview-image';

export const alt = SOCIAL_PREVIEW_ALT;
export const size = SOCIAL_PREVIEW_SIZE;
export const contentType = SOCIAL_PREVIEW_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderSocialPreviewImage();
}
