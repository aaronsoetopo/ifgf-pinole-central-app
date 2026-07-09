import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserRole } from "@/lib/hooks/useUserProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDocument {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  leaderOfTeams?: string[]; // Array of MinistryTeam IDs
  memberOfTeams?: string[]; // Array of MinistryTeam IDs
}

// ─── Collection ref ───────────────────────────────────────────────────────────

const usersRef = collection(db, "users");

// ─── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Subscribes to all users in the system, ordered by name.
 * Used primarily for admin assignment pickers.
 */
export function subscribeToUsers(
  callback: (users: UserDocument[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(usersRef, orderBy("name"));
  return onSnapshot(
    q,
    (snap) => {
      const users: UserDocument[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<UserDocument, "id">),
      }));
      callback(users);
    },
    onError
  );
}

/**
 * Adds a ministry team ID to a user's leaderOfTeams array.
 */
export async function assignTeamLeader(userId: string, teamId: string): Promise<void> {
  await updateDoc(doc(usersRef, userId), {
    leaderOfTeams: arrayUnion(teamId),
  });
}

/**
 * Removes a ministry team ID from a user's leaderOfTeams array.
 */
export async function removeTeamLeader(userId: string, teamId: string): Promise<void> {
  await updateDoc(doc(usersRef, userId), {
    leaderOfTeams: arrayRemove(teamId),
  });
}

/**
 * Toggles a user's membership in a ministry team.
 */
export async function toggleTeamMembership(userId: string, teamId: string, join: boolean): Promise<void> {
  await updateDoc(doc(usersRef, userId), {
    memberOfTeams: join ? arrayUnion(teamId) : arrayRemove(teamId),
  });
}

/**
 * Replaces a user's entire memberOfTeams array.
 */
export async function setUserTeams(userId: string, teamIds: string[]): Promise<void> {
  await updateDoc(doc(usersRef, userId), {
    memberOfTeams: teamIds,
  });
}
