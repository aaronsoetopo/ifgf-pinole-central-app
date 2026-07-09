import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MinistryTeam {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp | null;
}

// ─── Collection ref ───────────────────────────────────────────────────────────

const teamsRef = collection(db, "ministryTeams");

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_TEAMS: Omit<MinistryTeam, "id" | "createdAt">[] = [
  {
    name: "Sound System",
    description: "Manages audio equipment and sound mixing for services and events.",
  },
  {
    name: "Multimedia",
    description: "Operates projectors, slides, and visual media during services.",
  },
  {
    name: "Worship Leaders",
    description: "Leads the congregation in praise and worship each week.",
  },
  {
    name: "Musicians",
    description: "Provides musical accompaniment for worship sets and special events.",
  },
  {
    name: "Ushers",
    description: "Welcomes attendees and assists with seating, offerings, and logistics.",
  },
  {
    name: "Sunday School Teachers",
    description: "Prepares and teaches children's Sunday school classes and programs.",
  },
];

// ─── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Adds a single ministry team document to Firestore.
 */
export async function addMinistryTeam(
  name: string,
  description: string
): Promise<void> {
  await addDoc(teamsRef, {
    name: name.trim(),
    description: description.trim(),
    createdAt: serverTimestamp(),
  });
}

/**
 * Writes all SEED_TEAMS to Firestore using a batch write.
 * Only adds teams whose names don't already exist.
 */
export async function seedMinistryTeams(): Promise<number> {
  const existingSnap = await getDocs(teamsRef);
  const existingNames = new Set(
    existingSnap.docs.map((d) => (d.data().name as string).toLowerCase())
  );

  const toAdd = SEED_TEAMS.filter(
    (t) => !existingNames.has(t.name.toLowerCase())
  );

  if (toAdd.length === 0) return 0;

  const batch = writeBatch(db);
  toAdd.forEach((team) => {
    batch.set(doc(teamsRef), {
      ...team,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return toAdd.length;
}

/**
 * Updates an existing ministry team's name and/or description.
 * Uses updateDoc so other fields (e.g. createdAt) are never overwritten.
 */
export async function updateMinistryTeam(
  id: string,
  name: string,
  description: string
): Promise<void> {
  await updateDoc(doc(teamsRef, id), {
    name: name.trim(),
    description: description.trim(),
  });
}

/**
 * Permanently deletes a ministry team document from Firestore.
 */
export async function deleteMinistryTeam(id: string): Promise<void> {
  await deleteDoc(doc(teamsRef, id));
}

/**
 * Subscribes to the ministryTeams collection ordered by name.
 * Returns an unsubscribe function.
 */
export function subscribeToMinistryTeams(
  callback: (teams: MinistryTeam[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(teamsRef, orderBy("name"));
  return onSnapshot(
    q,
    (snap) => {
      const teams: MinistryTeam[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MinistryTeam, "id">),
      }));
      callback(teams);
    },
    onError
  );
}
