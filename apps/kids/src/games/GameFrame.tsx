import type { Utterance } from '@luminol/kids-content';
import type { AssistStep } from '@luminol/kids-learning';
import { kidsSpacing, type ChoiceTileState } from '@luminol/kids-ui';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardStrip } from '../components/RewardStrip';
import { SpeakableText } from '../components/SpeakableText';
import { useMotion } from '../motion/useMotion';
import { useAppState } from '../state/AppState';
import type { TrialFlow } from './useTrialFlow';

export type GameProps = {
  trials: number;
  onDone: () => void;
};

/** Help is shown on the correct choice only; at `guide` the others fade out. */
export function choiceState(
  assist: AssistStep,
  isCorrect: boolean,
  celebrating: boolean,
): ChoiceTileState {
  if (celebrating) return isCorrect ? 'highlight' : 'idle';
  if (assist === 'guide') return isCorrect ? 'highlight' : 'dimmed';
  if (assist === 'highlight' && isCorrect) return 'highlight';
  return 'idle';
}

export function GameFrame({
  flow,
  instruction,
  onDone,
  children,
}: {
  flow: TrialFlow;
  instruction: Utterance;
  onDone: () => void;
  children: ReactNode;
}) {
  const { activeChild } = useAppState();
  const motion = useMotion(activeChild?.sensory.animationLevel ?? 'low');

  useEffect(() => {
    if (flow.phase === 'done') onDone();
  }, [flow.phase, onDone]);

  if (!activeChild || flow.phase === 'loading' || flow.phase === 'done')
    return null;

  return (
    <View style={styles.frame}>
      <RewardStrip
        style={activeChild.sensory.rewardStyle}
        avatar={activeChild.avatar}
        earned={flow.earned}
        total={flow.trials}
        celebrating={flow.phase === 'celebrating'}
        motion={motion}
      />
      <SpeakableText
        utterance={instruction}
        variant="title"
        testID="game-instruction"
      />
      <View style={styles.play}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    gap: kidsSpacing.md,
  },
  play: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.xl,
  },
});
