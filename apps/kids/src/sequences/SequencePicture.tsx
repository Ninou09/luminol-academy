import type { StepPicture } from '@luminol/kids-learning';
import { Image } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import {
  GAME_PICTURE_ASSETS,
  ROUTINE_PICTURE_ASSETS,
  STORY_SCENE_ASSETS,
} from '../games/pictures';

/**
 * A step's picture, shown whole: board picture, parent photo, routine step,
 * game art or scene.
 */
export function SequencePicture({
  picture,
  size,
}: {
  picture: StepPicture;
  size: number;
}) {
  if (picture.kind === 'builtin' || picture.kind === 'photo')
    return <CardPicture picture={picture} size={size} />;
  const source =
    picture.kind === 'game'
      ? GAME_PICTURE_ASSETS[picture.id]
      : picture.kind === 'routine'
        ? ROUTINE_PICTURE_ASSETS[picture.id]
        : STORY_SCENE_ASSETS[picture.id];
  return (
    <Image
      source={source}
      resizeMode="contain"
      accessible={false}
      importantForAccessibility="no"
      style={{ width: size, height: size }}
      testID={`picture-${picture.id}`}
    />
  );
}
