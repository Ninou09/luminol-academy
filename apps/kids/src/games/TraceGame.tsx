import { letterNameUtterance, phrase } from '@luminol/kids-content';
import {
  assistAtLeast,
  LETTER_CHARS,
  letterTrace,
  levelSpec,
  pickTraceLetter,
  SKILLS,
  START_TRACE,
  traceLift,
  traceTouch,
  type AssistStep,
  type LetterTrace,
  type TraceLevel,
  type TracePoint,
} from '@luminol/kids-learning';
import { kidsColors, kidsRadii, kidsSpacing } from '@luminol/kids-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useAppState } from '../state/AppState';
import { GameFrame, type GameProps } from './GameFrame';
import { LetterText } from './LetterGame';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['letter-trace'];
const instruction = phrase('trace.instruction');
const CANVAS_SIZE = 300;

function pathData(points: readonly TracePoint[]): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(' ');
}

/**
 * One letter to trace. Touches follow the letter's checkpoints in writing
 * order; progress is kept when the finger lifts or wanders.
 */
function TraceCanvas({
  trace,
  guide,
  assist,
  enabled,
  label,
  onStray,
  onDone,
}: {
  trace: LetterTrace;
  guide: TraceLevel['guide'];
  assist: AssistStep;
  enabled: boolean;
  label: string;
  onStray: () => void;
  onDone: () => void;
}) {
  const [state, setState] = useState(START_TRACE);
  const stateRef = useRef(state);

  function update(next: typeof state) {
    stateRef.current = next;
    setState(next);
  }

  function touch(event: GestureResponderEvent) {
    if (!enabled) return;
    const { locationX, locationY } = event.nativeEvent;
    const previous = stateRef.current;
    const next = traceTouch(trace, previous, {
      x: (locationX / CANVAS_SIZE) * 100,
      y: (locationY / CANVAS_SIZE) * 100,
    });
    update(next);
    if (next.strays > previous.strays) onStray();
    if (next.done && !previous.done) onDone();
  }

  // Full guidance always shows the whole letter.
  const shown = assist === 'guide' ? 'path' : guide;
  const current = trace.checkpoints[state.stroke] ?? [];
  const nextPoint = current[state.next];
  const reached = current.slice(0, Math.max(state.next, 1));

  return (
    <View
      style={styles.canvas}
      accessible
      accessibilityLabel={label}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={touch}
      onResponderMove={touch}
      onResponderRelease={() => update(traceLift(stateRef.current))}
      testID="trace-canvas"
    >
      <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox="0 0 100 100">
        {shown === 'path' &&
          trace.paths.map((path, index) =>
            path.length === 1 ? (
              <Circle
                key={index}
                cx={path[0]!.x}
                cy={path[0]!.y}
                r={4}
                fill={kidsColors.line}
              />
            ) : (
              <Path
                key={index}
                d={pathData(path)}
                stroke={kidsColors.line}
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ),
          )}
        {shown !== 'start' &&
          trace.checkpoints
            .slice(state.stroke)
            .flatMap((stroke, offset) =>
              stroke.map((point, index) => (
                <Circle
                  key={`${offset}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={1.6}
                  fill={kidsColors.inkSoft}
                />
              )),
            )}
        {trace.paths
          .slice(0, state.stroke)
          .map((path, index) =>
            path.length === 1 ? (
              <Circle
                key={`done-${index}`}
                cx={path[0]!.x}
                cy={path[0]!.y}
                r={4}
                fill={kidsColors.accent}
              />
            ) : (
              <Path
                key={`done-${index}`}
                d={pathData(path)}
                stroke={kidsColors.accent}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ),
          )}
        {state.next > 0 && reached.length > 1 && (
          <Path
            d={pathData(reached)}
            stroke={kidsColors.accent}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        {nextPoint && !state.done && (
          <Circle
            cx={nextPoint.x}
            cy={nextPoint.y}
            r={assistAtLeast(assist, 'highlight') ? 7 : 4.5}
            fill={kidsColors.hintSoft}
            stroke={kidsColors.hint}
            strokeWidth={1.5}
            testID="trace-next"
          />
        )}
      </Svg>
    </View>
  );
}

/** Trace a letter in writing order, with the printed letter beside it. */
export function TraceGame({ trials, onDone }: Omit<GameProps, 'theme'>) {
  const { sayItems } = useAppState();
  const letterRef = useRef<ReturnType<typeof pickTraceLetter> | null>(null);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      letterRef.current ? letterNameUtterance(letterRef.current) : instruction,
  });
  const spec = levelSpec(skill, flow.level);
  const letter = useMemo(
    () => pickTraceLetter(spec, flow.random),
    // A new letter for every trial.
    [flow.trialIndex, flow.random, spec],
  );
  letterRef.current = letter;
  const trace = useMemo(() => letterTrace(letter), [letter]);
  const playing = flow.phase === 'playing';

  // Name the letter after the instruction, once per letter.
  const ask = useRef({ sayItems });
  ask.current = { sayItems };
  useEffect(() => {
    if (!playing) return;
    ask.current.sayItems([
      { utterance: instruction },
      { utterance: letterNameUtterance(letter) },
    ]);
  }, [letter, playing]);

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.row}>
        <View style={styles.model}>
          <LetterText
            text={LETTER_CHARS[letter]}
            size={120}
            testID="trace-letter"
          />
        </View>
        <TraceCanvas
          key={flow.trialIndex}
          trace={trace}
          guide={spec.guide}
          assist={flow.assist}
          enabled={playing}
          label={letterNameUtterance(letter).text}
          onStray={() => flow.respond(false)}
          onDone={() => flow.respond(true)}
        />
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: kidsSpacing.xl,
  },
  model: {
    minWidth: 160,
    paddingHorizontal: kidsSpacing.lg,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surfaceSoft,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
    // Touch coordinates are physical; keep the drawing left-to-right.
    direction: 'ltr',
    overflow: 'hidden',
  },
});
