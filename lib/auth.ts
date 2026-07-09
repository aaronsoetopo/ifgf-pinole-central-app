import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps Firebase auth error codes to human-readable messages. */
export function friendlyAuthError(err: unknown): string {
  const code = (err as AuthError)?.code ?? "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

/**
 * Creates a Firebase Auth user, sets the display name, then writes a matching
 * Firestore document at /users/{uid} with name, email, role, and createdAt.
 */
export async function signUp({ name, email, password }: SignUpData) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Persist display name in Auth profile
  await updateProfile(user, { displayName: name });

  // Create Firestore user document
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role: "member",
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Signs in an existing user with email + password.
 */
export async function signIn({ email, password }: SignInData) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  await firebaseSignOut(auth);
}
