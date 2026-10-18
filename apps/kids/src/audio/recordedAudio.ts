import type { RecordedAudioManifest } from '@luminol/kids-content';

/**
 * Recorded voice-over clips, keyed by utterance key and dialect, e.g.
 * `'phrase.hint.look': { msa: require('../../assets/audio/msa/phrase.hint.look.m4a') }`.
 * The keys and file names come from docs/kids/voice-recording-list.csv.
 *
 * No recordings have been delivered yet, so every utterance currently uses
 * the marked text-to-speech fallback in Modern Standard Arabic. Adding a clip
 * here replaces the fallback for that utterance only; no other code changes.
 */
export const RECORDED_AUDIO: RecordedAudioManifest<number> = {};
