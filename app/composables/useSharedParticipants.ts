import { ref, onMounted, onUnmounted } from 'vue'
import { ref as dbRef, onValue, off, push, remove, type DatabaseReference } from 'firebase/database'
import { db } from '../lib/firebase'

export interface SharedEntry {
  id: string
  name: string
}

const SHARED_PATH = 'participants'
const MAX_NAME_LENGTH = 40

/**
 * Realtime, Firebase-backed sign-up list: anyone with the page link can add
 * their own name (see the Realtime Database security rules, which allow
 * writes but validate shape/length). Kept separate from `useLottery` so the
 * draw logic stays a pure, synchronously-testable unit -- callers are
 * expected to sync `sharedEntries` into the actual draw pool themselves.
 */
export function useSharedParticipants() {
  const sharedEntries = ref<SharedEntry[]>([])
  const isLoading = ref(true)
  let listRef: DatabaseReference | null = null

  onMounted(() => {
    listRef = dbRef(db, SHARED_PATH)
    onValue(listRef, (snapshot) => {
      const val = snapshot.val() as Record<string, { name: string }> | null
      sharedEntries.value = val
        ? Object.entries(val).map(([id, entry]) => ({ id, name: entry.name }))
        : []
      isLoading.value = false
    })
  })

  onUnmounted(() => {
    if (listRef) off(listRef)
  })

  async function addSharedName(name: string) {
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
    if (!trimmed || !listRef) return
    await push(listRef, { name: trimmed, addedAt: Date.now() })
  }

  async function clearSharedNames() {
    if (!listRef) return
    await remove(listRef)
  }

  return { sharedEntries, isLoading, addSharedName, clearSharedNames }
}
