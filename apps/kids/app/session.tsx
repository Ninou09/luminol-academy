import { phrase, skillTitle, type Utterance } from '@luminol/kids-content';
import { firstThen, type ScheduleStep } from '@luminol/kids-learning';
import { BigButton, FirstThenBoard, kidsSpacing } from '@luminol/kids-ui';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityPicture } from '../src/components/ActivityPicture';
import { ChildScreen } from '../src/components/ChildScreen';
import { SpeakableText } from '../src/components/SpeakableText';
import { useAppState } from '../src/state/AppState';

function stepTitle(step: ScheduleStep): Utterance {
  return step.kind === 'finish'
    ? phrase('activity.finish')
    : skillTitle(step.skillId);
}

function scheduleUtterance(
  first: ScheduleStep,
  then: ScheduleStep | null,
): Utterance {
  const firstTitle = stepTitle(first);
  const firstPart = `${phrase('schedule.first').text} ${firstTitle.text}`;
  if (!then) return { key: `schedule.${firstTitle.key}`, text: firstPart };
  const thenTitle = stepTitle(then);
  return {
    key: `schedule.${firstTitle.key}.${thenTitle.key}`,
    text: `${firstPart}، ${phrase('schedule.then').text} ${thenTitle.text}`,
  };
}

/** The visual schedule: what happens first, and what comes next. */
export default function SessionScreen() {
  const router = useRouter();
  const { activeChild, session, startSession, endSession, say } = useAppState();

  useEffect(() => {
    if (activeChild && !session) void startSession();
  }, [activeChild, session, startSession]);

  const pair = session
    ? firstThen(session.steps, session.record.activitiesCompleted)
    : null;
  const announcement = pair ? scheduleUtterance(pair.first, pair.then) : null;
  const announcementText = announcement?.text;

  // Read the schedule aloud whenever the child returns to it.
  useFocusEffect(
    useCallback(() => {
      if (announcement) say(announcement);
    }, [announcementText, say]),
  );

  if (!activeChild) return <Redirect href="/" />;
  if (!pair) return <ChildScreen current="session">{null}</ChildScreen>;

  const { first, then } = pair;
  const isFinish = first.kind === 'finish';

  return (
    <ChildScreen current="session">
      <View style={styles.content}>
        <FirstThenBoard
          firstLabel={phrase('schedule.first').text}
          thenLabel={phrase('schedule.then').text}
          first={{
            label: stepTitle(first).text,
            picture: (
              <ActivityPicture step={first} avatar={activeChild.avatar} />
            ),
          }}
          then={
            then
              ? {
                  label: stepTitle(then).text,
                  picture: (
                    <ActivityPicture step={then} avatar={activeChild.avatar} />
                  ),
                }
              : null
          }
        />
        {isFinish ? (
          <>
            <SpeakableText
              utterance={phrase('schedule.allDone')}
              variant="display"
            />
            <BigButton
              label={phrase('nav.finish').text}
              onPress={() => {
                router.dismissTo('/');
                void endSession();
              }}
              testID="session-finish"
            />
          </>
        ) : (
          <BigButton
            label={phrase('schedule.start').text}
            onPress={() => {
              say(phrase('schedule.start'));
              router.push('/activity');
            }}
            testID="session-start"
          />
        )}
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: kidsSpacing.xl,
  },
});
