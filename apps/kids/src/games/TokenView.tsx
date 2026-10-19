import {
  isAacPicture,
  regionRect,
  type GamePicture,
  type Token,
} from '@luminol/kids-learning';
import { ShapeGlyph } from '@luminol/kids-ui';
import { Image, View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import { GAME_PICTURE_ASSETS } from './pictures';

/** A board picture or a game-only picture, shown whole (never cropped). */
function GamePictureImage({
  picture,
  size,
}: {
  picture: GamePicture;
  size: number;
}) {
  if (isAacPicture(picture))
    return (
      <CardPicture picture={{ kind: 'builtin', id: picture }} size={size} />
    );
  return (
    <Image
      source={GAME_PICTURE_ASSETS[picture]}
      resizeMode="contain"
      accessible={false}
      importantForAccessibility="no"
      style={{ width: size, height: size }}
      testID={`picture-${picture}`}
    />
  );
}

/** A game token: a code-drawn shape or a theme picture, shown whole. */
export function TokenView({
  token,
  size,
  label,
  face = false,
}: {
  token: Token;
  size: number;
  /** Spoken by screen readers; omit when a parent control is labelled. */
  label?: string;
  /** A calm smile on shapes for the cause-and-effect response. */
  face?: boolean;
}) {
  if (token.kind === 'shape') {
    return (
      <ShapeGlyph
        shape={token.piece.shape}
        color={token.piece.color}
        size={size}
        face={face}
        {...(label === undefined ? {} : { accessibilityLabel: label })}
      />
    );
  }
  return (
    <View
      accessible={label !== undefined}
      accessibilityRole={label === undefined ? undefined : 'image'}
      accessibilityLabel={label}
    >
      <GamePictureImage picture={token.picture} size={size} />
    </View>
  );
}

/**
 * One piece of a token for the picture puzzle. Layout is forced left-to-right
 * so the crop matches the piece's position in the picture, even in RTL.
 */
export function TokenPiece({
  token,
  size,
  pieces,
  region,
}: {
  token: Token;
  size: number;
  pieces: 2 | 4;
  region: number;
}) {
  const rect = regionRect(pieces, region, size);
  return (
    <View
      style={{
        width: rect.width,
        height: rect.height,
        overflow: 'hidden',
        direction: 'ltr',
      }}
    >
      <View style={{ position: 'absolute', left: -rect.x, top: -rect.y }}>
        <TokenView token={token} size={size} />
      </View>
    </View>
  );
}
