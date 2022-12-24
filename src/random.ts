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
