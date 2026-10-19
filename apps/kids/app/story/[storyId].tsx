import { phrase } from '@luminol/kids-content';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
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

/** A social story, one picture and sentence per page, read aloud. */
export default function StoryScreen() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const { activeChild, services, sayItems } = useAppState();
  const { sequences } = useSequences(activeChild?.id);
  const [page, setPage] = useState(0);
  const story = sequences
    ? findReadable(storyId, sequences, services.media, 'story')
    : null;
  const current = story?.pages[page];

  // Read each page when it opens; the first page starts with the title.
  const speak = useRef(sayItems);
  speak.current = sayItems;
  const pageCount = story?.pages.length ?? 0;
  useEffect(() => {
    if (!story || !current) return;
    speak.current([
      ...(page === 0 ? [{ utterance: story.title }] : []),
      current.speech,
      ...(page === pageCount - 1 ? [{ utterance: phrase('story.end') }] : []),
    ]);
    // Only a new page is read; reloading the same story is not.
  }, [story?.id, current?.key, page, pageCount]);

  if (!activeChild) return <Redirect href="/" />;
  if (!sequences) return <ChildScreen current="stories">{null}</ChildScreen>;
  if (!story || !current) return <Redirect href="/stories" />;

  const last = page === story.pages.length - 1;

  return (
    <ChildScreen current="stories">
      <View style={styles.screen}>
        <SpeakableText utterance={story.title} variant="title" heading />
        <View style={styles.page}>
          <SequencePicture picture={current.picture} size={240} />
          <SpeakableText
            utterance={current.speech.utterance}
            variant="display"
            testID="story-text"
          />
        </View>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`${page + 1} / ${story.pages.length}`}
        >
          {story.pages.map((item, index) => (
            <View
              key={item.key}
              style={[styles.dot, index === page && styles.dotCurrent]}
            />
          ))}
        </View>
        <View style={styles.buttons}>
          <BigButton
            label={phrase('story.previous').text}
            variant="secondary"
            disabled={page === 0}
            onPress={() => setPage(page - 1)}
            testID="story-previous"
          />
          {last ? (
            <BigButton
              label={phrase('story.back').text}
              onPress={() => router.back()}
              testID="story-back"
            />
          ) : (
            <BigButton
              label={phrase('story.next').text}
              onPress={() => setPage(page + 1)}
              testID="story-next"
            />
          )}
        </View>
        {last && (
          <SpeakableText utterance={phrase('story.end')} testID="story-end" />
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
  page: {
    maxWidth: 720,
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.lg,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  dots: {
    flexDirection: 'row',
    gap: kidsSpacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: kidsColors.line,
  },
  dotCurrent: {
    backgroundColor: kidsColors.accent,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
