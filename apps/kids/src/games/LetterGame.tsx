import {
  letterNameUtterance,
  letterSoundUtterance,
  phrase,
  type PhraseKey,
  type Utterance,
} from '@luminol/kids-content';
import {
  createLetterFormsRound,
  createLetterRound,
  LETTER_CHARS,
  letterForm,
  levelSpec,
  type LetterFormsSkill,
  type LetterId,
  type LetterMatchSkill,
  type LetterRound,
  type LetterSoundSkill,
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

import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

type LetterSkill = LetterMatchSkill | LetterSoundSkill | LetterFormsSkill;

const INSTRUCTIONS: Record<LetterSkill['game'], PhraseKey> = {
  'letter-match': 'letters.matchInstruction',
  'letter-sound': 'letters.soundInstruction',
  'letter-forms': 'letters.formsInstruction',
};

/** A letter large enough to read from arm's length on a tablet. */
export function LetterText({
  text,
  size,
  testID,
}: {
  text: string;
  size: number;
  testID?: string;
}) {
  return (
    <KidsText
      align="center"
      style={{ fontSize: size, lineHeight: size * 1.5 }}
      {...(testID ? { testID } : {})}
    >
      {text}
    </KidsText>
  );
}

/**
 * Three letter games on one screen: find the same letter, hear a sound and
 * find its letter, or find a letter's form inside a word.
 */
export function LetterGame({
  skill,
  trials,
  onDone,
}: Omit<GameProps, 'theme'> & { skill: LetterSkill }) {
  const { sayItems } = useAppState();
  const instruction = phrase(INSTRUCTIONS[skill.game]);
  const roundRef = useRef<LetterRound | null>(null);
  const cue = (id: LetterId): Utterance =>
    skill.game === 'letter-sound'
      ? letterSoundUtterance(id)
      : letterNameUtterance(id);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () => (roundRef.current ? cue(roundRef.current.target) : instruction),
  });
  const round = useMemo(
    () =>
      skill.game === 'letter-forms'
        ? createLetterFormsRound(levelSpec(skill, flow.level), flow.random)
        : createLetterRound(levelSpec(skill, flow.level), flow.random),
    [flow.trialIndex, flow.level, flow.random, skill],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';
  const position =
    skill.game === 'letter-forms'
      ? levelSpec(skill, flow.level).position
      : 'isolated';

  // The sound game asks with the sound itself, after the instruction, once
  // per round.
  const playing = flow.phase === 'playing';
  const ask = useRef({ sayItems, instruction });
  ask.current = { sayItems, instruction };
  useEffect(() => {
    if (skill.game !== 'letter-sound' || !playing) return;
    ask.current.sayItems([
      { utterance: ask.current.instruction },
      { utterance: letterSoundUtterance(round.target) },
    ]);
  }, [playing, round, skill.game]);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      {skill.game === 'letter-sound' ? (
        <BigButton
          label={phrase('aac.speak').text}
          variant="secondary"
          onPress={() =>
            sayItems([{ utterance: letterSoundUtterance(round.target) }])
          }
          testID="letter-replay"
        />
      ) : (
        <View
          style={styles.target}
          accessible
          accessibilityLabel={letterNameUtterance(round.target).text}
          testID="letter-target"
        >
          <LetterText text={LETTER_CHARS[round.target]} size={96} />
        </View>
      )}
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${choice}`}
              accessibilityLabel={letterNameUtterance(choice).text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              size={140}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <LetterText text={letterForm(choice, position)} size={64} />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: 160,
    paddingHorizontal: kidsSpacing.xl,
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
