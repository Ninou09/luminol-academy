import {
  AGE_BANDS,
  PIECE_COLORS,
  PIECE_SIZES,
  SESSION_MINUTES,
  SHAPES,
  SKILL_IDS,
  firstThen,
  planSession,
  skillsForAge,
} from '@luminol/kids-learning';

import { aacBuiltinUtterances, aacCategoryUtterances } from './aac';
import { PHRASE_KEYS, phrase, skillTitle } from './phrases';
import { colorName, describePiece, shapeName, sizeName } from './pieces';
import { scheduleAnnouncement } from './schedule';
import type { Utterance } from './utterance';

export type SpokenCategory =
  | 'phrase'
  | 'activity'
  | 'schedule'
  | 'group'
  | 'shape'
  | 'aac-card'
  | 'aac-group';

export type SpokenEntry = Utterance & { category: SpokenCategory };

/** Every first-then pair the session planner can actually produce. */
function scheduleAnnouncements(): Utterance[] {
  const byKey = new Map<string, Utterance>();
  for (const ageBand of AGE_BANDS) {
    const rotation = skillsForAge(ageBand).length;
    for (const sessionMinutes of SESSION_MINUTES) {
      for (
        let previousSessions = 0;
        previousSessions < rotation;
        previousSessions += 1
      ) {
        const steps = planSession({
          ageBand,
          sessionMinutes,
          previousSessions,
        });
        for (let completed = 0; completed < steps.length; completed += 1) {
          const pair = firstThen(steps, completed);
          if (!pair) continue;
          const utterance = scheduleAnnouncement(pair.first, pair.then);
          byKey.set(utterance.key, utterance);
        }
      }
    }
  }
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Everything the app can say aloud with a fixed text: the list voice actors
 * record and specialists review. Children's nicknames are always read by the
 * device voice, so they are not listed.
 */
export function spokenCatalog(): SpokenEntry[] {
  const tag =
    (category: SpokenCategory) =>
    (utterance: Utterance): SpokenEntry => ({ ...utterance, category });
  return [
    ...PHRASE_KEYS.map(phrase).map(tag('phrase')),
    ...SKILL_IDS.map(skillTitle).map(tag('activity')),
    ...scheduleAnnouncements().map(tag('schedule')),
    ...PIECE_COLORS.map(colorName).map(tag('group')),
    ...SHAPES.map(shapeName).map(tag('group')),
    ...PIECE_SIZES.map(sizeName).map(tag('group')),
    ...SHAPES.flatMap((shape) =>
      PIECE_COLORS.map((color) =>
        describePiece({ shape, color, size: 'medium' }),
      ),
    ).map(tag('shape')),
    ...aacBuiltinUtterances().map(tag('aac-card')),
    ...aacCategoryUtterances().map(tag('aac-group')),
  ];
}

const CATEGORY_LABELS: Record<SpokenCategory, string> = {
  phrase: 'Instruction, praise or calm corner',
  activity: 'Activity name',
  schedule: 'Schedule (first, then)',
  group: 'Sorting group name / hint',
  shape: 'Shape name / hint',
  'aac-card': 'Communication board word',
  'aac-group': 'Communication board group',
};

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/**
 * The recording sheet as CSV, with a byte-order mark so spreadsheet apps
 * display the Arabic correctly.
 */
export function recordingSheetCsv(): string {
  const header = [
    '#',
    'key',
    'text_msa',
    'where_heard',
    'file_name',
    'specialist_approved',
  ];
  const rows = spokenCatalog().map((entry, index) => [
    String(index + 1),
    entry.key,
    entry.text,
    CATEGORY_LABELS[entry.category],
    `${entry.key}.m4a`,
    '',
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}
