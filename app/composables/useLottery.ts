import { ref, computed } from 'vue'
import { parseNames, pickWinnerIndex } from '../utils/wheel'

export interface WinnerEntry {
  id: string
  drawNumber: number
  name: string
  prize: string
  date: string
  time: string
}

/**
 * Central state for the lottery: the participant pool, what's up for grabs,
 * and the log of past draws. Kept separate from the wheel's visual/animation
 * concerns (see LotteryWheel.vue) so the drawing logic itself stays easy to
 * unit test.
 */
export function useLottery() {
  const participants = ref<string[]>([])
  const prize = ref<string>('')
  const autoRemoveWinner = ref<boolean>(true)
  const winners = ref<WinnerEntry[]>([])

  const drawCount = computed(() => winners.value.length)
  const canDraw = computed(() => participants.value.length >= 2)

  /** Replace the participant pool from raw textarea content (one name per line). */
  function setParticipantsFromText(raw: string) {
    participants.value = parseNames(raw)
  }

  function removeParticipant(index: number) {
    participants.value.splice(index, 1)
  }

  function clearParticipants() {
    participants.value = []
  }

  /**
   * Pick a random winner from the current pool. Pure selection only -- does
   * not mutate state. The caller (the wheel) uses this to know which segment
   * to animate to, then calls `recordWinner` once the animation finishes.
   */
  function pickWinner(): { index: number; name: string } {
    const index = pickWinnerIndex(participants.value.length)
    return { index, name: participants.value[index] }
  }

  /**
   * Confirm a winner: adds it to the log with the currently configured prize,
   * and removes it from the pool when auto-remove is enabled. `drawNumber`
   * can be overridden by the caller (e.g. based on a shared/synced count) so
   * numbering stays consistent across visitors instead of this composable's
   * own, per-tab-only `winners` log.
   */
  function recordWinner(index: number, drawNumber?: number): WinnerEntry {
    const name = participants.value[index]
    const entry: WinnerEntry = {
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      drawNumber: drawNumber ?? drawCount.value + 1,
      name,
      prize: prize.value.trim() || 'Not specified',
      date: new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    winners.value.unshift(entry)

    if (autoRemoveWinner.value) {
      removeParticipant(index)
    }

    return entry
  }

  function resetWinnersLog() {
    winners.value = []
  }

  return {
    participants,
    prize,
    autoRemoveWinner,
    winners,
    drawCount,
    canDraw,
    setParticipantsFromText,
    removeParticipant,
    clearParticipants,
    pickWinner,
    recordWinner,
    resetWinnersLog
  }
}
