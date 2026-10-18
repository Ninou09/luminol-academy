import {
  avatarPiece,
  type Avatar,
  type RewardStyle,
} from '@luminol/kids-learning';
import { kidsSpacing, ShapeGlyph, type Motion } from '@luminol/kids-ui';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Progress through an activity in the child's chosen reward style. Nothing
 * here flashes; the character only grows softly when motion is allowed.
 */
export function RewardStrip({
  style,
  avatar,
  earned,
  total,
  celebrating,
  motion,
}: {
  style: RewardStyle;
  avatar: Avatar;
  earned: number;
  total: number;
  celebrating: boolean;
  motion: Motion;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (style !== 'character' || !celebrating || !motion.enabled) return;
    const animation = Animated.sequence([
      Animated.timing(scale, {
        toValue: motion.scale,
        duration: motion.duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration / 2,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [celebrating, motion, scale, style]);

  if (style === 'quiet') return <View style={styles.placeholder} />;

  if (style === 'character') {
    const piece = avatarPiece(avatar);
    return (
      <View
        style={styles.row}
        accessibilityLabel={`التقدّم ${earned} من ${total}`}
        accessible
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <ShapeGlyph
            shape={piece.shape}
            color={piece.color}
            size={64}
            face={celebrating}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`النجوم ${earned} من ${total}`}
      testID="reward-stars"
    >
      {Array.from({ length: total }, (_, index) => (
        <ShapeGlyph
          key={index}
          shape="star"
          color="yellow"
          size={40}
          faded={index >= earned}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: kidsSpacing.sm,
    minHeight: 64,
    alignItems: 'center',
  },
  placeholder: {
    minHeight: 64,
  },
});
