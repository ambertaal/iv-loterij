import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAJkJRGOhNS6D0AGvaS2T9MMh7p9no3cfU',
  authDomain: 'loterij-f1c6f.firebaseapp.com',
  databaseURL: 'https://loterij-f1c6f-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'loterij-f1c6f',
  storageBucket: 'loterij-f1c6f.firebasestorage.app',
  messagingSenderId: '416451866668',
  appId: '1:416451866668:web:12e0edb60da1c295722189'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getDatabase(firebaseApp)
export const auth = getAuth(firebaseApp)
