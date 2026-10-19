import { phrase, tokenUtterance } from '@luminol/kids-content';
import {
  createMemoryBoard,
  levelSpec,
  SKILLS,
  tokensEqual,
  type MemoryCard,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  ShapeGlyph,
  type ChoiceTileState,
} from '@luminol/kids-ui';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppState } from '../state/AppState';
import { GameFrame, type GameProps } from './GameFrame';
import { TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['memory-pairs'];
const instruction = phrase('memory.instruction');
const hiddenLabel = phrase('memory.hidden').text;
/** How long a non-matching card stays face up before turning back. */
export const PEEK_MS = 900;

function cardSize(count: number): number {
  if (count <= 4) return 140;
  if (count <= 6) return 124;
  if (count <= 8) return 112;
  return 96;
}

type Board = { cards: MemoryCard[]; matched: ReadonlySet<string> };

/**
 * Find the matching pictures. Each trial is one search: the child turns a
 * card, which stays face up, and looks for its partner. A wrong partner turns
 * back gently and help comes closer; the board refills once it is cleared.
 */
export function MemoryGame({ trials, theme, onDone }: GameProps) {
  const { say } = useAppState();
  const [board, setBoard] = useState<Board | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openCardRef = useRef<MemoryCard | null>(null);

  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      openCardRef.current
        ? tokenUtterance(openCardRef.current.token)
        : instruction,
  });

  // A fresh board for the first trial and whenever the last one is cleared.
  const cleared = board !== null && board.matched.size === board.cards.length;
  useEffect(() => {
    if (flow.phase !== 'playing' || (board && !cleared)) return;
    setBoard({
      cards: createMemoryBoard(
        levelSpec(skill, flow.level),
        theme,
        flow.random,
      ),
      matched: new Set(),
    });
    setOpen(null);
  }, [board, cleared, flow.level, flow.phase, flow.random, theme]);

  useEffect(
    () => () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    },
    [],
  );

  if (!board) {
    return (
      <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
        {null}
      </GameFrame>
    );
  }

  const openCard = board.cards.find((card) => card.id === open) ?? null;
  openCardRef.current = openCard;
  const partner = openCard
    ? board.cards.find(
        (card) =>
          card.id !== openCard.id &&
          !board.matched.has(card.id) &&
          tokensEqual(card.token, openCard.token),
      )
    : undefined;
  const playing = flow.phase === 'playing';

  function press(card: MemoryCard) {
    if (!playing || !board || peek !== null) return;
    if (board.matched.has(card.id) || card.id === open) return;
    if (!openCard) {
      setOpen(card.id);
      say(tokenUtterance(card.token));
      return;
    }
    if (tokensEqual(card.token, openCard.token)) {
      setBoard({
        ...board,
        matched: new Set([...board.matched, openCard.id, card.id]),
      });
      setOpen(null);
      flow.respond(true);
      return;
    }
    setPeek(card.id);
    flow.respond(false);
    peekTimer.current = setTimeout(() => setPeek(null), PEEK_MS);
  }

  function stateFor(card: MemoryCard): ChoiceTileState {
    if (!openCard || board?.matched.has(card.id) || card.id === open) {
      return 'idle';
    }
    const isPartner = card.id === partner?.id;
    if (flow.assist === 'guide') return isPartner ? 'highlight' : 'dimmed';
    if (flow.assist === 'highlight' && isPartner) return 'highlight';
    return 'idle';
  }

  const size = cardSize(board.cards.length);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.grid} testID="memory-grid">
        {board.cards.map((card) => {
          const faceUp =
            board.matched.has(card.id) || card.id === open || card.id === peek;
          const label = faceUp ? tokenUtterance(card.token).text : hiddenLabel;
          return (
            <ChoiceTile
              key={card.id}
              accessibilityLabel={label}
              state={stateFor(card)}
              onPress={() => press(card)}
              size={size}
              testID={`memory-card-${card.id}`}
            >
              {faceUp ? (
                <TokenView token={card.token} size={size * 0.7} />
              ) : (
                <View style={styles.back}>
                  <ShapeGlyph
                    shape="star"
                    color="yellow"
                    tone="outline"
                    size={size * 0.35}
                  />
                </View>
              )}
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.md,
    maxWidth: 720,
  },
  back: {
    alignSelf: 'stretch',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.accentSoft,
  },
});
