import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration — all values come from environment variables.
 * Never hardcode these. They are loaded at runtime by Next.js from .env.local.
 *
 * NEXT_PUBLIC_ prefix is required for any variable that needs to be
 * accessible in client-side (browser) code, which Firebase SDK requires.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase — use getApps() guard to prevent duplicate
 * initialization during Next.js hot reloads in development.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication — handles login, logout, session state */
export const auth = getAuth(app);

/** Cloud Firestore — the NoSQL database for storing church app data */
export const db = getFirestore(app);

export default app;
