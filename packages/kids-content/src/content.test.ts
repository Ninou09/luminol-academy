import {
  AVATARS,
  PIECE_COLORS,
  SHAPES,
  SKILL_IDS,
  type Piece,
} from '@luminol/kids-learning';
import { describe, expect, it } from 'vitest';

import {
  AGE_BAND_LABELS,
  DIALECT_LABELS,
  minutesLabel,
  PARENT_COPY,
  volumeLabel,
} from './parent-copy';
import { PHRASE_KEYS, phrase, praiseFor, skillTitle } from './phrases';
import { avatarLabel, binLabel, describePiece } from './pieces';
import {
  planPlayback,
  recordedDialects,
  resolveSpeech,
  type RecordedAudioManifest,
} from './speech';
import type { Utterance } from './utterance';

const ARABIC = /[\u0600-\u06FF]/;
const LATIN = /[A-Za-z]/;

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(collectStrings);
  return [];
}

function allUtterances(): Utterance[] {
  const pieces: Piece[] = SHAPES.flatMap((shape) =>
    PIECE_COLORS.map((color) => ({ shape, color, size: 'large' as const })),
  );
  return [
    ...PHRASE_KEYS.map(phrase),
    ...SKILL_IDS.map(skillTitle),
    ...pieces.map((piece) => describePiece(piece)),
    ...pieces.map((piece) => describePiece(piece, { includeSize: true })),
    ...AVATARS.map(avatarLabel),
  ];
}

describe('spoken content', () => {
  it('is Arabic text with no Latin placeholders', () => {
    for (const utterance of allUtterances()) {
      expect(utterance.text, utterance.key).toMatch(ARABIC);
      expect(utterance.text, utterance.key).not.toMatch(LATIN);
    }
  });

  it('gives every distinct text its own recording key', () => {
    const byKey = new Map<string, string>();
    for (const { key, text } of allUtterances()) {
      const existing = byKey.get(key);
      if (existing !== undefined) expect(existing).toBe(text);
      byKey.set(key, text);
    }
  });

  it('never uses failure language', () => {
    for (const { text } of allUtterances()) {
      expect(text).not.toMatch(/خطأ|خاطئ|فشل|غلط/);
    }
  });

  it('rotates praise predictably', () => {
    expect(praiseFor(0)).toEqual(praiseFor(4));
    expect(praiseFor(0)).not.toEqual(praiseFor(1));
  });
});

describe('piece names', () => {
  it('agrees adjectives with the shape gender', () => {
    expect(
      describePiece({ shape: 'circle', color: 'red', size: 'large' }).text,
    ).toBe('الدائرة الحمراء');
    expect(
      describePiece({ shape: 'square', color: 'blue', size: 'large' }).text,
    ).toBe('المربع الأزرق');
    expect(
      describePiece(
        { shape: 'star', color: 'green', size: 'small' },
        { includeSize: true },
      ).text,
    ).toBe('النجمة الخضراء الصغيرة');
    expect(avatarLabel('triangle-green').text).toBe('مثلث أخضر');
  });

  it('labels sorting bins by the sorted feature', () => {
    expect(binLabel({ dimension: 'color', value: 'yellow' }).text).toBe('أصفر');
    expect(binLabel({ dimension: 'shape', value: 'heart' }).text).toBe('قلب');
    expect(binLabel({ dimension: 'size', value: 'small' }).text).toBe('صغير');
  });
});

describe('resolveSpeech', () => {
  const utterance = phrase('hint.look');
  const manifest: RecordedAudioManifest<number> = {
    [utterance.key]: { maghrebi: 11, msa: 10 },
    [phrase('calm.inhale').key]: { msa: 20 },
  };

  it('prefers the recorded dialect clip', () => {
    expect(resolveSpeech(utterance, 'maghrebi', manifest)).toEqual({
      kind: 'recorded',
      asset: 11,
      dialect: 'maghrebi',
      isFallback: false,
    });
  });

  it('falls back to recorded MSA, then to MSA text-to-speech', () => {
    expect(resolveSpeech(utterance, 'gulf', manifest)).toMatchObject({
      kind: 'recorded',
      asset: 10,
      isFallback: true,
    });
    expect(resolveSpeech(phrase('calm.exhale'), 'gulf', manifest)).toEqual({
      kind: 'tts',
      text: 'زفير',
      language: 'ar',
      isFallback: true,
    });
  });

  it('reports which dialects have any recording', () => {
    expect(recordedDialects(manifest).sort()).toEqual(['maghrebi', 'msa']);
    expect(recordedDialects({})).toEqual([]);
  });
});

describe('parent copy', () => {
  it('is fully Arabic', () => {
    const strings = collectStrings([
      PARENT_COPY,
      DIALECT_LABELS,
      AGE_BAND_LABELS,
    ]);
    for (const text of strings) expect(text).toMatch(ARABIC);
  });

  it('uses the correct Arabic counted noun for minutes', () => {
    expect(minutesLabel(5)).toBe('5 دقائق');
    expect(minutesLabel(10)).toBe('10 دقائق');
    expect(minutesLabel(15)).toBe('15 دقيقة');
    expect(volumeLabel(0)).toBe('صامت');
    expect(volumeLabel(0.75)).toBe('75%');
  });
});

describe('planPlayback', () => {
  const manifest: RecordedAudioManifest<number> = {
    'aac.card.want': { msa: 1 },
  };
  const word = (key: string, text: string) => ({ utterance: { key, text } });

  it('plays recordings in order and joins neighbouring device-voice words', () => {
    expect(
      planPlayback(
        [
          word('aac.card.want', 'أريد'),
          word('aac.card.water', 'ماء'),
          word('aac.card.bread', 'خبز'),
          {
            ...word('aac.card.mother', 'أمي'),
            recordingUri: 'file:///mum.m4a',
          },
        ],
        'maghrebi',
        manifest,
      ),
    ).toEqual([
      { kind: 'clip', source: 1 },
      { kind: 'tts', text: 'ماء خبز' },
      { kind: 'clip', source: 'file:///mum.m4a' },
    ]);
  });

  it('returns nothing for an empty sentence', () => {
    expect(planPlayback([], 'msa', manifest)).toEqual([]);
  });
});
