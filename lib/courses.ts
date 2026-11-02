import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  teamId: string; // MinistryTeam document ID
  title: string;
  description: string;
  order: number;
  createdAt: Timestamp | null;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  videoUrl?: string;
  content?: string; // Written lesson text
  createdAt: Timestamp | null;
}

export type NewCourseInput = Omit<Course, "id" | "createdAt">;
export type NewModuleInput = Omit<CourseModule, "id" | "createdAt">;

// ─── Collection refs ──────────────────────────────────────────────────────────

const coursesRef = collection(db, "courses");

/** Reference to a course's `modules` subcollection. */
function modulesRef(courseId: string) {
  return collection(db, "courses", courseId, "modules");
}

/** Firestore's maximum number of values in a single `in` query. */
const IN_QUERY_LIMIT = 30;

// ─── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Fetches all courses belonging to any of the given team IDs
 * (e.g. a user's memberOfTeams array). Splits the IDs into chunks to stay
 * within Firestore's `in` query limit, then sorts by order, then title.
 */
export async function getCoursesForTeams(teamIds: string[]): Promise<Course[]> {
  const ids = Array.from(new Set(teamIds.filter(Boolean)));
  if (ids.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += IN_QUERY_LIMIT) {
    chunks.push(ids.slice(i, i + IN_QUERY_LIMIT));
  }

  const snaps = await Promise.all(
    chunks.map((chunk) => getDocs(query(coursesRef, where("teamId", "in", chunk))))
  );

  const courses: Course[] = snaps.flatMap((snap) =>
    snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Course, "id">),
    }))
  );

  return courses.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title)
  );
}

/**
 * Fetches a single course by ID. Returns null if it doesn't exist.
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  const snap = await getDoc(doc(coursesRef, courseId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Course, "id">) };
}

/**
 * Fetches all modules for a course, sorted by their order field.
 */
export async function getCourseModules(courseId: string): Promise<CourseModule[]> {
  const snap = await getDocs(query(modulesRef(courseId), orderBy("order")));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CourseModule, "id">),
  }));
}

/**
 * Creates a new course document. Returns the auto-generated course ID.
 */
export async function createCourse(input: NewCourseInput): Promise<string> {
  const ref = await addDoc(coursesRef, {
    teamId: input.teamId,
    title: input.title.trim(),
    description: input.description.trim(),
    order: input.order,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Adds a module to a course's modules subcollection.
 * Optional fields are omitted when empty, since Firestore rejects undefined.
 * Returns the auto-generated module ID.
 */
export async function addModuleToCourse(
  courseId: string,
  input: NewModuleInput
): Promise<string> {
  const videoUrl = input.videoUrl?.trim();
  const content = input.content?.trim();

  const ref = await addDoc(modulesRef(courseId), {
    title: input.title.trim(),
    order: input.order,
    ...(videoUrl ? { videoUrl } : {}),
    ...(content ? { content } : {}),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
