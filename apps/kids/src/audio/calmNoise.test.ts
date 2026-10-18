import { CALM_NOISE_DEFAULTS, createCalmNoiseWav } from './calmNoise';

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

describe('createCalmNoiseWav', () => {
  const options = { ...CALM_NOISE_DEFAULTS, seconds: 1, sampleRate: 8000 };
  const wav = createCalmNoiseWav(options);
  const view = new DataView(wav.buffer);

  it('writes a valid 16-bit mono PCM WAV header', () => {
    expect(ascii(wav, 0, 4)).toBe('RIFF');
    expect(ascii(wav, 8, 4)).toBe('WAVE');
    expect(ascii(wav, 36, 4)).toBe('data');
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(8000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(wav.length).toBe(44 + 8000 * 2);
  });

  it('stays at or below the gentle peak level', () => {
    let peak = 0;
    for (let offset = 44; offset < wav.length; offset += 2) {
      peak = Math.max(peak, Math.abs(view.getInt16(offset, true)));
    }
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(Math.ceil(options.peak * 32767));
  });

  it('is deterministic for a seed', () => {
    expect(createCalmNoiseWav(options)).toEqual(wav);
  });
});
