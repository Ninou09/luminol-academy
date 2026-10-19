import {
  releasedSequenceMedia,
  type ChildSequences,
} from '@luminol/kids-learning';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAppState } from '../state/AppState';

/**
 * A child's routines and stories, reloaded whenever the screen comes into
 * focus. Saving deletes any photo or recording they no longer use.
 */
export function useSequences(childId: string | undefined) {
  const { services } = useAppState();
  const [sequences, setSequences] = useState<ChildSequences | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!childId) return;
      let active = true;
      void services.repository.getSequences(childId).then((loaded) => {
        if (active) setSequences(loaded);
      });
      return () => {
        active = false;
      };
    }, [childId, services]),
  );

  const save = useCallback(
    async (next: ChildSequences) => {
      if (!childId) return;
      const before = await services.repository.getSequences(childId);
      await services.repository.saveSequences(childId, next, services.now());
      for (const path of releasedSequenceMedia(before, next)) {
        services.media.remove(path);
      }
      setSequences(next);
    },
    [childId, services],
  );

  return { sequences, save };
}
