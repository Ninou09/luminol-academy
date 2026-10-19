import { LETTER_IDS, type LetterId } from './letters';
import { pickOne, type Random } from './random';
import type { TraceLevel } from './skills';

export type TracePoint = { x: number; y: number };
type StrokePoints = readonly (readonly [number, number])[];

/**
 * Simplified handwriting paths for each isolated letter in a 100 × 100 box,
 * in writing order: the body right to left first, dots last. A single point
 * is a dot the child taps. Drafted for Luminol Noor and pending review by
 * the Luminol Psy specialist; see docs/kids/ROADMAP.md.
 */
export const LETTER_STROKES: Record<LetterId, readonly StrokePoints[]> = {
  alif: [
    [
      [50, 15],
      [50, 80],
    ],
  ],
  ba: [
    [
      [82, 42],
      [80, 55],
      [72, 62],
      [50, 64],
      [28, 62],
      [20, 56],
      [18, 46],
    ],
    [[50, 78]],
  ],
  ta: [
    [
      [82, 42],
      [80, 55],
      [72, 62],
      [50, 64],
      [28, 62],
      [20, 56],
      [18, 46],
    ],
    [[57, 36]],
    [[43, 36]],
  ],
  tha: [
    [
      [82, 42],
      [80, 55],
      [72, 62],
      [50, 64],
      [28, 62],
      [20, 56],
      [18, 46],
    ],
    [[57, 38]],
    [[43, 38]],
    [[50, 28]],
  ],
  jim: [
    [
      [34, 30],
      [52, 26],
      [68, 30],
      [50, 40],
      [32, 52],
      [26, 66],
      [34, 80],
      [52, 86],
      [70, 82],
    ],
    [[50, 62]],
  ],
  hha: [
    [
      [34, 30],
      [52, 26],
      [68, 30],
      [50, 40],
      [32, 52],
      [26, 66],
      [34, 80],
      [52, 86],
      [70, 82],
    ],
  ],
  kha: [
    [
      [34, 30],
      [52, 26],
      [68, 30],
      [50, 40],
      [32, 52],
      [26, 66],
      [34, 80],
      [52, 86],
      [70, 82],
    ],
    [[50, 16]],
  ],
  dal: [
    [
      [42, 32],
      [56, 48],
      [60, 60],
      [56, 64],
      [34, 64],
    ],
  ],
  dhal: [
    [
      [42, 32],
      [56, 48],
      [60, 60],
      [56, 64],
      [34, 64],
    ],
    [[44, 20]],
  ],
  ra: [
    [
      [58, 40],
      [60, 52],
      [54, 64],
      [42, 74],
      [28, 80],
    ],
  ],
  zay: [
    [
      [58, 40],
      [60, 52],
      [54, 64],
      [42, 74],
      [28, 80],
    ],
    [[58, 28]],
  ],
  sin: [
    [
      [90, 42],
      [88, 56],
      [82, 58],
      [78, 46],
      [74, 58],
      [68, 58],
      [64, 46],
      [60, 58],
      [54, 60],
      [48, 64],
      [40, 72],
      [28, 74],
      [16, 68],
      [12, 54],
    ],
  ],
  shin: [
    [
      [90, 42],
      [88, 56],
      [82, 58],
      [78, 46],
      [74, 58],
      [68, 58],
      [64, 46],
      [60, 58],
      [54, 60],
      [48, 64],
      [40, 72],
      [28, 74],
      [16, 68],
      [12, 54],
    ],
    [[84, 32]],
    [[70, 32]],
    [[77, 22]],
  ],
  sad: [
    [
      [56, 58],
      [64, 46],
      [78, 40],
      [90, 46],
      [86, 58],
      [56, 58],
      [48, 64],
      [40, 72],
      [28, 74],
      [16, 68],
      [12, 54],
    ],
  ],
  dad: [
    [
      [56, 58],
      [64, 46],
      [78, 40],
      [90, 46],
      [86, 58],
      [56, 58],
      [48, 64],
      [40, 72],
      [28, 74],
      [16, 68],
      [12, 54],
    ],
    [[74, 28]],
  ],
  tta: [
    [
      [28, 62],
      [44, 48],
      [64, 44],
      [78, 52],
      [72, 62],
      [28, 62],
    ],
    [
      [40, 18],
      [40, 62],
    ],
  ],
  zza: [
    [
      [28, 62],
      [44, 48],
      [64, 44],
      [78, 52],
      [72, 62],
      [28, 62],
    ],
    [
      [40, 18],
      [40, 62],
    ],
    [[60, 34]],
  ],
  ayn: [
    [
      [62, 30],
      [52, 24],
      [42, 30],
      [44, 40],
      [58, 46],
      [44, 52],
      [34, 62],
      [32, 76],
      [42, 86],
      [60, 88],
      [74, 84],
    ],
  ],
  ghayn: [
    [
      [62, 30],
      [52, 24],
      [42, 30],
      [44, 40],
      [58, 46],
      [44, 52],
      [34, 62],
      [32, 76],
      [42, 86],
      [60, 88],
      [74, 84],
    ],
    [[52, 12]],
  ],
  fa: [
    [
      [74, 48],
      [66, 42],
      [68, 33],
      [78, 32],
      [82, 40],
      [76, 50],
      [60, 54],
      [40, 54],
      [22, 52],
      [16, 42],
    ],
    [[74, 20]],
  ],
  qaf: [
    [
      [70, 44],
      [62, 38],
      [64, 29],
      [74, 28],
      [78, 36],
      [72, 46],
      [74, 58],
      [64, 72],
      [46, 76],
      [30, 70],
      [22, 56],
      [24, 44],
    ],
    [[80, 16]],
    [[66, 16]],
  ],
  kaf: [
    [
      [72, 18],
      [72, 62],
      [28, 62],
      [24, 52],
    ],
    [
      [48, 44],
      [56, 40],
      [48, 36],
      [56, 32],
    ],
  ],
  lam: [
    [
      [66, 16],
      [66, 58],
      [60, 70],
      [46, 74],
      [32, 70],
      [26, 58],
    ],
  ],
  mim: [
    [
      [52, 52],
      [42, 48],
      [44, 38],
      [54, 36],
      [60, 44],
      [52, 52],
      [38, 56],
      [30, 70],
      [30, 86],
    ],
  ],
  nun: [
    [
      [76, 38],
      [80, 52],
      [74, 66],
      [60, 74],
      [42, 74],
      [28, 66],
      [22, 52],
      [25, 40],
    ],
    [[50, 50]],
  ],
  ha: [
    [
      [50, 30],
      [66, 42],
      [64, 62],
      [50, 70],
      [36, 62],
      [34, 42],
      [50, 30],
    ],
  ],
  waw: [
    [
      [62, 52],
      [54, 40],
      [44, 44],
      [48, 54],
      [62, 54],
      [62, 64],
      [54, 76],
      [38, 84],
    ],
  ],
  ya: [
    [
      [62, 30],
      [50, 34],
      [52, 44],
      [66, 50],
      [76, 58],
      [70, 68],
      [50, 72],
      [30, 70],
      [20, 62],
    ],
    [[56, 84]],
    [[42, 84]],
  ],
};

