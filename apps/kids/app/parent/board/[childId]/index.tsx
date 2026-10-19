import {
  aacCardUtterance,
  aacCategoryUtterance,
  PARENT_COPY,
} from '@luminol/kids-content';
import {
  AAC_CATEGORIES,
  NO_OVERRIDE,
  resolveBoard,
  setOverride,
  upsertCustomCard,
  type AacBoard,
  type BoardCard,
} from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CardPicture } from '../../../../src/aac/CardPicture';
import { useBoard } from '../../../../src/aac/useBoard';
import { ParentScreen } from '../../../../src/components/ParentScreen';
import { useAppState } from '../../../../src/state/AppState';

function withHidden(
  board: AacBoard,
  card: BoardCard,
  hidden: boolean,
): AacBoard {
  if (card.source === 'builtin') {
    return setOverride(board, card.id, {
      ...(board.overrides[card.id] ?? NO_OVERRIDE),
      hidden,
    });
  }
  const custom = board.customCards.find((existing) => existing.id === card.id);
  return custom ? upsertCustomCard(board, { ...custom, hidden }) : board;
}

/** Which cards a child sees, and a way into each card's picture and voice. */
export default function BoardEditorScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profiles } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { board, save } = useBoard(child?.id);
  const copy = PARENT_COPY.board;

  if (!child) return <Redirect href="/parent" />;
  if (!board) return <ParentScreen title={copy.title}>{null}</ParentScreen>;

  const cards = resolveBoard(board);

  return (
    <ParentScreen title={`${copy.title}: ${child.nickname}`}>
      <View style={styles.notice}>
        <KidsText variant="parentBody">{copy.intro}</KidsText>
      </View>
      <BigButton
        label={copy.addCard}
        audience="parent"
        onPress={() =>
          router.push({
            pathname: '/parent/board/[childId]/new',
            params: { childId: child.id },
          })
        }
        testID="board-add-card"
      />
      {AAC_CATEGORIES.map((category) => (
        <View key={category} style={styles.section}>
          <KidsText variant="title" heading>
            {aacCategoryUtterance(category).text}
          </KidsText>
          {cards
            .filter((card) => card.category === category)
            .map((card) => {
              const label = aacCardUtterance(card).text;
              return (
                <View
                  key={card.id}
                  style={[styles.row, card.hidden && styles.hiddenRow]}
                  testID={`board-row-${card.id}`}
                >
                  <CardPicture picture={card.picture} size={48} />
                  <View style={styles.name}>
                    <KidsText>{label}</KidsText>
                    {card.hidden && (
                      <KidsText variant="parentBody" tone="soft">
                        {copy.hidden}
                      </KidsText>
                    )}
                  </View>
                  <BigButton
                    label={card.hidden ? copy.show : copy.hide}
                    variant="secondary"
                    audience="parent"
                    accessibilityHint={label}
                    onPress={() =>
                      void save(withHidden(board, card, !card.hidden))
                    }
                    testID={`board-toggle-${card.id}`}
                  />
                  <BigButton
                    label={copy.edit}
                    variant="secondary"
                    audience="parent"
                    accessibilityHint={label}
                    onPress={() =>
                      router.push({
                        pathname: '/parent/board/[childId]/[cardId]',
                        params: { childId: child.id, cardId: card.id },
                      })
                    }
                    testID={`board-edit-${card.id}`}
                  />
                </View>
              );
            })}
        </View>
      ))}
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
  hiddenRow: {
    backgroundColor: kidsColors.surfaceSoft,
  },
  name: {
    flex: 1,
  },
});
