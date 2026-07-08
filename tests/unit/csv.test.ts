import { describe, it, expect } from 'vitest'
import { winnersToCsv } from '~/utils/csv'
import type { WinnerEntry } from '~/composables/useLottery'

function makeWinner(overrides: Partial<WinnerEntry> = {}): WinnerEntry {
  return {
    id: '1',
    drawNumber: 1,
    name: 'Amber',
    prize: 'Een bioscoopbon',
    date: '2026-07-08',
    time: '12:00',
    ...overrides,
  }
}

describe('winnersToCsv', () => {
  it('returns just the header row for no winners', () => {
    expect(winnersToCsv([])).toBe('No.,Name,Prize,Date,Time')
  })

  it('writes one row per winner with the expected columns', () => {
    const csv = winnersToCsv([makeWinner()])
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('No.,Name,Prize,Date,Time')
    expect(lines[1]).toBe('1,Amber,Een bioscoopbon,2026-07-08,12:00')
  })

  it('sorts rows oldest draw first regardless of input order', () => {
    const csv = winnersToCsv([
      makeWinner({ drawNumber: 3, name: 'Nina' }),
      makeWinner({ drawNumber: 1, name: 'Amber' }),
      makeWinner({ drawNumber: 2, name: 'Peter' }),
    ])
    const rows = csv.split('\r\n').slice(1)
    expect(rows.map((r) => r.split(',')[1])).toEqual(['Amber', 'Peter', 'Nina'])
  })

  it('quotes fields containing commas', () => {
    const csv = winnersToCsv([makeWinner({ prize: 'Bon, twee stuks' })])
    expect(csv.split('\r\n')[1]).toBe('1,Amber,"Bon, twee stuks",2026-07-08,12:00')
  })

  it('quotes and escapes fields containing double quotes', () => {
    const csv = winnersToCsv([makeWinner({ name: 'Amber "Ammie" Taal' })])
    expect(csv.split('\r\n')[1]).toBe('1,"Amber ""Ammie"" Taal",Een bioscoopbon,2026-07-08,12:00')
  })

  it('quotes fields containing newlines', () => {
    const csv = winnersToCsv([makeWinner({ prize: 'Line1\nLine2' })])
    expect(csv.split('\r\n')[1]).toBe('1,Amber,"Line1\nLine2",2026-07-08,12:00')
  })
})
