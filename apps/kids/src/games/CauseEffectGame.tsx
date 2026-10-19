import { phrase, tokenUtterance } from '@luminol/kids-content';
import {
  createThemedCauseEffectRound,
  levelSpec,
  SKILLS,
} from '@luminol/kids-learning';
import { kidsColors, kidsRadii } from '@luminol/kids-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useMotion } from '../motion/useMotion';
import { useAppState } from '../state/AppState';
import { GameFrame, type GameProps } from './GameFrame';
import { TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['cause-effect'];
const instruction = phrase('causeEffect.instruction');

/**
 * Touch the picture and it responds: it grows softly and says its name.
 * Touching the background never punishes; it only brings help closer.
 */
export function CauseEffectGame({ trials, theme, onDone }: GameProps) {
  const { activeChild } = useAppState();
  const motion = useMotion(activeChild?.sensory.animationLevel ?? 'low');
  const roundRef = useRef<ReturnType<
    typeof createThemedCauseEffectRound
  > | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current ? tokenUtterance(roundRef.current.token) : instruction,
    praise: () =>
      roundRef.current
        ? tokenUtterance(roundRef.current.token)
        : phrase('praise.great'),
  });
  const round = useMemo(
    () =>
      createThemedCauseEffectRound(
        levelSpec(skill, flow.level),
        theme,
        flow.random,
      ),
    [flow.level, flow.random, flow.trialIndex, theme],
  );
  roundRef.current = round;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const scale = useRef(new Animated.Value(1)).current;
  const celebrating = flow.phase === 'celebrating';
  const guided = flow.assist === 'guide' && !celebrating;
  const highlighted =
    (flow.assist === 'highlight' || flow.assist === 'guide') && !celebrating;

  useEffect(() => {
    if (!celebrating || !motion.enabled) return;
    const animation = Animated.sequence([
      Animated.timing(scale, {
        toValue: motion.scale,
        duration: motion.duration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [celebrating, motion, scale]);

  const side = Math.min(area.width, area.height);
  const size = Math.max(round.targetScale * side, 72);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View
        style={styles.area}
        onLayout={(event: LayoutChangeEvent) =>
          setArea(event.nativeEvent.layout)
        }
      >
        <Pressable
          style={[StyleSheet.absoluteFill, guided && styles.dimmed]}
          onPress={() => flow.respond(false)}
          accessible={false}
          importantForAccessibility="no"
          testID="cause-effect-background"
        />
        {side > 0 && (
          <Animated.View
            style={[
              styles.target,
              {
                width: size,
                height: size,
                left: round.position.x * area.width - size / 2,
                top: round.position.y * area.height - size / 2,
                transform: [{ scale }],
              },
              highlighted && styles.highlight,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tokenUtterance(round.token).text}
              onPress={() => flow.respond(true)}
              style={styles.press}
              testID="choice-correct"
            >
              <TokenView
                token={round.token}
                size={size * 0.9}
                face={celebrating}
              />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    overflow: 'hidden',
  },
  dimmed: {
    backgroundColor: kidsColors.surfaceSoft,
  },
  target: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.pill,
  },
  highlight: {
    borderWidth: 6,
    borderColor: kidsColors.hint,
    backgroundColor: kidsColors.hintSoft,
  },
  press: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
