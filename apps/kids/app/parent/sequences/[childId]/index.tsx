import { PARENT_COPY } from '@luminol/kids-content';
import type { Sequence, SequenceKind } from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../../../src/components/ParentScreen';
import { SequencePicture } from '../../../../src/sequences/SequencePicture';
import { useSequences } from '../../../../src/sequences/useSequences';
import { useAppState } from '../../../../src/state/AppState';

const copy = PARENT_COPY.sequences;

/** A child's routines and stories, with a way to add and edit each. */
export default function SequencesScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profiles } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { sequences } = useSequences(child?.id);

  if (!child) return <Redirect href="/parent" />;
  if (!sequences) return <ParentScreen title={copy.title}>{null}</ParentScreen>;

  function section(kind: SequenceKind, heading: string, items: Sequence[]) {
    if (!child) return null;
    return (
      <View style={styles.section}>
        <KidsText variant="title" heading>
          {heading}
        </KidsText>
        {items.length === 0 && (
          <KidsText variant="parentBody" tone="soft">
            {copy.empty}
          </KidsText>
        )}
        {items.map((item) => (
          <View
            key={item.id}
            style={styles.row}
            testID={`sequence-row-${item.id}`}
          >
            {item.steps[0] && (
              <SequencePicture picture={item.steps[0].picture} size={48} />
            )}
            <KidsText style={styles.name}>{item.title}</KidsText>
            <BigButton
              label={copy.edit}
              variant="secondary"
              audience="parent"
              accessibilityHint={item.title}
              onPress={() =>
                router.push({
                  pathname: '/parent/sequences/[childId]/[sequenceId]',
                  params: { childId: child.id, sequenceId: item.id },
                })
              }
              testID={`sequence-edit-${item.id}`}
            />
          </View>
        ))}
        <BigButton
          label={kind === 'routine' ? copy.addRoutine : copy.addStory}
          audience="parent"
          onPress={() =>
            router.push({
              pathname: '/parent/sequences/[childId]/new',
              params: { childId: child.id, kind },
            })
          }
          testID={`sequence-add-${kind}`}
        />
      </View>
    );
  }

  return (
    <ParentScreen title={`${copy.title}: ${child.nickname}`}>
      <View style={styles.notice}>
        <KidsText variant="parentBody">{copy.intro}</KidsText>
      </View>
      {section(
        'routine',
        copy.routines,
        sequences.items.filter((item) => item.kind === 'routine'),
      )}
      {section(
        'story',
        copy.stories,
        sequences.items.filter((item) => item.kind === 'story'),
      )}
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.accentSoft,
  },
  section: {
    gap: kidsSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.sm,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  name: {
    flex: 1,
  },
});
