import { describePiece, phrase } from '@luminol/kids-content';
import { createMatchingRound, levelSpec, SKILLS } from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['match-shapes'];
const instruction = phrase('matching.instruction');

/** Find the same shape: one exact match among calm, distinct choices. */
export function MatchingGame({ trials, onDone }: GameProps) {
  const roundRef = useRef<ReturnType<typeof createMatchingRound> | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current ? describePiece(roundRef.current.target) : instruction,
  });
  const round = useMemo(
    () => createMatchingRound(levelSpec(skill, flow.level), flow.random),
    // A new round for every trial; the level is fixed while a trial runs.
    [flow.trialIndex, flow.level, flow.random],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.target} testID="matching-target">
        <ShapeGlyph
          shape={round.target.shape}
          color={round.target.color}
          size={150}
          accessibilityLabel={describePiece(round.target).text}
        />
      </View>
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${index}`}
              accessibilityLabel={describePiece(choice).text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <ShapeGlyph
                shape={choice.shape}
                color={choice.color}
                size={110}
              />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  target: {
    padding: kidsSpacing.lg,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
