"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "member" | "minister" | "leader" | "admin";

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
}

// Role priority — higher number = more access
export const ROLE_LEVEL: Record<UserRole, number> = {
  member:   0,
  minister: 1,
  leader:   2,
  admin:    3,
};

/** Returns true if the given role meets or exceeds the required minimum role. */
export function hasMinRole(role: UserRole, minRole: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minRole];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Combines Firebase Auth state with a real-time Firestore profile subscription.
 *
 * - Returns `loading: true` until both auth and the first Firestore snapshot resolve.
 * - Automatically updates when the Firestore role field changes (e.g., when an
 *   admin promotes a user — the navbar re-renders without a page reload).
 * - Falls back to Auth display name / email with role "member" if no Firestore
 *   document exists for the user.
 */
export function useUserProfile(): {
  user: ReturnType<typeof useAuth>["user"];
  profile: UserProfile | null;
  loading: boolean;
  error: string;
} {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // No user — clear profile and stop loading
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    // Reset loading when user changes
    setProfileLoading(true);

    // Real-time subscription to /users/{uid}
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // Fallback: build a minimal profile from Auth data
          setProfile({
            name:  user.displayName ?? "Unknown",
            email: user.email ?? "",
            role:  "member",
          });
        }
        setProfileLoading(false);
      },
      (err) => {
        console.error("useUserProfile snapshot error:", err);
        setError("Could not load profile.");
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    user,
    profile,
    loading: authLoading || profileLoading,
    error,
  };
}
