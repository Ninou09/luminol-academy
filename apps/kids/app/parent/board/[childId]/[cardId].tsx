import { PARENT_COPY } from '@luminol/kids-content';
import { findCard } from '@luminol/kids-learning';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { useBoard } from '../../../../src/aac/useBoard';
import { ParentScreen } from '../../../../src/components/ParentScreen';
import { CardEditor } from '../../../../src/parent/CardEditor';
import { useAppState } from '../../../../src/state/AppState';

export default function EditCardScreen() {
  const { childId, cardId } = useLocalSearchParams<{
    childId: string;
    cardId: string;
  }>();
  const { profiles } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { board, save } = useBoard(child?.id);
  const title = PARENT_COPY.card.editTitle;

  if (!child) return <Redirect href="/parent" />;
  if (!board) return <ParentScreen title={title}>{null}</ParentScreen>;
  if (!findCard(board, cardId)) return <Redirect href="/parent" />;

  return (
    <ParentScreen title={title}>
      <CardEditor child={child} board={board} cardId={cardId} save={save} />
    </ParentScreen>
  );
}
