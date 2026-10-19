import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { kidsColors, kidsRadii, kidsSpacing, touchTargets } from './tokens';

/**
 * `highlight` softly rings the tile; `dimmed` fades and disables it so the
 * child can only reach the guided answer.
 */
export type ChoiceTileState = 'idle' | 'highlight' | 'dimmed';

export type ChoiceTileProps = {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  state?: ChoiceTileState;
  size?: number;
  testID?: string;
};

export function ChoiceTile({
  children,
  onPress,
  accessibilityLabel,
  state = 'idle',
  size = touchTargets.childLarge * 1.5,
  testID,
}: ChoiceTileProps) {
  const dimmed = state === 'dimmed';
  const highlighted = state === 'highlight';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: dimmed }}
      disabled={dimmed}
      onPress={onPress}
      testID={testID}
      style={[
        styles.tile,
        {
          width: Math.max(size, touchTargets.child),
          height: Math.max(size, touchTargets.child),
          borderColor: highlighted ? kidsColors.hint : kidsColors.line,
          borderWidth: highlighted ? 6 : 2,
          backgroundColor: highlighted
            ? kidsColors.hintSoft
            : kidsColors.surface,
          opacity: dimmed ? 0.3 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: kidsRadii.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: kidsSpacing.sm,
  },
});
