import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth'
import { auth } from '../lib/firebase'

/**
 * Tracks whether the current visitor is the admin. There is only ever one
 * account (created manually in the Firebase console), so "signed in" and
 * "is admin" are the same thing here -- the real enforcement lives in the
 * Realtime Database rules (see database.rules.json), this just drives the UI.
 */
export function useAdminAuth() {
  const user = ref<User | null>(null)
  const error = ref('')
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, (u) => {
      user.value = u
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  const isAdmin = computed(() => user.value !== null)

  async function login(email: string, password: string) {
    error.value = ''
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch {
      error.value = 'Invalid email or password.'
      return false
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return { user, isAdmin, error, login, logout }
}
