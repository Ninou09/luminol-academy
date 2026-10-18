import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { recordingSheetCsv, spokenCatalog } from './catalog';

const SHEET = fileURLToPath(
  new URL('../../../docs/kids/voice-recording-list.csv', import.meta.url),
);

describe('spoken catalog', () => {
  it('lists each recording key once', () => {
    const keys = spokenCatalog().map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('includes every schedule announcement the planner can produce', () => {
    const texts = spokenCatalog()
      .filter((entry) => entry.category === 'schedule')
      .map((entry) => entry.text);
    expect(texts).toContain('أوّلًا المس وشاهد، ثمّ مطابقة الأشكال');
    expect(texts).toContain('أوّلًا احتفال صغير');
  });

  // Regenerate with: UPDATE_RECORDING_LIST=1 pnpm vitest run packages/kids-content
  it('matches the committed recording sheet', () => {
    const expected = recordingSheetCsv();
    if (process.env.UPDATE_RECORDING_LIST) writeFileSync(SHEET, expected);
    expect(readFileSync(SHEET, 'utf8')).toBe(expected);
  });
});
