"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { subscribeToUsers, setUserRole, UserDocument } from "@/lib/users";
import { UserRole } from "@/lib/hooks/useUserProfile";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ["member", "minister", "leader", "admin"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageRolesPage() {
  const router = useRouter();
  const { user, profile, loading } = useUserProfile();

  // Redirect non-admins to homepage
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!profile) return;
    if (profile.role !== "admin") router.replace("/");
  }, [loading, user, profile, router]);

  const [users, setUsers] = useState<UserDocument[]>([]);
  // Per-row pending role selection (userId → UserRole)
  const [pending, setPending] = useState<Record<string, UserRole>>({});
  // Per-row saving state
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  // Per-row success flash (userId → true for 3 s)
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  // Confirm dialog state
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);

  // Subscribe to all users (already sorted by name in Firestore query)
  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      // Seed pending map for any new users without a selection yet
      setPending((prev) => {
        const next = { ...prev };
        data.forEach((u) => {
          if (!(u.id in next)) next[u.id] = u.role;
        });
        return next;
      });
    });
    return () => unsubscribe();
  }, []);

  // ── Loading / access guard ────────────────────────────────────────────────
  if (loading || !user || !profile || profile.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-400">Checking access…</p>
        </div>
      </div>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleRoleChange(userId: string, role: UserRole) {
    setPending((prev) => ({ ...prev, [userId]: role }));
  }

  async function executeSave(userId: string) {
    const newRole = pending[userId];
    if (!newRole) return;
    setSaving((prev) => ({ ...prev, [userId]: true }));
    try {
      await setUserRole(userId, newRole);
      setSaved((prev) => ({ ...prev, [userId]: true }));
      // Clear the success flash after 3 seconds
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [userId]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update role. Please try again.");
    } finally {
      setSaving((prev) => ({ ...prev, [userId]: false }));
    }
  }

  function handleSave(userId: string) {
    // user is guaranteed non-null by the loading guard above, but guard here
    // explicitly so TypeScript can narrow the type before accessing .uid.
    if (!user) return;

    // Self-demotion guard: show confirm dialog if the admin is changing their
    // own role away from "admin"
    if (userId === user.uid && pending[userId] !== "admin") {
      setConfirmUserId(userId);
      return;
    }
    executeSave(userId);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← Admin
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-extrabold text-gray-900">Manage User Roles</h1>
        </div>

        <p className="text-sm text-gray-500">
          Select a new role for any user and click <strong>Save</strong> to apply it.
          Changes take effect immediately.
        </p>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">New Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 animate-pulse">
                    Loading users…
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isSelf = u.id === user.uid;
                const isSaving = saving[u.id] ?? false;
                const isSaved = saved[u.id] ?? false;
                const selectedRole = pending[u.id] ?? u.role;
                const isDirty = selectedRole !== u.role;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${isSelf ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}
                  >
                    {/* Name */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.name}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          You
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>

                    {/* Current role badge */}
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Role dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={isSaving}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="capitalize">
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Save + feedback */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {isSaved && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 animate-in fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                            Saved!
                          </span>
                        )}
                        <button
                          onClick={() => handleSave(u.id)}
                          disabled={isSaving || !isDirty}
                          className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Self-demotion confirmation dialog ────────────────────────────── */}
      {confirmUserId !== null && (
        <ConfirmModal
          onClose={() => setConfirmUserId(null)}
          onConfirm={() => {
            const id = confirmUserId;
            setConfirmUserId(null);
            executeSave(id);
          }}
        />
      )}
    </main>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

const roleBadgeClasses: Record<UserRole, string> = {
  admin:    "bg-purple-100 text-purple-700 border-purple-200",
  leader:   "bg-indigo-100 text-indigo-700 border-indigo-200",
  minister: "bg-blue-100   text-blue-700   border-blue-200",
  member:   "bg-green-100  text-green-700  border-green-200",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeClasses[role]}`}>
      {role}
    </span>
  );
}

// ─── Confirmation modal ───────────────────────────────────────────────────────

function ConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Warning icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-2xl">
          ⚠️
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-900">Remove your own admin access?</h2>
        <p className="mb-6 text-sm text-gray-600">
          You are about to remove your own admin access. You will lose the ability
          to manage the app until another admin restores your role. Continue?
        </p>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Yes, continue
          </button>
        </div>
      </div>
    </div>
  );
}
