import {
  PIECE_COLORS,
  PIECE_SIZES,
  SHAPES,
  SKILL_IDS,
} from '@luminol/kids-learning';

import { aacBuiltinUtterances, aacCategoryUtterances } from './aac';
import { letterUtterances, numberUtterances } from './letters';
import { PHRASE_KEYS, phrase, skillTitle } from './phrases';
import { colorName, describePiece, shapeName, sizeName } from './pieces';
import { socialUtterances } from './social';
import { gamePictureUtterances } from './themes';
import type { Utterance } from './utterance';

export type SpokenCategory =
  | 'phrase'
  | 'activity'
  | 'group'
  | 'shape'
  | 'aac-card'
  | 'aac-group'
  | 'letter'
  | 'number'
  | 'social'
  | 'picture';

export type SpokenEntry = Utterance & { category: SpokenCategory };

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
    ...letterUtterances().map(tag('letter')),
    ...numberUtterances().map(tag('number')),
    ...socialUtterances().map(tag('social')),
    ...gamePictureUtterances().map(tag('picture')),
  ];
}

const CATEGORY_LABELS: Record<SpokenCategory, string> = {
  phrase: 'Instruction, schedule, praise or calm corner',
  activity: 'Activity name (also spoken in the schedule)',
  group: 'Sorting group name / hint',
  shape: 'Shape name / hint',
  'aac-card': 'Communication board word',
  'aac-group': 'Communication board group',
  letter: 'Letter name or sound',
  number: 'Counting number',
  social: 'Feelings story, question or greeting',
  picture: 'Game picture name (animals, vehicles, sky and space)',
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
