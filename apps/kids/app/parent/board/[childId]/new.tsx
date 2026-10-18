import { PARENT_COPY } from '@luminol/kids-content';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { useBoard } from '../../../../src/aac/useBoard';
import { ParentScreen } from '../../../../src/components/ParentScreen';
import { CardEditor } from '../../../../src/parent/CardEditor';
import { useAppState } from '../../../../src/state/AppState';

export default function NewCardScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profiles } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { board, save } = useBoard(child?.id);
  const title = PARENT_COPY.card.newTitle;

  if (!child) return <Redirect href="/parent" />;
  if (!board) return <ParentScreen title={title}>{null}</ParentScreen>;

  return (
    <ParentScreen title={title}>
      <CardEditor child={child} board={board} cardId={null} save={save} />
    </ParentScreen>
  );
}
