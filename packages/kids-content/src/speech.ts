import type { Dialect } from '@luminol/kids-learning';

import type { Utterance } from './utterance';

/**
 * Recorded clips keyed by utterance key and dialect. The asset type is left
 * to the app (a bundled module id on device).
 */
export type RecordedAudioManifest<Asset> = Readonly<
  Record<string, Readonly<Partial<Record<Dialect, Asset>>>>
>;

export type SpeechSource<Asset> =
  | {
      kind: 'recorded';
      asset: Asset;
      dialect: Dialect;
      /** True when the requested dialect was missing and MSA was used. */
      isFallback: boolean;
    }
  | {
      /**
       * Device text-to-speech, the clearly marked fallback until a recording
       * exists. Device voices only speak Modern Standard Arabic.
       */
      kind: 'tts';
      text: string;
      language: 'ar';
      isFallback: true;
    };

/** Recorded dialect clip, then recorded MSA clip, then MSA text-to-speech. */
export function resolveSpeech<Asset>(
  utterance: Utterance,
  dialect: Dialect,
  manifest: RecordedAudioManifest<Asset>,
): SpeechSource<Asset> {
  const clips = manifest[utterance.key];
  const exact = clips?.[dialect];
  if (exact !== undefined) {
    return { kind: 'recorded', asset: exact, dialect, isFallback: false };
  }
  const standard = clips?.msa;
  if (standard !== undefined) {
    return {
      kind: 'recorded',
      asset: standard,
      dialect: 'msa',
      isFallback: true,
    };
  }
  return {
    kind: 'tts',
    text: utterance.text,
    language: 'ar',
    isFallback: true,
  };
}

export function recordedDialects<Asset>(
  manifest: RecordedAudioManifest<Asset>,
): Dialect[] {
  const found = new Set<Dialect>();
  for (const clips of Object.values(manifest)) {
    for (const dialect of Object.keys(clips) as Dialect[]) found.add(dialect);
  }
  return [...found];
}

/** One thing to say, optionally in a parent's own recorded voice. */
export type SpeechItem = {
  utterance: Utterance;
  /** A file URI of a parent recording; it wins over every other source. */
  recordingUri?: string;
};

export type PlaybackStep<Asset> =
  { kind: 'clip'; source: Asset | string } | { kind: 'tts'; text: string };

/**
 * Turns a sentence into playback steps. Neighbouring text-to-speech words are
 * joined so the device voice reads them as one natural phrase.
 */
export function planPlayback<Asset>(
  items: readonly SpeechItem[],
  dialect: Dialect,
  manifest: RecordedAudioManifest<Asset>,
): PlaybackStep<Asset>[] {
  const steps: PlaybackStep<Asset>[] = [];
  for (const item of items) {
    if (item.recordingUri) {
      steps.push({ kind: 'clip', source: item.recordingUri });
      continue;
    }
    const source = resolveSpeech(item.utterance, dialect, manifest);
    if (source.kind === 'recorded') {
      steps.push({ kind: 'clip', source: source.asset });
      continue;
    }
    const previous = steps.at(-1);
    if (previous?.kind === 'tts')
      previous.text = `${previous.text} ${source.text}`;
    else steps.push({ kind: 'tts', text: source.text });
  }
  return steps;
}
