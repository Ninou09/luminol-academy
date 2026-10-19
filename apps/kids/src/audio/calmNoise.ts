import { createRandom } from '@luminol/kids-learning';

export type CalmNoiseOptions = {
  seconds: number;
  sampleRate: number;
  /** Peak level from 0 to 1; kept low so the sound is never startling. */
  peak: number;
  seed: number;
};

export const CALM_NOISE_DEFAULTS: CalmNoiseOptions = {
  seconds: 8,
  sampleRate: 22050,
  peak: 0.3,
  seed: 20261018,
};

function writeAscii(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

/**
 * Generates soft brown noise (like distant wind) as a 16-bit mono WAV file.
 * The end is cross-faded into the start so it loops without a click. It is
 * synthesised in code, so the app ships no third-party audio.
 */
export function createCalmNoiseWav(
  options: CalmNoiseOptions = CALM_NOISE_DEFAULTS,
): Uint8Array {
  const { seconds, sampleRate, peak, seed } = options;
  const length = Math.round(seconds * sampleRate);
  const fade = Math.round(sampleRate * 0.5);
  const random = createRandom(seed);
  const raw = new Float64Array(length + fade);
  let level = 0;
  for (let index = 0; index < raw.length; index += 1) {
    level = (level + (random() * 2 - 1) * 0.02) * 0.995;
    raw[index] = level;
  }
  for (let index = 0; index < fade; index += 1) {
    const mix = index / fade;
    raw[index] =
      (raw[index] ?? 0) * mix + (raw[length + index] ?? 0) * (1 - mix);
  }
  let max = 0;
  for (let index = 0; index < length; index += 1) {
    max = Math.max(max, Math.abs(raw[index] ?? 0));
  }
  const scale = max === 0 ? 0 : (peak * 32767) / max;

  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, length * 2, true);
  for (let index = 0; index < length; index += 1) {
    view.setInt16(44 + index * 2, Math.round((raw[index] ?? 0) * scale), true);
  }
  return new Uint8Array(buffer);
}
