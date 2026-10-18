import type { PictureChoice } from '@luminol/kids-learning';
import { Image } from 'react-native';

import { useAppState } from '../state/AppState';
import { AAC_PICTURE_ASSETS } from './pictures';

/** A board picture, shown whole (never cropped), built-in or a parent's photo. */
export function CardPicture({
  picture,
  size,
}: {
  picture: PictureChoice;
  size: number;
}) {
  const { services } = useAppState();
  const source =
    picture.kind === 'builtin'
      ? AAC_PICTURE_ASSETS[picture.id]
      : { uri: services.media.uri(picture.path) };
  return (
    <Image
      source={source}
      resizeMode="contain"
      accessible={false}
      importantForAccessibility="no"
      style={{ width: size, height: size }}
      testID={
        picture.kind === 'builtin'
          ? `picture-${picture.id}`
          : `picture-photo-${picture.path}`
      }
    />
  );
}
