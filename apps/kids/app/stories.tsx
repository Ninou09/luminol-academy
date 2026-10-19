import { phrase, storyTitle, type Utterance } from '@luminol/kids-content';
import {
  availableStories,
  BUILTIN_STORIES,
  type StepPicture,
} from '@luminol/kids-learning';
import {
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  touchTargets,
} from '@luminol/kids-ui';
import { Redirect, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ChildScreen } from '../src/components/ChildScreen';
import { SpeakableText } from '../src/components/SpeakableText';
import { parentTitle } from '../src/sequences/pages';
import { SequencePicture } from '../src/sequences/SequencePicture';
import { useSequences } from '../src/sequences/useSequences';
import { useAppState } from '../src/state/AppState';

type Entry = {
  id: string;
  title: Utterance;
  picture: StepPicture;
  href: Href;
};

function Tile({ entry }: { entry: Entry }) {
  const router = useRouter();
  const { say } = useAppState();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry.title.text}
      onPress={() => {
        say(entry.title);
        router.push(entry.href);
      }}
      style={styles.tile}
      testID={`open-${entry.id}`}
    >
      <SequencePicture picture={entry.picture} size={120} />
      <KidsText align="center">{entry.title.text}</KidsText>
    </Pressable>
  );
}

/** The child's routines and stories, made by their parent or built in. */
export default function StoriesScreen() {
  const { activeChild } = useAppState();
  const { sequences } = useSequences(activeChild?.id);

  if (!activeChild) return <Redirect href="/" />;
  if (!sequences) return <ChildScreen current="stories">{null}</ChildScreen>;

  const own = (kind: 'routine' | 'story'): Entry[] =>
    sequences.items
      .filter((item) => item.kind === kind)
      .flatMap((item) => {
        const first = item.steps[0];
        if (!first) return [];
        return [
          {
            id: item.id,
            title: parentTitle(item),
            picture: first.picture,
            href:
              kind === 'routine'
                ? {
                    pathname: '/routine/[routineId]',
                    params: { routineId: item.id },
                  }
                : {
                    pathname: '/story/[storyId]',
                    params: { storyId: item.id },
                  },
          },
        ];
      });
  const routines = own('routine');
  const stories: Entry[] = [
    ...own('story'),
    ...availableStories(activeChild.religiousPack).flatMap((id) => {
      const first = BUILTIN_STORIES[id].pages[0];
      return [
        {
          id,
          title: storyTitle(id),
          picture: first,
          href: { pathname: '/story/[storyId]', params: { storyId: id } },
        },
      ];
    }),
  ];

  return (
    <ChildScreen current="stories">
      <ScrollView contentContainerStyle={styles.content}>
        {routines.length > 0 && (
          <View style={styles.section}>
            <SpeakableText
              utterance={phrase('stories.routines')}
              variant="title"
              heading
            />
            <View style={styles.tiles}>
              {routines.map((entry) => (
                <Tile key={entry.id} entry={entry} />
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <SpeakableText
            utterance={phrase('stories.stories')}
            variant="title"
            heading
          />
          <View style={styles.tiles}>
            {stories.map((entry) => (
              <Tile key={entry.id} entry={entry} />
            ))}
          </View>
        </View>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: kidsSpacing.xl,
    paddingBottom: kidsSpacing.xl,
  },
  section: {
    gap: kidsSpacing.md,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.lg,
  },
  tile: {
    width: 200,
    minHeight: touchTargets.childLarge * 2,
    alignItems: 'center',
    gap: kidsSpacing.sm,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
});
