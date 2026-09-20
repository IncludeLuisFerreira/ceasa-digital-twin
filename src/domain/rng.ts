export function nextRandom(state: number): [number, number] {
  const a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, a];
}

export function randomInt(rng: number, min: number, max: number): [number, number] {
  const [v, next] = nextRandom(rng);
  return [min + Math.floor(v * (max - min + 1)), next];
}

export function pick<T>(rng: number, arr: T[]): [T, number] {
  const [v, next] = nextRandom(rng);
  return [arr[Math.floor(v * arr.length)], next];
}