/** Rounds a stroke's corners with a Catmull-Rom curve through its points. */
export function smoothStroke(
  points: readonly TracePoint[],
  steps = 8,
): TracePoint[] {
  if (points.length < 3) return [...points];
  const padded = [points[0]!, ...points, points.at(-1)!];
  const result: TracePoint[] = [];
  for (let index = 1; index < padded.length - 2; index += 1) {
    const [p0, p1, p2, p3] = [
      padded[index - 1]!,
      padded[index]!,
      padded[index + 1]!,
      padded[index + 2]!,
    ];
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const blend = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b +
          (-a + c) * t +
          (2 * a - 5 * b + 4 * c - d) * t2 +
          (-a + 3 * b - 3 * c + d) * t3);
      result.push({
        x: blend(p0.x, p1.x, p2.x, p3.x),
        y: blend(p0.y, p1.y, p2.y, p3.y),
      });
    }
  }
  result.push(points.at(-1)!);
  return result;
}

function distance(a: TracePoint, b: TracePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Checkpoints spaced evenly along a path; a dot stays a single point. */
export function resample(
  points: readonly TracePoint[],
  spacing: number,
): TracePoint[] {
  const first = points[0];
  if (!first) return [];
  const result: TracePoint[] = [first];
  let carried = 0;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1]!;
    const to = points[index]!;
    const length = distance(from, to);
    let along = spacing - carried;
    while (along <= length) {
      const t = along / length;
      result.push({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      });
      along += spacing;
    }
    carried = (carried + length) % spacing;
  }
  const last = points.at(-1)!;
  if (distance(result.at(-1)!, last) > spacing / 3) result.push(last);
  return result;
}

