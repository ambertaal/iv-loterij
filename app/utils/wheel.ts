/**
 * Pure helper functions for the lottery wheel.
 * Kept framework-free so they are trivial to unit test.
 */

/**
 * Parse a raw textarea value into a clean list of participant names.
 * - One name per line
 * - Trims whitespace
 * - Drops empty lines
 */
export function parseNames(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Pick a random winner index from `count` participants.
 * `rng` defaults to Math.random but can be injected for deterministic tests.
 */
export function pickWinnerIndex(count: number, rng: () => number = Math.random): number {
  if (count < 1) {
    throw new Error('Er zijn geen deelnemers om uit te trekken.')
  }
  return Math.floor(rng() * count)
}

export interface SpinTargetOptions {
  /** Current rotation of the wheel, in radians. */
  currentRotation: number
  /** Total number of segments (participants) on the wheel. */
  segmentCount: number
  /** Index of the segment that must land on the pointer. */
  winnerIndex: number
  /** Angle of the fixed pointer, in radians. Defaults to the top (-90deg). */
  pointerAngle?: number
  /** Minimum number of full rotations the animation should perform. */
  minExtraSpins?: number
  /** Extra full rotations beyond `minExtraSpins`, useful to inject randomness deterministically in tests. */
  bonusSpins?: number
}

/**
 * Compute the target rotation (in radians) so that the wheel, spinning
 * forward from `currentRotation`, ends with `winnerIndex`'s segment aligned
 * with the pointer, after at least `minExtraSpins` full rotations.
 */
export function computeSpinTarget(options: SpinTargetOptions): number {
  const {
    currentRotation,
    segmentCount,
    winnerIndex,
    pointerAngle = -Math.PI / 2,
    minExtraSpins = 5,
    bonusSpins = 0
  } = options

  if (segmentCount < 1) {
    throw new Error('Er zijn geen segmenten op het rad.')
  }
  if (winnerIndex < 0 || winnerIndex >= segmentCount) {
    throw new Error('winnerIndex valt buiten het aantal deelnemers.')
  }

  const segmentAngle = (Math.PI * 2) / segmentCount
  const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2

  // We need: rotation + segmentCenter ≡ pointerAngle (mod 2π)
  const baseTarget = pointerAngle - segmentCenter
  const totalSpins = minExtraSpins + bonusSpins
  let target = baseTarget + totalSpins * Math.PI * 2

  // Ensure the wheel always spins forward relative to its current rotation,
  // even after many previous spins have accumulated rotation.
  while (target < currentRotation + minExtraSpins * Math.PI * 2) {
    target += Math.PI * 2
  }

  return target
}

/**
 * Ease-out timing function used to animate the spin: fast start, gentle stop.
 */
export function easeOutSpin(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return 1 - Math.pow(1 - clamped, 4.2)
}
