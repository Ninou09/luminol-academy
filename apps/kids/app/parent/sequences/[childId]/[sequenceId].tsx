import { PARENT_COPY } from '@luminol/kids-content';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { ParentScreen } from '../../../../src/components/ParentScreen';
import { SequenceEditor } from '../../../../src/parent/SequenceEditor';
import { useSequences } from '../../../../src/sequences/useSequences';
import { useAppState } from '../../../../src/state/AppState';

export default function EditSequenceScreen() {
  const { childId, sequenceId } = useLocalSearchParams<{
    childId: string;
    sequenceId: string;
  }>();
  const { profiles } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { sequences, save } = useSequences(child?.id);
  const copy = PARENT_COPY.sequences;
  const sequence = sequences?.items.find((item) => item.id === sequenceId);
  const title = sequence?.kind === 'story' ? copy.editStory : copy.editRoutine;

  if (!child) return <Redirect href="/parent" />;
  if (!sequences) return <ParentScreen title={title}>{null}</ParentScreen>;
  if (!sequence)
    return (
      <Redirect
        href={{
          pathname: '/parent/sequences/[childId]',
          params: { childId: child.id },
        }}
      />
    );

  return (
    <ParentScreen title={title}>
      <SequenceEditor
        child={child}
        sequences={sequences}
        sequenceId={sequence.id}
        kind={sequence.kind}
        save={save}
      />
    </ParentScreen>
  );
}
