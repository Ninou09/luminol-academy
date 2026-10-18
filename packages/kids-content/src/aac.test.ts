import {
  AAC_CARD_IDS,
  AAC_PICTURES,
  EMPTY_AAC_BOARD,
  findCard,
  upsertCustomCard,
} from '@luminol/kids-learning';
import { describe, expect, it } from 'vitest';

import {
  aacBuiltinUtterances,
  aacCardLabel,
  aacCardUtterance,
  aacCategoryUtterances,
  aacPictureLabel,
} from './aac';
import { PARENT_COPY } from './parent-copy';

const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]/;

describe('communication board content', () => {
  it('labels every card, group and picture in Arabic', () => {
    for (const { key, text } of [
      ...aacBuiltinUtterances(),
      ...aacCategoryUtterances(),
    ]) {
      expect(text, key).toMatch(ARABIC);
      expect(text, key).not.toMatch(LATIN);
    }
    for (const picture of AAC_PICTURES) {
      expect(aacPictureLabel(picture)).toMatch(ARABIC);
    }
  });

  it('tells the two mother pictures apart for parents', () => {
    expect(aacPictureLabel('mother')).not.toBe(aacPictureLabel('mother-2'));
    expect(aacCardLabel('mother')).toBe('أمي');
  });

  it('gives each built-in word its own recording key', () => {
    const keys = aacBuiltinUtterances().map((utterance) => utterance.key);
    expect(new Set(keys).size).toBe(AAC_CARD_IDS.length);
  });

  it('reads parent cards with their own label', () => {
    const board = upsertCustomCard(EMPTY_AAC_BOARD, {
      id: '2b1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b',
      label: 'جدّتي',
      category: 'people',
      photoPath:
        'children/7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b/aac/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg',
      voicePath: null,
      hidden: false,
    });
    const card = findCard(board, '2b1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b');
    expect(card && aacCardUtterance(card)).toEqual({
      key: 'aac.custom.2b1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b',
      text: 'جدّتي',
    });
  });

  it('has Arabic parent copy for the board editor', () => {
    for (const text of [
      ...Object.values(PARENT_COPY.board),
      ...Object.values(PARENT_COPY.card),
    ]) {
      expect(text).toMatch(ARABIC);
    }
  });
});
