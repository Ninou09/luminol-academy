import { phrase } from '@luminol/kids-content';
import {
  BigButton,
  BREATHING,
  kidsColors,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ChildScreen } from '../src/components/ChildScreen';
import { useMotion } from '../src/motion/useMotion';
import { useAppState } from '../src/state/AppState';

type BreathPhase = 'inhale' | 'exhale';

/** Calm sound plays at most at 60% of the child's volume. */
const CALM_SOUND_SHARE = 0.6;

/** Calm-down corner: slow breathing, optional soft sound, back to play when ready. */
export default function CalmScreen() {
  const router = useRouter();
  const { activeChild, services, noteCalmVisit, say } = useAppState();
  const motion = useMotion(activeChild?.sensory.animationLevel ?? 'low');
  const volume = activeChild?.sensory.volume ?? 0;
  const [breath, setBreath] = useState<BreathPhase>('inhale');
  const [soundOn, setSoundOn] = useState(volume > 0);
  const scale = useRef(new Animated.Value(0.7)).current;
  const sayRef = useRef(say);
  sayRef.current = say;
  const arrival = useRef(noteCalmVisit);

  // Count each visit once, on arrival.
  useEffect(() => {
    void arrival.current();
    sayRef.current(phrase('calm.intro'));
  }, []);

  useEffect(() => {
    if (soundOn) services.calmSound.start(volume * CALM_SOUND_SHARE);
    else services.calmSound.stop();
    return () => services.calmSound.stop();
  }, [services, soundOn, volume]);

  useEffect(() => {
    const duration =
      breath === 'inhale' ? BREATHING.inhaleMs : BREATHING.exhaleMs;
    const timer = setTimeout(() => {
      const next = breath === 'inhale' ? 'exhale' : 'inhale';
      setBreath(next);
      sayRef.current(phrase(next === 'inhale' ? 'calm.inhale' : 'calm.exhale'));
    }, duration);
    if (motion.enabled) {
      Animated.timing(scale, {
        toValue: breath === 'inhale' ? 1 : 0.7,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
    }
    return () => clearTimeout(timer);
  }, [breath, motion.enabled, scale]);

  if (!activeChild) return <Redirect href="/" />;

  const breathWord = phrase(
    breath === 'inhale' ? 'calm.inhale' : 'calm.exhale',
  );

  return (
    <ChildScreen current="calm">
      <View style={styles.content}>
        <KidsText variant="display" align="center" heading>
          {phrase('calm.title').text}
        </KidsText>
        <KidsText align="center" tone="soft">
          {phrase('calm.intro').text}
        </KidsText>
        <View style={styles.circleArea}>
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ scale: motion.enabled ? scale : 1 }] },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={breathWord.text}
            accessible
          >
            <KidsText variant="display" align="center" testID="calm-breath">
              {breathWord.text}
            </KidsText>
          </Animated.View>
        </View>
        {volume > 0 && (
          <BigButton
            label={phrase(soundOn ? 'calm.soundOff' : 'calm.soundOn').text}
            variant="secondary"
            onPress={() => setSoundOn(!soundOn)}
            testID="calm-sound"
          />
        )}
        <BigButton
          label={phrase('calm.back').text}
          onPress={() => {
            say(phrase('calm.back'));
            router.back();
          }}
          testID="calm-back"
        />
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
  circleArea: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: kidsColors.accentSoft,
    borderWidth: 4,
    borderColor: kidsColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
