import {
  storyPage,
  storyTitle,
  type SpeechItem,
  type Utterance,
} from '@luminol/kids-content';
import {
  BUILTIN_STORIES,
  isBuiltinStoryId,
  type ChildSequences,
  type Sequence,
  type StepPicture,
} from '@luminol/kids-learning';

import type { MediaService } from '../media/media';

/** One page of a story or one step of a routine, ready to show and say. */
export type Page = {
  key: string;
  picture: StepPicture;
  speech: SpeechItem;
};

export type ReadableSequence = {
  id: string;
  title: Utterance;
  pages: Page[];
};

/** Parents' sentences are read by the device voice unless they recorded one. */
function parentPages(sequence: Sequence, media: MediaService): Page[] {
  return sequence.steps.map((step) => {
    const utterance = {
      key: `sequence.${sequence.id}.${step.id}`,
      text: step.text,
    };
    return {
      key: step.id,
      picture: step.picture,
      speech: step.voicePath
        ? { utterance, recordingUri: media.uri(step.voicePath) }
        : { utterance },
    };
  });
}

export function parentTitle(sequence: Sequence): Utterance {
  return { key: `sequence.${sequence.id}.title`, text: sequence.title };
}

/** A built-in story or one of the child's own, by id; null if unknown. */
export function findReadable(
  id: string,
  sequences: ChildSequences,
  media: MediaService,
  kind: Sequence['kind'],
): ReadableSequence | null {
  if (kind === 'story' && isBuiltinStoryId(id)) {
    return {
      id,
      title: storyTitle(id),
      pages: BUILTIN_STORIES[id].pages.map((picture, index) => ({
        key: String(index),
        picture,
        speech: { utterance: storyPage(id, index) },
      })),
    };
  }
  const sequence = sequences.items.find(
    (item) => item.id === id && item.kind === kind,
  );
  return sequence
    ? {
        id,
        title: parentTitle(sequence),
        pages: parentPages(sequence, media),
      }
    : null;
}
