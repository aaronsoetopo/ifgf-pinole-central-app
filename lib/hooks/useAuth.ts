"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Subscribes to Firebase Auth state and returns the current user.
 *
 * - `loading` is true until the first auth state event fires, preventing
 *   flash-of-wrong-state (e.g. briefly showing the logged-out UI).
 * - Returns `null` once loading is done and no user is signed in.
 */
export function useAuth(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
