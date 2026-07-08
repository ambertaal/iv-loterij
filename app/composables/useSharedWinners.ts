import { ref, onMounted, onUnmounted } from 'vue'
import { ref as dbRef, onValue, off, push, remove, type DatabaseReference } from 'firebase/database'
import { db } from '../lib/firebase'
import type { WinnerEntry } from './useLottery'

const SHARED_PATH = 'winners'

/**
 * Realtime, Firebase-backed winner log: every draw is pushed here so anyone
 * with the page link sees the same history, instead of each visitor only
 * seeing draws made in their own tab. Mirrors `useSharedParticipants`.
 */
export function useSharedWinners() {
  const sharedWinners = ref<WinnerEntry[]>([])
  const isLoading = ref(true)
  let listRef: DatabaseReference | null = null

  onMounted(() => {
    listRef = dbRef(db, SHARED_PATH)
    onValue(listRef, (snapshot) => {
      const val = snapshot.val() as Record<string, Omit<WinnerEntry, 'id'>> | null
      sharedWinners.value = val
        ? Object.entries(val)
            .map(([id, entry]) => ({ id, ...entry }))
            .sort((a, b) => b.drawNumber - a.drawNumber)
        : []
      isLoading.value = false
    })
  })

  onUnmounted(() => {
    if (listRef) off(listRef)
  })

  async function pushWinner(entry: Omit<WinnerEntry, 'id'>) {
    if (!listRef) return
    await push(listRef, entry)
  }

  async function clearSharedWinners() {
    if (!listRef) return
    await remove(listRef)
  }

  async function removeWinner(id: string) {
    if (!listRef) return
    await remove(dbRef(db, `${SHARED_PATH}/${id}`))
  }

  return { sharedWinners, isLoading, pushWinner, clearSharedWinners, removeWinner }
}
