import { phrase } from '@luminol/kids-content';
import type { ActivityStep } from '@luminol/kids-learning';
import { BigButton, kidsSpacing } from '@luminol/kids-ui';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChildScreen } from '../src/components/ChildScreen';
import { RewardStrip } from '../src/components/RewardStrip';
import { SpeakableText } from '../src/components/SpeakableText';
import { GameForSkill } from '../src/games/GameForSkill';
import { useMotion } from '../src/motion/useMotion';
import { useAppState } from '../src/state/AppState';

/** Plays the current schedule step, then hands back to the schedule. */
export default function ActivityScreen() {
  const router = useRouter();
  const { activeChild, session, completeActivity, say } = useAppState();
  const motion = useMotion(activeChild?.sensory.animationLevel ?? 'low');
  // Fix the step on entry so finishing it doesn't swap in the next game here.
  const [step] = useState<ActivityStep | null>(() => {
    const current = session?.steps[session.record.activitiesCompleted];
    return current?.kind === 'activity' ? current : null;
  });
  const [done, setDone] = useState(false);

  const onDone = useCallback(() => {
    setDone(true);
    say(phrase('activity.done'));
    void completeActivity();
  }, [completeActivity, say]);

  if (!activeChild) return <Redirect href="/" />;
  if (!step) return <Redirect href="/session" />;

  return (
    <ChildScreen current="activity">
      {done ? (
        <View style={styles.done}>
          <RewardStrip
            style={activeChild.sensory.rewardStyle}
            avatar={activeChild.avatar}
            earned={step.trials}
            total={step.trials}
            celebrating
            motion={motion}
          />
          <SpeakableText
            utterance={phrase('activity.done')}
            variant="display"
          />
          <BigButton
            label={phrase('nav.schedule').text}
            onPress={() => router.dismissTo('/session')}
            testID="activity-back"
          />
        </View>
      ) : (
        <GameForSkill
          skillId={step.skillId}
          trials={step.trials}
          onDone={onDone}
        />
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  done: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.xl,
  },
});
