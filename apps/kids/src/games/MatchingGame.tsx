import { phrase, tokenUtterance } from '@luminol/kids-content';
import {
  createThemedMatchingRound,
  levelSpec,
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
import { TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['match-shapes'];

/** Find the same one: one exact match among calm, distinct choices. */
export function MatchingGame({ trials, theme, onDone }: GameProps) {
  const instruction = phrase(
    theme === 'shapes' ? 'matching.instruction' : 'matching.instructionPicture',
  );
  const roundRef = useRef<ReturnType<typeof createThemedMatchingRound> | null>(
    null,
  );
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current ? tokenUtterance(roundRef.current.target) : instruction,
  });
  const round = useMemo(
    () =>
      createThemedMatchingRound(
        levelSpec(skill, flow.level),
        theme,
        flow.random,
      ),
    // A new round for every trial; the level is fixed while a trial runs.
    [flow.trialIndex, flow.level, flow.random, theme],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.target} testID="matching-target">
        <TokenView
          token={round.target}
          size={150}
          label={tokenUtterance(round.target).text}
        />
      </View>
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${index}`}
              accessibilityLabel={tokenUtterance(choice).text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <TokenView token={choice} size={110} />
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
