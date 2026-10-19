import { PARENT_COPY } from '@luminol/kids-content';
import { hasPlus, sequenceKindSchema } from '@luminol/kids-learning';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { ParentScreen } from '../../../../src/components/ParentScreen';
import { SequenceEditor } from '../../../../src/parent/SequenceEditor';
import { useSequences } from '../../../../src/sequences/useSequences';
import { useAppState } from '../../../../src/state/AppState';

export default function NewSequenceScreen() {
  const params = useLocalSearchParams<{ childId: string; kind?: string }>();
  const { profiles, plan } = useAppState();
  const child = profiles.find((profile) => profile.id === params.childId);
  const { sequences, save } = useSequences(child?.id);
  // The kind arrives in the URL, so it is validated like any other input.
  const kind = sequenceKindSchema.catch('routine').parse(params.kind);
  const copy = PARENT_COPY.sequences;
  const title = kind === 'story' ? copy.newStory : copy.newRoutine;

  if (!child) return <Redirect href="/parent" />;
  if (!hasPlus(plan)) return <Redirect href="/parent/plus" />;
  if (!sequences) return <ParentScreen title={title}>{null}</ParentScreen>;

  return (
    <ParentScreen title={title}>
      <SequenceEditor
        child={child}
        sequences={sequences}
        sequenceId={null}
        kind={kind}
        save={save}
      />
    </ParentScreen>
  );
}
