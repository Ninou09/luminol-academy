import { phrase } from '@luminol/kids-content';
import { avatarPiece } from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChildScreen } from '../../src/components/ChildScreen';
import { SpeakableText } from '../../src/components/SpeakableText';
import { findReadable } from '../../src/sequences/pages';
import { SequencePicture } from '../../src/sequences/SequencePicture';
import { useSequences } from '../../src/sequences/useSequences';
import { useAppState } from '../../src/state/AppState';

/**
 * A routine followed one step at a time. Finished steps stay visible in the
 * strip so the child sees how far they have come and what is left.
 */
export default function RoutineScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { activeChild, services, sayItems } = useAppState();
  const { sequences } = useSequences(activeChild?.id);
  const [done, setDone] = useState(0);
  const routine =
    sequences && activeChild
      ? findReadable(
          routineId,
          sequences,
          services.media,
          'routine',
          activeChild,
        )
      : null;
  const current = routine?.pages[done];
  const finished = routine !== null && done >= routine.pages.length;

  const speak = useRef(sayItems);
  speak.current = sayItems;
  useEffect(() => {
    if (!routine) return;
    if (finished) {
      speak.current([{ utterance: phrase('routine.allDone') }]);
      return;
    }
    if (!current) return;
    speak.current([
      ...(done === 0 ? [{ utterance: routine.title }] : []),
      current.speech,
    ]);
  }, [routine?.id, current?.key, done, finished]);

  if (!activeChild) return <Redirect href="/" />;
  if (!sequences) return <ChildScreen current="stories">{null}</ChildScreen>;
  if (!routine) return <Redirect href="/stories" />;

  const avatar = avatarPiece(activeChild.avatar);

  return (
    <ChildScreen current="stories">
      <View style={styles.screen}>
        <SpeakableText utterance={routine.title} variant="title" heading />
        <View style={styles.strip} testID="routine-strip">
          {routine.pages.map((page, index) => (
            <View
              key={page.key}
              style={[
                styles.stripStep,
                index === done && styles.stripCurrent,
                index < done && styles.stripDone,
              ]}
              accessible
              accessibilityLabel={page.speech.utterance.text}
              accessibilityState={{ checked: index < done }}
              testID={`routine-step-${index}`}
            >
              <SequencePicture picture={page.picture} size={56} />
            </View>
          ))}
        </View>
        {finished || !current ? (
          <>
            <ShapeGlyph
              shape={avatar.shape}
              color={avatar.color}
              size={120}
              face
            />
            <SpeakableText
              utterance={phrase('routine.allDone')}
              variant="display"
              testID="routine-all-done"
            />
            <BigButton
              label={phrase('story.back').text}
              onPress={() => router.back()}
              testID="routine-back"
            />
          </>
        ) : (
          <>
            <View style={styles.step}>
              <SequencePicture picture={current.picture} size={240} />
              <SpeakableText
                utterance={current.speech.utterance}
                variant="display"
                testID="routine-text"
              />
            </View>
            <BigButton
              label={phrase('routine.done').text}
              onPress={() => setDone(done + 1)}
              testID="routine-done"
            />
          </>
        )}
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.sm,
  },
  stripStep: {
    padding: kidsSpacing.xs,
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  stripCurrent: {
    borderWidth: 4,
    borderColor: kidsColors.hint,
    backgroundColor: kidsColors.hintSoft,
  },
  stripDone: {
    opacity: 0.4,
  },
  step: {
    maxWidth: 720,
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.lg,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
});
