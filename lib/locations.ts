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

export interface Location {
  id: string;
  name: string;
  address: string;
  createdAt: Timestamp | null;
}

// ─── Collection ref ───────────────────────────────────────────────────────────

const locationsRef = collection(db, "locations");

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_LOCATIONS: Omit<Location, "id" | "createdAt">[] = [
  {
    name: "Pinole Campus",
    address: "",
  },
  {
    name: "San Ramon Campus",
    address: "",
  },
  {
    name: "South Bay Campus",
    address: "",
  },
];

// ─── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Adds a single location document to Firestore.
 */
export async function addLocation(
  name: string,
  address: string
): Promise<void> {
  await addDoc(locationsRef, {
    name: name.trim(),
    address: address.trim(),
    createdAt: serverTimestamp(),
  });
}

/**
 * Updates an existing location's name and/or address.
 * Uses updateDoc so other fields (e.g. createdAt) are never overwritten.
 */
export async function updateLocation(
  id: string,
  name: string,
  address: string
): Promise<void> {
  await updateDoc(doc(locationsRef, id), {
    name: name.trim(),
    address: address.trim(),
  });
}

/**
 * Permanently deletes a location document from Firestore.
 */
export async function deleteLocation(id: string): Promise<void> {
  await deleteDoc(doc(locationsRef, id));
}

/**
 * Writes all SEED_LOCATIONS to Firestore using a batch write.
 * Only adds locations whose names don't already exist.
 */
export async function seedLocations(): Promise<number> {
  const existingSnap = await getDocs(locationsRef);
  const existingNames = new Set(
    existingSnap.docs.map((d) => (d.data().name as string).toLowerCase())
  );

  const toAdd = SEED_LOCATIONS.filter(
    (l) => !existingNames.has(l.name.toLowerCase())
  );

  if (toAdd.length === 0) return 0;

  const batch = writeBatch(db);
  toAdd.forEach((loc) => {
    batch.set(doc(locationsRef), {
      ...loc,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return toAdd.length;
}

/**
 * Subscribes to the locations collection ordered by name.
 * Returns an unsubscribe function.
 */
export function subscribeToLocations(
  callback: (locations: Location[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(locationsRef, orderBy("name"));
  return onSnapshot(
    q,
    (snap) => {
      const locations: Location[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Location, "id">),
      }));
      callback(locations);
    },
    onError
  );
}
