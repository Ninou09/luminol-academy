import { phrase, tokenUtterance } from '@luminol/kids-content';
import { createPatternRound, levelSpec, SKILLS } from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['pattern-next'];
const instruction = phrase('pattern.instruction');
const SEQUENCE_SIZE = 72;

/** What comes next? The row reads right to left, like Arabic text. */
export function PatternGame({ trials, theme, onDone }: GameProps) {
  const roundRef = useRef<ReturnType<typeof createPatternRound> | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current ? tokenUtterance(roundRef.current.answer) : instruction,
  });
  const round = useMemo(
    () => createPatternRound(levelSpec(skill, flow.level), theme, flow.random),
    [flow.trialIndex, flow.level, flow.random, theme],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';
  const sequenceLabel = round.sequence
    .map((token) => tokenUtterance(token).text)
    .join('، ');

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View
        style={styles.sequence}
        accessible
        accessibilityLabel={`${sequenceLabel}، ؟`}
        testID="pattern-sequence"
      >
        {round.sequence.map((token, index) => (
          <TokenView key={index} token={token} size={SEQUENCE_SIZE} />
        ))}
        <View style={styles.gap} testID="pattern-gap">
          {celebrating ? (
            <TokenView token={round.answer} size={SEQUENCE_SIZE} />
          ) : (
            <KidsText variant="display" align="center" tone="soft">
              ؟
            </KidsText>
          )}
        </View>
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
              <TokenView token={choice} size={104} />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  sequence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: kidsSpacing.sm,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  gap: {
    width: SEQUENCE_SIZE + kidsSpacing.md,
    height: SEQUENCE_SIZE + kidsSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.control,
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
