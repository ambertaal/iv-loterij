import { describe, it, expect, beforeEach } from 'vitest'
import { useLottery } from '~/composables/useLottery'

describe('useLottery', () => {
  it('starts with an empty pool and no winners', () => {
    const lottery = useLottery()
    expect(lottery.participants.value).toEqual([])
    expect(lottery.winners.value).toEqual([])
    expect(lottery.drawCount.value).toBe(0)
    expect(lottery.canDraw.value).toBe(false)
  })

  it('parses names from a textarea-style string', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\n\Nina')
    expect(lottery.participants.value).toEqual(['Amber', 'Peter', 'Nina'])
  })

  it('canDraw requires at least 2 participants', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber')
    expect(lottery.canDraw.value).toBe(false)
    lottery.setParticipantsFromText('Amber\nPeter')
    expect(lottery.canDraw.value).toBe(true)
  })

  it('removes a participant by index', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.removeParticipant(1)
    expect(lottery.participants.value).toEqual(['Amber', 'Nina'])
  })

  it('records a winner with the current prize and increments the draw count', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.prize.value = 'Een bioscoopbon'

    const entry = lottery.recordWinner(1)

    expect(entry.name).toBe('Peter')
    expect(entry.prize).toBe('Een bioscoopbon')
    expect(entry.drawNumber).toBe(1)
    expect(lottery.drawCount.value).toBe(1)
    expect(lottery.winners.value[0]).toEqual(entry)
  })

  it('falls back to a default label when no prize is set', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter')
    const entry = lottery.recordWinner(0)
    expect(entry.prize).toBe('Not specified')
  })

  it('removes the winner from the pool when auto-remove is enabled (default)', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.recordWinner(0)
    expect(lottery.participants.value).toEqual(['Peter', 'Nina'])
  })

  it('keeps the winner in the pool when auto-remove is disabled', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.autoRemoveWinner.value = false
    lottery.recordWinner(0)
    expect(lottery.participants.value).toEqual(['Amber', 'Peter', 'Nina'])
  })

  it('prepends new winners so the log is newest-first', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.autoRemoveWinner.value = false

    lottery.recordWinner(0) // Amber
    lottery.recordWinner(1) // Peter

    expect(lottery.winners.value.map((w) => w.name)).toEqual(['Peter', 'Amber'])
    expect(lottery.winners.value.map((w) => w.drawNumber)).toEqual([2, 1])
  })

  it('pickWinner returns a name that exists in the pool without mutating it', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    const before = [...lottery.participants.value]

    const { index, name } = lottery.pickWinner()

    expect(lottery.participants.value).toEqual(before)
    expect(lottery.participants.value[index]).toBe(name)
  })

  it('resetWinnersLog clears the log without touching participants', () => {
    const lottery = useLottery()
    lottery.setParticipantsFromText('Amber\nPeter\nNina')
    lottery.recordWinner(0)
    lottery.resetWinnersLog()
    expect(lottery.winners.value).toEqual([])
    expect(lottery.participants.value.length).toBeGreaterThan(0)
  })
})
