import { describe, expect, it } from 'vitest';

import {
  AAC_BUILTIN_CARDS,
  AAC_CARD_IDS,
  AAC_CATEGORIES,
  AAC_PICTURES,
  aacBoardSchema,
  aacLabelSchema,
  addToSentence,
  EMPTY_AAC_BOARD,
  findCard,
  MAX_SENTENCE_LENGTH,
  photoPathSchema,
  releasedMedia,
  removeCustomCard,
  removeLastWord,
  resolveBoard,
  setOverride,
  upsertCustomCard,
  visibleCards,
  voicePathSchema,
  type CustomCard,
} from './aac';

const CHILD = '7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b';
const FILE = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const OTHER_FILE = '1a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const photo = (file = FILE) => `children/${CHILD}/aac/${file}.jpg`;
const voice = (file = FILE) => `children/${CHILD}/aac/${file}.m4a`;

const custom: CustomCard = {
  id: '2b1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b',
  label: 'جدّتي',
  category: 'people',
  photoPath: photo(),
  voicePath: null,
  hidden: false,
};

describe('AAC catalog', () => {
  it('uses every bundled picture and only bundled pictures', () => {
    const used = new Set(
      Object.values(AAC_BUILTIN_CARDS).flatMap((card) => [...card.pictures]),
    );
    expect([...used].sort()).toEqual([...AAC_PICTURES].sort());
  });

  it('has cards in every category', () => {
    for (const category of AAC_CATEGORIES) {
      expect(visibleCards(EMPTY_AAC_BOARD, category).length).toBeGreaterThan(0);
    }
  });

  it('offers two pictures for mother', () => {
    expect(AAC_BUILTIN_CARDS.mother.pictures).toEqual(['mother', 'mother-2']);
  });
});

describe('media paths', () => {
  it('accepts only files inside a child folder', () => {
    expect(photoPathSchema.safeParse(photo()).success).toBe(true);
    expect(voicePathSchema.safeParse(voice()).success).toBe(true);
    expect(photoPathSchema.safeParse(voice()).success).toBe(false);
    expect(photoPathSchema.safeParse(`children/../${FILE}.jpg`).success).toBe(
      false,
    );
    expect(photoPathSchema.safeParse(`/etc/${FILE}.jpg`).success).toBe(false);
    expect(
      photoPathSchema.safeParse(`children/${CHILD}/aac/../../${FILE}.jpg`)
        .success,
    ).toBe(false);
  });

  it('validates card labels', () => {
    expect(aacLabelSchema.parse('  جدّتي ')).toBe('جدّتي');
    expect(aacLabelSchema.safeParse('').success).toBe(false);
    expect(aacLabelSchema.safeParse('<b>').success).toBe(false);
    expect(aacLabelSchema.safeParse('أ'.repeat(31)).success).toBe(false);
  });
});

describe('resolveBoard', () => {
  it('lists built-in cards first, then custom cards', () => {
    const board = upsertCustomCard(EMPTY_AAC_BOARD, custom);
    const cards = resolveBoard(board);
    expect(cards).toHaveLength(AAC_CARD_IDS.length + 1);
    expect(cards.at(-1)).toMatchObject({
      source: 'custom',
      label: 'جدّتي',
      picture: { kind: 'photo', path: photo() },
    });
  });

  it('applies hidden cards, parent photos and recordings', () => {
    let board = setOverride(EMPTY_AAC_BOARD, 'water', {
      hidden: false,
      picture: { kind: 'photo', path: photo() },
      voicePath: voice(),
    });
    board = setOverride(board, 'milk', {
      hidden: true,
      picture: null,
      voicePath: null,
    });
    expect(findCard(board, 'water')).toMatchObject({
      picture: { kind: 'photo', path: photo() },
      voicePath: voice(),
    });
    expect(visibleCards(board, 'food').map((card) => card.id)).not.toContain(
      'milk',
    );
  });

  it('ignores a built-in picture the card does not offer', () => {
    const board = setOverride(EMPTY_AAC_BOARD, 'water', {
      hidden: false,
      picture: { kind: 'builtin', id: 'ball' },
      voicePath: null,
    });
    expect(findCard(board, 'water')?.picture).toEqual({
      kind: 'builtin',
      id: 'water',
    });
    const mother = setOverride(EMPTY_AAC_BOARD, 'mother', {
      hidden: false,
      picture: { kind: 'builtin', id: 'mother-2' },
      voicePath: null,
    });
    expect(findCard(mother, 'mother')?.picture).toEqual({
      kind: 'builtin',
      id: 'mother-2',
    });
  });

  it('drops an override that matches the defaults', () => {
    const board = setOverride(EMPTY_AAC_BOARD, 'water', {
      hidden: false,
      picture: null,
      voicePath: null,
    });
    expect(board.overrides).toEqual({});
  });

  it('round-trips through the schema', () => {
    const board = upsertCustomCard(
      setOverride(EMPTY_AAC_BOARD, 'yes', {
        hidden: true,
        picture: null,
        voicePath: null,
      }),
      custom,
    );
    expect(aacBoardSchema.parse(JSON.parse(JSON.stringify(board)))).toEqual(
      board,
    );
  });
});

describe('sentences', () => {
  it('adds words up to the maximum and removes the last one', () => {
    let sentence: string[] = [];
    for (let index = 0; index < MAX_SENTENCE_LENGTH + 2; index += 1) {
      sentence = addToSentence(sentence, `word-${index}`);
    }
    expect(sentence).toHaveLength(MAX_SENTENCE_LENGTH);
    expect(sentence.at(-1)).toBe(`word-${MAX_SENTENCE_LENGTH - 1}`);
    expect(removeLastWord(sentence)).toHaveLength(MAX_SENTENCE_LENGTH - 1);
    expect(removeLastWord([])).toEqual([]);
  });
});

describe('releasedMedia', () => {
  it('reports files a change stops using', () => {
    const before = upsertCustomCard(
      setOverride(EMPTY_AAC_BOARD, 'water', {
        hidden: false,
        picture: { kind: 'photo', path: photo(OTHER_FILE) },
        voicePath: voice(),
      }),
      { ...custom, voicePath: voice(OTHER_FILE) },
    );
    const after = removeCustomCard(
      setOverride(before, 'water', {
        hidden: false,
        picture: null,
        voicePath: voice(),
      }),
      custom.id,
    );
    expect(releasedMedia(before, after).sort()).toEqual(
      [photo(OTHER_FILE), photo(), voice(OTHER_FILE)].sort(),
    );
    expect(releasedMedia(after, after)).toEqual([]);
  });

  it('updates a custom card in place', () => {
    const board = upsertCustomCard(upsertCustomCard(EMPTY_AAC_BOARD, custom), {
      ...custom,
      label: 'جدّي',
    });
    expect(board.customCards).toHaveLength(1);
    expect(board.customCards[0]?.label).toBe('جدّي');
  });
});
