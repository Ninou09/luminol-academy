import { phrase, tokenUtterance } from '@luminol/kids-content';
import {
  createPuzzleRound,
  levelSpec,
  regionRect,
  SKILLS,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
} from '@luminol/kids-ui';
import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { TokenPiece, TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['puzzle-complete'];
const instruction = phrase('puzzle.instruction');
const BOARD_SIZE = 220;
const PIECE_SIZE = 150;

/** Complete the picture: pick the missing piece among pieces of other pictures. */
export function PuzzleGame({ trials, theme, onDone }: GameProps) {
  const roundRef = useRef<ReturnType<typeof createPuzzleRound> | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current ? tokenUtterance(roundRef.current.token) : instruction,
  });
  const round = useMemo(
    () => createPuzzleRound(levelSpec(skill, flow.level), theme, flow.random),
    [flow.trialIndex, flow.level, flow.random, theme],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';
  const gap = regionRect(round.pieces, round.missing, BOARD_SIZE);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.frame}>
        {/* Forced left-to-right so the gap sits where the piece belongs. */}
        <View
          style={styles.board}
          accessible
          accessibilityLabel={tokenUtterance(round.token).text}
          testID="puzzle-board"
        >
          <TokenView token={round.token} size={BOARD_SIZE} />
          {!celebrating && (
            <View
              style={[
                styles.gap,
                {
                  left: gap.x,
                  top: gap.y,
                  width: gap.width,
                  height: gap.height,
                },
              ]}
              testID="puzzle-gap"
            />
          )}
        </View>
      </View>
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${index}`}
              accessibilityLabel={`جزء من ${tokenUtterance(choice.token).text}`}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              size={170}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <TokenPiece
                token={choice.token}
                size={PIECE_SIZE}
                pieces={round.pieces}
                region={choice.region}
              />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    direction: 'ltr',
  },
  gap: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: kidsColors.inkSoft,
    backgroundColor: kidsColors.surfaceSoft,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
