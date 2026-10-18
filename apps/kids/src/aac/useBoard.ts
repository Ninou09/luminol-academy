import { aacCardUtterance, type SpeechItem } from '@luminol/kids-content';
import {
  releasedMedia,
  type AacBoard,
  type BoardCard,
} from '@luminol/kids-learning';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { MediaService } from '../media/media';
import { useAppState } from '../state/AppState';

/** What a card says, in the parent's recorded voice when there is one. */
export function cardSpeech(card: BoardCard, media: MediaService): SpeechItem {
  const utterance = aacCardUtterance(card);
  return card.voicePath
    ? { utterance, recordingUri: media.uri(card.voicePath) }
    : { utterance };
}

/**
 * A child's board, reloaded whenever the screen comes into focus. Saving
 * deletes any photo or recording the new board no longer uses.
 */
export function useBoard(childId: string | undefined) {
  const { services } = useAppState();
  const [board, setBoard] = useState<AacBoard | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!childId) return;
      let active = true;
      void services.repository.getBoard(childId).then((loaded) => {
        if (active) setBoard(loaded);
      });
      return () => {
        active = false;
      };
    }, [childId, services]),
  );

  const save = useCallback(
    async (next: AacBoard) => {
      if (!childId) return;
      const before = await services.repository.getBoard(childId);
      await services.repository.saveBoard(childId, next, services.now());
      for (const path of releasedMedia(before, next)) {
        services.media.remove(path);
      }
      setBoard(next);
    },
    [childId, services],
  );

  return { board, save };
}
