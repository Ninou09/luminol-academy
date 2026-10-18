import type { PieceColor, Shape } from '@luminol/kids-learning';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { kidsColors, pieceColors } from './tokens';

function starPath(
  points: number,
  outer: number,
  inner: number,
  cx: number,
  cy: number,
) {
  const steps = points * 2;
  const commands = Array.from({ length: steps }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI * index) / points - Math.PI / 2;
    const x = (cx + radius * Math.cos(angle)).toFixed(2);
    const y = (cy + radius * Math.sin(angle)).toFixed(2);
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  });
  return `${commands.join(' ')} Z`;
}

const STAR = starPath(5, 46, 20, 50, 53);
const TRIANGLE = 'M50 8 L93 88 L7 88 Z';
const DIAMOND = 'M50 6 L92 50 L50 94 L8 50 Z';
const HEART =
  'M50 88 C22 68 6 50 10 31 C14 14 37 8 50 27 C63 8 86 14 90 31 C94 50 78 68 50 88 Z';

/** Where a friendly face sits inside each outline. */
const FACE_CENTER_Y: Record<Shape, number> = {
  circle: 50,
  square: 50,
  triangle: 64,
  star: 55,
  heart: 44,
  diamond: 50,
};

export type ShapeGlyphProps = {
  shape: Shape;
  color: PieceColor;
  size: number;
  /** Spoken by screen readers. Omit for decorative glyphs. */
  accessibilityLabel?: string;
  /** Draws a calm smiling face, used for the "character" reward. */
  face?: boolean;
  /** `outline` draws a neutral shape, e.g. for shape and size bin labels. */
  tone?: 'color' | 'outline';
  /** Faded glyphs mark rewards not earned yet. */
  faded?: boolean;
};

export function ShapeGlyph({
  shape,
  color,
  size,
  accessibilityLabel,
  face = false,
  tone = 'color',
  faded = false,
}: ShapeGlyphProps) {
  const { fill, outline } =
    tone === 'outline'
      ? { fill: kidsColors.surfaceSoft, outline: kidsColors.inkSoft }
      : pieceColors[color];
  const paint = {
    fill,
    stroke: outline,
    strokeWidth: 4,
    strokeLinejoin: 'round' as const,
  };
  const faceY = FACE_CENTER_Y[shape];
  const decorative = accessibilityLabel === undefined;

  return (
    <View
      style={{ width: size, height: size, opacity: faded ? 0.3 : 1 }}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityElementsHidden={decorative}
      testID={`shape-${shape}-${tone === 'outline' ? 'outline' : color}`}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {shape === 'circle' && <Circle cx={50} cy={50} r={43} {...paint} />}
        {shape === 'square' && (
          <Rect x={9} y={9} width={82} height={82} rx={12} {...paint} />
        )}
        {shape === 'triangle' && <Path d={TRIANGLE} {...paint} />}
        {shape === 'star' && <Path d={STAR} {...paint} />}
        {shape === 'heart' && <Path d={HEART} {...paint} />}
        {shape === 'diamond' && <Path d={DIAMOND} {...paint} />}
        {face && (
          <>
            <Circle cx={40} cy={faceY - 5} r={4.5} fill={kidsColors.ink} />
            <Circle cx={60} cy={faceY - 5} r={4.5} fill={kidsColors.ink} />
            <Path
              d={`M39 ${faceY + 6} Q50 ${faceY + 15} 61 ${faceY + 6}`}
              stroke={kidsColors.ink}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </Svg>
    </View>
  );
}
