import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { AGE_BANDS, planSession } from '@luminol/kids-learning';

import { recordingSheetCsv, spokenCatalog } from './catalog';
import { scheduleAnnouncement } from './schedule';

const SHEET = fileURLToPath(
  new URL('../../../docs/kids/voice-recording-list.csv', import.meta.url),
);

describe('spoken catalog', () => {
  it('lists each recording key once', () => {
    const keys = spokenCatalog().map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers every part of a schedule announcement', () => {
    const keys = new Set(spokenCatalog().map((entry) => entry.key));
    for (const ageBand of AGE_BANDS) {
      const steps = planSession({
        ageBand,
        sessionMinutes: 20,
        previousSessions: 0,
      });
      steps.forEach((step, index) => {
        for (const part of scheduleAnnouncement(step, steps[index + 1] ?? null))
          expect(keys).toContain(part.key);
      });
    }
  });

  // Regenerate with: UPDATE_RECORDING_LIST=1 pnpm vitest run packages/kids-content
  it('matches the committed recording sheet', () => {
    const expected = recordingSheetCsv();
    if (process.env.UPDATE_RECORDING_LIST) writeFileSync(SHEET, expected);
    expect(readFileSync(SHEET, 'utf8')).toBe(expected);
  });
});
