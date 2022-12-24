/**
 *
 * Generates deterministic psuedo-random numbers from a given seed
 * Uses a Linear Congruential Generator (LCG)
 */
export function* srand(seed: number): Generator<number, number> {
  /**
   * Values from
   * Numerical Recipes from the "quick and dirty generators" list,
   * Chapter 7.1, Eq. 7.1.6 parameters from Knuth and H. W. Lewis
   */
  const modulus = Math.pow(2, 32);
  const multiplier = 1664525;
  const increment = 1013904223;

  while (true) {
    seed = (multiplier * seed + increment) % modulus;
    yield seed / Math.pow(2, 32);
  }
}

/**
 * Creates a valid seed for random number generation from a string
 * @param str Any string of any length. Case insensitive.
 * @returns
 */
export async function createSeed(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  const intArr = new Int32Array(hash);
  const value = Math.abs(intArr[0]);
  return value;
}
