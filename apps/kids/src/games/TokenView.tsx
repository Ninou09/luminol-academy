import { regionRect, type Token } from '@luminol/kids-learning';
import { ShapeGlyph } from '@luminol/kids-ui';
import { View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';

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
      <CardPicture
        picture={{ kind: 'builtin', id: token.picture }}
        size={size}
      />
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
