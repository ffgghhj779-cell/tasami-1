import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDc2L-A0owwHdzSMZ4CBVGj-lcuMzT2I_M',
  authDomain: 'tasami-14845.firebaseapp.com',
  projectId: 'tasami-14845',
  storageBucket: 'tasami-14845.firebasestorage.app',
  messagingSenderId: '407200014403',
  appId: '1:407200014403:web:44daa597c07c8cf91774f6',
  measurementId: 'G-Y66P1ZVLDW',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Auth persistence + Google redirect handled once in authBootstrap.ts (app mount).
 * Enable in Firebase Console → Authentication → Sign-in method:
 * - Google, Phone, Email/Password — disable Anonymous.
 */
