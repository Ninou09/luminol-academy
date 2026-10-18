import {
  resolveSpeech,
  type RecordedAudioManifest,
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
  stop(): void;
  /** Whether the device has an Arabic text-to-speech voice installed. */
  hasArabicVoice(): Promise<boolean>;
}

export class DeviceSpeechService implements SpeechService {
  private player: AudioPlayer | null = null;

  constructor(private readonly manifest: RecordedAudioManifest<number>) {}

  say(utterance: Utterance, settings: SpeechSettings): void {
    this.stop();
    if (settings.volume <= 0) return;
    const source = resolveSpeech(utterance, settings.dialect, this.manifest);
    if (source.kind === 'recorded') {
      const player = createAudioPlayer(source.asset);
      player.volume = settings.volume;
      player.play();
      this.player = player;
      return;
    }
    Speech.speak(source.text, {
      language: source.language,
      rate: VOICE_SPEED_RATES[settings.voiceSpeed],
      volume: settings.volume,
    });
  }

  stop(): void {
    if (this.player) {
      this.player.pause();
      this.player.remove();
      this.player = null;
    }
    void Speech.stop();
  }

  async hasArabicVoice(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((voice) =>
      voice.language.toLowerCase().startsWith('ar'),
    );
  }
}
