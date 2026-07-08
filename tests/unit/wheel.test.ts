import { describe, it, expect } from 'vitest'
import { parseNames, pickWinnerIndex, computeSpinTarget, easeOutSpin } from '~/utils/wheel'

describe('parseNames', () => {
  it('splits on newlines and trims whitespace', () => {
    expect(parseNames('Amber\n  Peter \nNina')).toEqual(['Amber', 'Peter', 'Nina'])
  })

  it('drops empty lines', () => {
    expect(parseNames('Amber\n\n\nPeter\n')).toEqual(['Amber', 'Peter'])
  })

  it('returns an empty array for blank input', () => {
    expect(parseNames('   \n  \n')).toEqual([])
  })
})

describe('pickWinnerIndex', () => {
  it('throws when there are no participants', () => {
    expect(() => pickWinnerIndex(0)).toThrow()
  })

  it('always returns an index within range', () => {
    for (let i = 0; i < 50; i++) {
      const index = pickWinnerIndex(7)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(7)
    }
  })

  it('is deterministic when an rng is injected', () => {
    expect(pickWinnerIndex(10, () => 0)).toBe(0)
    expect(pickWinnerIndex(10, () => 0.99)).toBe(9)
    expect(pickWinnerIndex(4, () => 0.5)).toBe(2)
  })
})

describe('computeSpinTarget', () => {
  it('throws for an empty wheel', () => {
    expect(() => computeSpinTarget({ currentRotation: 0, segmentCount: 0, winnerIndex: 0 })).toThrow()
  })

  it('throws when the winner index is out of range', () => {
    expect(() => computeSpinTarget({ currentRotation: 0, segmentCount: 4, winnerIndex: 4 })).toThrow()
  })

  it('lands the chosen segment center exactly on the pointer angle', () => {
    const segmentCount = 6
    const pointerAngle = -Math.PI / 2

    for (let winnerIndex = 0; winnerIndex < segmentCount; winnerIndex++) {
      const target = computeSpinTarget({ currentRotation: 0, segmentCount, winnerIndex, pointerAngle })
      const segmentAngle = (Math.PI * 2) / segmentCount
      const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2

      // rotation + segmentCenter should be congruent to pointerAngle (mod 2π)
      const resultAngle = normalizeAngle(target + segmentCenter)
      const expectedAngle = normalizeAngle(pointerAngle)
      expect(resultAngle).toBeCloseTo(expectedAngle, 9)
    }
  })

  it('always spins forward relative to the current rotation', () => {
    const target = computeSpinTarget({ currentRotation: 40, segmentCount: 5, winnerIndex: 2, minExtraSpins: 5 })
    expect(target).toBeGreaterThan(40)
  })

  it('adds bonus spins on top of the minimum, landing on the same angle', () => {
    const withoutBonus = computeSpinTarget({ currentRotation: 0, segmentCount: 5, winnerIndex: 1, minExtraSpins: 3, bonusSpins: 0 })
    const withBonus = computeSpinTarget({ currentRotation: 0, segmentCount: 5, winnerIndex: 1, minExtraSpins: 3, bonusSpins: 2 })

    // More bonus spins should always result in at least as much total rotation.
    expect(withBonus).toBeGreaterThan(withoutBonus)

    // The extra rotation should be a whole number of full turns (2π), since
    // both must land the same segment under the pointer.
    const diffInTurns = (withBonus - withoutBonus) / (Math.PI * 2)
    expect(diffInTurns).toBeCloseTo(Math.round(diffInTurns), 9)
  })
})

describe('easeOutSpin', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutSpin(0)).toBeCloseTo(0, 9)
    expect(easeOutSpin(1)).toBeCloseTo(1, 9)
  })

  it('clamps values outside [0, 1]', () => {
    expect(easeOutSpin(-1)).toBeCloseTo(0, 9)
    expect(easeOutSpin(2)).toBeCloseTo(1, 9)
  })

  it('is monotonically increasing', () => {
    let previous = -Infinity
    for (let t = 0; t <= 1; t += 0.1) {
      const value = easeOutSpin(t)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })
})

function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2
  return ((angle % twoPi) + twoPi) % twoPi
}
