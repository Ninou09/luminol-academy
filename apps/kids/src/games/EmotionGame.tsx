import {
  emotionName,
  emotionQuestion,
  phrase,
  situationStory,
  type Utterance,
} from '@luminol/kids-content';
import {
  createEmotionRound,
  createSituationRound,
  EMOTION_FACES,
  levelSpec,
  situationScene,
  SITUATIONS,
  type Emotion,
  type EmotionSkill,
  type FaceCharacter,
  type SituationSkill,
  type StoryScene,
} from '@luminol/kids-learning';
import {
  BigButton,
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
} from '@luminol/kids-ui';
import { useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import { SpeakableText } from '../components/SpeakableText';
import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { STORY_SCENE_ASSETS } from './pictures';
import { useTrialFlow } from './useTrialFlow';

type EmotionGameSkill = EmotionSkill | SituationSkill;

type Round = {
  /** The feeling to choose. */
  answer: Emotion;
  /** What is asked: a feeling question, or a story and its question. */
  prompt: Utterance[];
  choices: Emotion[];
  correctIndex: number;
  /** Whose faces the choices show. */
  character: FaceCharacter;
  /** A picture of the story, when it has one. */
  scene: StoryScene | null;
};

function fromEmotionRound(round: ReturnType<typeof createEmotionRound>): Round {
  return {
    answer: round.target,
    prompt: [emotionQuestion(round.target)],
    choices: round.choices,
    correctIndex: round.correctIndex,
    character: round.character,
    scene: null,
  };
}

function fromSituationRound(
  round: ReturnType<typeof createSituationRound>,
): Round {
  return {
    answer: SITUATIONS[round.target],
    prompt: [situationStory(round.target), phrase('situation.question')],
    choices: round.choices,
    correctIndex: round.correctIndex,
    character: 'boy',
    scene: situationScene(round.target),
  };
}

/**
 * Noticing feelings: find the face for a feeling, or hear a short story about
 * Sami and choose how he feels. Faces are calm drawings of a boy or a girl;
 * the game never asks the child to look at a real person's eyes.
 */
export function EmotionGame({
  skill,
  trials,
  onDone,
}: Omit<GameProps, 'theme'> & { skill: EmotionGameSkill }) {
  const { sayItems } = useAppState();
  const instruction = phrase(
    skill.game === 'emotion' ? 'emotion.instruction' : 'situation.instruction',
  );
  const roundRef = useRef<Round | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      roundRef.current
        ? emotionName(roundRef.current.answer, roundRef.current.character)
        : instruction,
  });
  const round = useMemo(
    () =>
      skill.game === 'emotion'
        ? fromEmotionRound(
            createEmotionRound(levelSpec(skill, flow.level), flow.random),
          )
        : fromSituationRound(
            createSituationRound(levelSpec(skill, flow.level), flow.random),
          ),
    // A new round for every trial; the level is fixed while a trial runs.
    [flow.trialIndex, flow.level, flow.random, skill],
  );
  roundRef.current = round;
  const celebrating = flow.phase === 'celebrating';
  const playing = flow.phase === 'playing';

  // Ask after the instruction, once per round.
  const ask = useRef({ sayItems, instruction });
  ask.current = { sayItems, instruction };
  useEffect(() => {
    if (!playing) return;
    ask.current.sayItems(
      [ask.current.instruction, ...round.prompt].map((utterance) => ({
        utterance,
      })),
    );
  }, [playing, round]);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.story}>
        {round.scene && (
          <Image
            source={STORY_SCENE_ASSETS[round.scene]}
            resizeMode="contain"
            accessible={false}
            importantForAccessibility="no"
            style={styles.scene}
            testID={`scene-${round.scene}`}
          />
        )}
        <View style={styles.telling}>
          <View style={styles.prompt} testID="emotion-prompt">
            {round.prompt.map((utterance) => (
              <SpeakableText
                key={utterance.key}
                utterance={utterance}
                variant="title"
              />
            ))}
          </View>
          {skill.game === 'situation' && (
            <BigButton
              label={phrase('aac.speak').text}
              variant="secondary"
              onPress={() =>
                sayItems(round.prompt.map((utterance) => ({ utterance })))
              }
              testID="emotion-replay"
            />
          )}
        </View>
      </View>
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${choice}`}
              accessibilityLabel={emotionName(choice, round.character).text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              size={150}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <CardPicture
                picture={{
                  kind: 'builtin',
                  id: EMOTION_FACES[round.character][choice],
                }}
                size={120}
              />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  // The scene sits beside the story so the faces stay on screen in landscape.
  story: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: kidsSpacing.lg,
  },
  telling: {
    flexShrink: 1,
    alignItems: 'center',
    gap: kidsSpacing.md,
  },
  scene: {
    width: 200,
    height: 200,
    borderRadius: kidsRadii.card,
  },
  prompt: {
    maxWidth: 640,
    gap: kidsSpacing.sm,
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
