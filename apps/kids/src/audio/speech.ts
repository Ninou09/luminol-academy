import {
  planPlayback,
  type PlaybackStep,
  type RecordedAudioManifest,
  type SpeechItem,
  type Utterance,
} from '@luminol/kids-content';
import {
  VOICE_SPEED_RATES,
  type Dialect,
  type VoiceSpeed,
} from '@luminol/kids-learning';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

export type SpeechSettings = {
  dialect: Dialect;
  volume: number;
  voiceSpeed: VoiceSpeed;
};

export interface SpeechService {
  /** Stops anything already playing, then speaks. Silent when volume is 0. */
  say(utterance: Utterance, settings: SpeechSettings): void;
  /** Like `say`, for several items in order, e.g. a board sentence. */
  sayAll(items: readonly SpeechItem[], settings: SpeechSettings): void;
  stop(): void;
  /** Whether the device has an Arabic text-to-speech voice installed. */
  hasArabicVoice(): Promise<boolean>;
}

export class DeviceSpeechService implements SpeechService {
  private player: AudioPlayer | null = null;
  /** Bumped on every stop so callbacks from earlier speech are ignored. */
  private generation = 0;

  constructor(private readonly manifest: RecordedAudioManifest<number>) {}

  say(utterance: Utterance, settings: SpeechSettings): void {
    this.sayAll([{ utterance }], settings);
  }

  sayAll(items: readonly SpeechItem[], settings: SpeechSettings): void {
    this.stop();
    if (settings.volume <= 0) return;
    const steps = planPlayback(items, settings.dialect, this.manifest);
    this.play(steps, 0, this.generation, settings);
  }

  private play(
    steps: readonly PlaybackStep<number>[],
    index: number,
    generation: number,
    settings: SpeechSettings,
  ): void {
    const step = steps[index];
    if (step === undefined || generation !== this.generation) return;
    const next = () => {
      if (generation !== this.generation) return;
      this.releasePlayer();
      this.play(steps, index + 1, generation, settings);
    };
    if (step.kind === 'tts') {
      Speech.speak(step.text, {
        language: 'ar',
        rate: VOICE_SPEED_RATES[settings.voiceSpeed],
        volume: settings.volume,
        onDone: next,
      });
      return;
    }
    const player = createAudioPlayer(step.source);
    player.volume = settings.volume;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) next();
    });
    player.play();
    this.player = player;
  }

  private releasePlayer(): void {
    if (this.player) {
      this.player.pause();
      this.player.remove();
      this.player = null;
    }
  }

  stop(): void {
    this.generation += 1;
    this.releasePlayer();
    void Speech.stop();
  }

  async hasArabicVoice(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((voice) =>
      voice.language.toLowerCase().startsWith('ar'),
    );
  }
}