/** Smoothed path for drawing, and evenly spaced checkpoints for tracing. */
export type LetterTrace = {
  paths: TracePoint[][];
  checkpoints: TracePoint[][];
};

export const CHECKPOINT_SPACING = 7;

export function letterTrace(id: LetterId): LetterTrace {
  const paths = LETTER_STROKES[id].map((stroke) =>
    smoothStroke(stroke.map(([x, y]) => ({ x, y }))),
  );
  return {
    paths,
    checkpoints: paths.map((path) => resample(path, CHECKPOINT_SPACING)),
  };
}

/** A touch this close to the next checkpoint reaches it. */
export const TRACE_RADIUS = 10;
/** A touch further than this from the stroke counts as wandering off. */
export const STRAY_DISTANCE = 18;
/** Checkpoints a quick finger may skip past in one move. */
const LOOK_AHEAD = 3;

export type TraceState = {
  stroke: number;
  next: number;
  strays: number;
  astray: boolean;
  /** A stroke just ended; further movement is ignored until the finger lifts. */
  awaitingLift: boolean;
  done: boolean;
};

export const START_TRACE: TraceState = {
  stroke: 0,
  next: 0,
  strays: 0,
  astray: false,
  awaitingLift: false,
  done: false,
};

/**
 * Advances a trace by one touch. Progress is never lost: lifting the finger
 * or wandering away only pauses it, and each time the finger wanders off the
 * stroke counts once as a stray so help can come closer.
 */
export function traceTouch(
  trace: LetterTrace,
  state: TraceState,
  point: TracePoint,
): TraceState {
  if (state.done || state.awaitingLift) return state;
  const checkpoints = trace.checkpoints[state.stroke] ?? [];
  let next = state.next;
  const limit = Math.min(state.next + LOOK_AHEAD, checkpoints.length - 1);
  for (let index = state.next; index <= limit; index += 1) {
    const checkpoint = checkpoints[index];
    if (checkpoint && distance(point, checkpoint) <= TRACE_RADIUS) {
      next = index + 1;
    }
  }
  const nearest = Math.min(
    ...checkpoints.map((checkpoint) => distance(point, checkpoint)),
  );
  const wandering = nearest > STRAY_DISTANCE;
  const strays = state.strays + (wandering && !state.astray ? 1 : 0);

  if (next >= checkpoints.length) {
    const stroke = state.stroke + 1;
    return {
      stroke,
      next: 0,
      strays,
      astray: false,
      awaitingLift: true,
      done: stroke >= trace.checkpoints.length,
    };
  }
  return { ...state, next, strays, astray: wandering };
}

/** The finger left the screen: the next touch may start the next stroke. */
export function traceLift(state: TraceState): TraceState {
  return { ...state, awaitingLift: false, astray: false };
}

/** Letters with one smooth stroke and few dots, for the first tracing levels. */
export const SIMPLE_TRACE_LETTERS: readonly LetterId[] = [
  'alif',
  'ba',
  'ta',
  'dal',
  'ra',
  'lam',
  'nun',
  'waw',
  'ha',
];

export function pickTraceLetter(level: TraceLevel, random: Random): LetterId {
  return pickOne(
    random,
    level.letters === 'simple' ? SIMPLE_TRACE_LETTERS : LETTER_IDS,
  );
}
