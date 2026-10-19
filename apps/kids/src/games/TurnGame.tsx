import { phrase } from '@luminol/kids-content';
import {
  avatarPiece,
  levelSpec,
  SKILLS,
  type AssistStep,
  type PieceColor,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  pieceColors,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakableText } from '../components/SpeakableText';
import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['turn-taking'];
const instruction = phrase('turns.instruction');

/** The app's first block waits for the instruction to be heard. */
export const FIRST_TURN_MS = 1800;
/** A calm, steady pace between turns. Never shown as a timer. */
export const TURN_MS = 1500;

type Owner = 'app' | 'child';

function Block({ color }: { color: PieceColor }) {
  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: pieceColors[color].fill,
          borderColor: pieceColors[color].outline,
        },
      ]}
    />
  );
}

/**
 * One round of building a tower together: the app places its blocks, then it
 * is the child's turn. Touching the button during the app's turn adds help;
 * with full help the button rests until it is the child's turn.
 */
function TurnRound({
  appTurns,
  assist,
  celebrating,
  colors,
  onTurn,
}: {
  appTurns: number;
  assist: AssistStep;
  celebrating: boolean;
  colors: Record<Owner, PieceColor>;
  onTurn: (childTurn: boolean) => void;
}) {
  const { say, activeChild } = useAppState();
  const [appBlocks, setAppBlocks] = useState(0);
  const [yourTurn, setYourTurn] = useState(false);
  const [childPlaced, setChildPlaced] = useState(false);
  const speak = useRef(say);
  speak.current = say;

  useEffect(() => {
    const timers = Array.from({ length: appTurns + 1 }, (_, turn) =>
      setTimeout(
        () => {
          if (turn < appTurns) {
            setAppBlocks(turn + 1);
            speak.current(phrase('turns.mine'));
          } else {
            setYourTurn(true);
            speak.current(phrase('turns.yours'));
          }
        },
        FIRST_TURN_MS + turn * TURN_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [appTurns]);

  const childTurn = yourTurn && !childPlaced;
  const blocks: Owner[] = [
    ...Array.from({ length: appBlocks }, (): Owner => 'app'),
    ...(childPlaced ? ['child' as const] : []),
  ];
  const turnPhrase = phrase(yourTurn ? 'turns.yours' : 'turns.mine');
  const avatar = activeChild ? avatarPiece(activeChild.avatar) : null;

  return (
    <>
      <View style={styles.players}>
        <View style={[styles.player, !yourTurn && styles.active]}>
          <ShapeGlyph shape="circle" color={colors.app} size={64} face />
        </View>
        <View style={styles.tower} testID="turn-tower">
          {blocks.map((owner, index) => (
            <Block key={index} color={colors[owner]} />
          ))}
        </View>
        <View style={[styles.player, yourTurn && styles.active]}>
          {avatar && (
            <ShapeGlyph
              shape={avatar.shape}
              color={colors.child}
              size={64}
              face
            />
          )}
        </View>
      </View>
      <SpeakableText
        utterance={turnPhrase}
        variant="title"
        testID={yourTurn ? 'turn-child' : 'turn-app'}
      />
      <ChoiceTile
        accessibilityLabel={phrase('turns.add').text}
        state={choiceState(assist, childTurn, celebrating)}
        onPress={() => {
          if (childPlaced) return;
          if (childTurn) setChildPlaced(true);
          onTurn(childTurn);
        }}
        size={150}
        testID="turn-add"
      >
        <Block color={colors.child} />
      </ChoiceTile>
    </>
  );
}

/** Taking turns: wait while the app adds its blocks, then add yours. */
export function TurnGame({ trials, onDone }: Omit<GameProps, 'theme'>) {
  const { activeChild } = useAppState();
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () => phrase('turns.wait'),
  });
  const childColor = activeChild
    ? avatarPiece(activeChild.avatar).color
    : 'yellow';
  const colors: Record<Owner, PieceColor> = {
    child: childColor,
    app: childColor === 'blue' ? 'green' : 'blue',
  };

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <TurnRound
        key={flow.trialIndex}
        appTurns={levelSpec(skill, flow.level).appTurns}
        assist={flow.assist}
        celebrating={flow.phase === 'celebrating'}
        colors={colors}
        onTurn={flow.respond}
      />
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  players: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: kidsSpacing.xl,
  },
  player: {
    padding: kidsSpacing.sm,
    borderRadius: kidsRadii.card,
    borderWidth: 4,
    borderColor: kidsColors.canvas,
  },
  active: {
    borderColor: kidsColors.hint,
    backgroundColor: kidsColors.hintSoft,
  },
  tower: {
    minHeight: 4 * 48,
    width: 140,
    // The first block sits at the bottom and the tower grows upwards.
    flexDirection: 'column-reverse',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: kidsColors.line,
  },
  block: {
    width: 120,
    height: 44,
    marginTop: 4,
    borderRadius: kidsRadii.control,
    borderWidth: 3,
  },
});
