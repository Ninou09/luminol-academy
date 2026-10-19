import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

import { createCalmNoiseWav } from './calmNoise';

export interface CalmSoundService {
  /** Fades the calm sound in to `volume` so it never starts suddenly. */
  start(volume: number): void;
  stop(): void;
}

const FADE_STEPS = 10;
const FADE_STEP_MS = 200;

export class DeviceCalmSound implements CalmSoundService {
  private player: AudioPlayer | null = null;
  private fade: ReturnType<typeof setInterval> | null = null;

  private soundUri(): string {
    const file = new File(Paths.cache, 'calm-noise-v1.wav');
    if (!file.exists) {
      file.create();
      file.write(createCalmNoiseWav());
    }
    return file.uri;
  }

  start(volume: number): void {
    this.stop();
    if (volume <= 0) return;
    const player = createAudioPlayer(this.soundUri());
    player.loop = true;
    player.volume = 0;
    player.play();
    this.player = player;
    let step = 0;
    this.fade = setInterval(() => {
      step += 1;
      player.volume = (volume * step) / FADE_STEPS;
      if (step >= FADE_STEPS) this.clearFade();
    }, FADE_STEP_MS);
  }

  stop(): void {
    this.clearFade();
    if (this.player) {
      this.player.pause();
      this.player.remove();
      this.player = null;
    }
  }

  private clearFade() {
    if (this.fade) {
      clearInterval(this.fade);
      this.fade = null;
    }
  }
}
