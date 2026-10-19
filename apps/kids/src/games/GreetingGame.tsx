import { greetingMoment, greetingWords, phrase } from '@luminol/kids-content';
import {
  createGreetingRound,
  levelSpec,
  SKILLS,
  type GreetingId,
} from '@luminol/kids-learning';
import {
  BigButton,
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakableText } from '../components/SpeakableText';
import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS.greetings;
const instruction = phrase('greetings.instruction');

/**
 * What do we say? A short everyday moment and the polite words that fit it.
 * The choices are read aloud after the question for children who can't read.
 */
export function GreetingGame({ trials, onDone }: Omit<GameProps, 'theme'>) {
  const { sayItems } = useAppState();
  const targetRef = useRef<GreetingId | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      targetRef.current ? greetingWords(targetRef.current) : instruction,
  });
  const round = useMemo(
    () => createGreetingRound(levelSpec(skill, flow.level), flow.random),
    // A new round for every trial; the level is fixed while a trial runs.
    [flow.trialIndex, flow.level, flow.random],
  );
  targetRef.current = round.target;
  const celebrating = flow.phase === 'celebrating';
  const playing = flow.phase === 'playing';
  const spoken = useMemo(
    () =>
      [
        greetingMoment(round.target),
        instruction,
        ...round.choices.map(greetingWords),
      ].map((utterance) => ({ utterance })),
    [round],
  );

  const ask = useRef(sayItems);
  ask.current = sayItems;
  useEffect(() => {
    if (playing) ask.current(spoken);
  }, [playing, spoken]);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.moment}>
        <SpeakableText
          utterance={greetingMoment(round.target)}
          variant="title"
          testID="greeting-moment"
        />
      </View>
      <BigButton
        label={phrase('aac.speak').text}
        variant="secondary"
        onPress={() => sayItems(spoken)}
        testID="greeting-replay"
      />
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          const words = greetingWords(choice).text;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${choice}`}
              accessibilityLabel={words}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              size={170}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <KidsText variant="title" align="center">
                {words}
              </KidsText>
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  moment: {
    maxWidth: 640,
    paddingHorizontal: kidsSpacing.lg,
    paddingVertical: kidsSpacing.md,
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
