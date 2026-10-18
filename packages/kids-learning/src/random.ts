/** A deterministic source of numbers in [0, 1) so rounds can be replayed in tests. */
export type Random = () => number;

/** Mulberry32: small, fast and good enough for shuffling game pieces. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(random: Random, maxExclusive: number): number {
  return Math.floor(random() * maxExclusive);
}

export function pickOne<T>(random: Random, items: readonly T[]): T {
  const item = items[randomInt(random, items.length)];
  if (item === undefined) {
    throw new Error('Cannot pick from an empty list.');
  }
  return item;
}

export function shuffle<T>(random: Random, items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, index + 1);
    const current = result[index] as T;
    result[index] = result[swapIndex] as T;
    result[swapIndex] = current;
  }
  return result;
}

/** Picks `count` distinct items in random order. */
export function sample<T>(
  random: Random,
  items: readonly T[],
  count: number,
): T[] {
  if (count > items.length) {
    throw new Error(`Cannot sample ${count} items from ${items.length}.`);
  }
  return shuffle(random, items).slice(0, count);
}
