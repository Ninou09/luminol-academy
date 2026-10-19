import { phrase, routineStep, routineTitle } from '@luminol/kids-content';
import {
  createSequenceRound,
  levelSpec,
  routineSteps,
  SKILLS,
  type AssistStep,
  type RoutinePicture,
  type SequenceRound,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
} from '@luminol/kids-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakableText } from '../components/SpeakableText';
import { SequencePicture } from '../sequences/SequencePicture';
import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['sequence-steps'];
const instruction = phrase('sequence.instruction');
const CARD_SIZE = 110;

/**
 * One routine to put in order. Slots fill from the start of the row (the
 * right in RTL); a step only moves into a slot when it is the next one.
 */
function SequenceBoard({
  round,
  pictures,
  assist,
  celebrating,
  onPlaced,
  onWrong,
}: {
  round: SequenceRound;
  pictures: readonly RoutinePicture[];
  assist: AssistStep;
  celebrating: boolean;
  onPlaced: (step: number, finished: boolean) => void;
  onWrong: () => void;
}) {
  const [placed, setPlaced] = useState(0);
  const next = round.order[placed];
  const picture = (step: number) => {
    const id = pictures[step];
    return id ? { kind: 'routine' as const, id } : null;
  };

  return (
    <>
      <View style={styles.slots} testID="sequence-slots">
        {round.order.map((step, index) => {
          const shown = index < placed ? picture(step) : null;
          return (
            <View
              key={step}
              style={[styles.slot, index === placed && styles.slotNext]}
              accessible
              accessibilityLabel={
                index < placed
                  ? routineStep(round.routine, step).text
                  : `${index + 1}`
              }
              testID={`sequence-slot-${index}`}
            >
              {shown && <SequencePicture picture={shown} size={CARD_SIZE} />}
            </View>
          );
        })}
      </View>
      <View style={styles.cards}>
        {round.dealt.map((step) => {
          if (round.order.indexOf(step) < placed) return null;
          const shown = picture(step);
          const isNext = step === next;
          return (
            <ChoiceTile
              key={step}
              accessibilityLabel={routineStep(round.routine, step).text}
              state={choiceState(assist, isNext, celebrating)}
              onPress={() => {
                if (!isNext) {
                  onWrong();
                  return;
                }
                const count = placed + 1;
                setPlaced(count);
                onPlaced(step, count === round.order.length);
              }}
              size={CARD_SIZE + 24}
              testID={isNext ? 'sequence-next' : `sequence-card-${step}`}
            >
              {shown && <SequencePicture picture={shown} size={CARD_SIZE} />}
            </ChoiceTile>
          );
        })}
      </View>
    </>
  );
}

/** Put the steps of an everyday routine in the order they are done. */
export function SequenceGame({ trials, onDone }: Omit<GameProps, 'theme'>) {
  const { activeChild, say, sayItems } = useAppState();
  const religiousPack = activeChild?.religiousPack ?? false;
  const prayerPictures = activeChild?.prayerPictures ?? 'boy';
  const nextRef = useRef<{ round: SequenceRound; placed: number } | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () => {
      const current = nextRef.current;
      const step = current?.round.order[current.placed];
      return current && step !== undefined
        ? routineStep(current.round.routine, step)
        : instruction;
    },
  });
  const round = useMemo(
    () =>
      createSequenceRound(
        levelSpec(skill, flow.level),
        religiousPack,
        flow.random,
      ),
    // A new routine for every trial; the level is fixed while a trial runs.
    [flow.trialIndex, flow.level, flow.random, religiousPack],
  );
  if (nextRef.current?.round !== round) nextRef.current = { round, placed: 0 };
  const pictures = routineSteps(round.routine, prayerPictures);
  const playing = flow.phase === 'playing';

  // Name the routine after the instruction, once per round.
  const ask = useRef(sayItems);
  ask.current = sayItems;
  useEffect(() => {
    if (playing)
      ask.current([
        { utterance: instruction },
        { utterance: routineTitle(round.routine) },
      ]);
  }, [playing, round]);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <SpeakableText
        utterance={routineTitle(round.routine)}
        variant="title"
        testID="sequence-title"
      />
      <SequenceBoard
        key={flow.trialIndex}
        round={round}
        pictures={pictures}
        assist={flow.assist}
        celebrating={flow.phase === 'celebrating'}
        onWrong={() => flow.respond(false)}
        onPlaced={(step, finished) => {
          if (nextRef.current) nextRef.current.placed += 1;
          if (finished) flow.respond(true);
          else say(routineStep(round.routine, step));
        }}
      />
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.sm,
  },
  slot: {
    width: CARD_SIZE + 16,
    height: CARD_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  slotNext: {
    borderColor: kidsColors.accent,
    borderWidth: 3,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
