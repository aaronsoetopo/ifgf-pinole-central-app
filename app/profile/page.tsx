"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useUserProfile, hasMinRole } from "@/lib/hooks/useUserProfile";
import { MinistryTeam, subscribeToMinistryTeams } from "@/lib/ministryTeams";
import { setUserTeams, subscribeToUsers, UserDocument } from "@/lib/users";

// ─── Role badge styling ────────────────────────────────────────────────────────

const roleBadgeClasses: Record<string, string> = {
  admin:    "bg-purple-100 text-purple-700 border-purple-200",
  leader:   "bg-indigo-100 text-indigo-700 border-indigo-200",
  minister: "bg-blue-100   text-blue-700   border-blue-200",
  member:   "bg-green-100  text-green-700  border-green-200",
};

function getRoleBadge(role: string) {
  return roleBadgeClasses[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, error } = useUserProfile();
  const [signingOut, setSigningOut] = useState(false);
  const [teams, setTeams] = useState<MinistryTeam[]>([]);
  const [users, setUsers] = useState<UserDocument[]>([]);

  const [isEditingTeams, setIsEditingTeams] = useState(false);
  const [stagedTeams, setStagedTeams] = useState<string[]>([]);
  const [isSavingTeams, setIsSavingTeams] = useState(false);

  // Redirect unauthenticated visitors to login once auth resolves
  useEffect(() => {
    if (loading) return;         // still resolving auth + Firestore
    if (!user) {                 // confirmed: no session
      router.replace("/login");
    }
    // Note: profile=null while user exists means Firestore is still fetching.
    // The loading skeleton below handles that state; no redirect needed.
  }, [loading, user, router]);

  // Load ministry teams (all users can see teams if they are a leader or a minister)
  useEffect(() => {
    if (!profile) return;
    const unsubscribe = subscribeToMinistryTeams((data) => setTeams(data));
    return () => unsubscribe();
  }, [profile]);

  // Load all users to resolve leader names
  useEffect(() => {
    if (!profile) return;
    const unsubscribe = subscribeToUsers((data) => setUsers(data));
    return () => unsubscribe();
  }, [profile]);

  function openEditTeams() {
    if (!profile) return;
    setStagedTeams(profile.memberOfTeams || []);
    setIsEditingTeams(true);
  }

  function handleToggleStagedTeam(teamId: string, checked: boolean) {
    if (checked) {
      setStagedTeams((prev) => [...prev, teamId]);
    } else {
      setStagedTeams((prev) => prev.filter((id) => id !== teamId));
    }
  }

  async function handleSaveTeams() {
    if (!user) return;
    setIsSavingTeams(true);
    try {
      await setUserTeams(user.uid, stagedTeams);
      setIsEditingTeams(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save teams.");
    } finally {
      setIsSavingTeams(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24 px-6">
        <div className="w-full max-w-md animate-pulse space-y-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto" />
          <div className="h-6 rounded bg-gray-200 w-48 mx-auto" />
          <div className="h-4 rounded bg-gray-100 w-64 mx-auto" />
          <div className="h-4 rounded bg-gray-100 w-32 mx-auto" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!profile) return null;

  // ── Profile card ──────────────────────────────────────────────────────────

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex flex-1 flex-col items-center bg-gradient-to-b from-blue-50 to-white px-6 py-16">
      <div className="w-full max-w-md">
        {/* Page title */}
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">My Profile</h1>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          {/* Avatar + name header */}
          <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-500 px-8 py-10 text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold tracking-tight text-white ring-4 ring-white/30">
              {initials}
            </div>
            <p className="text-xl font-bold">{profile.name}</p>
            {/* Role badge */}
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(
                profile.role
              )}`}
            >
              {profile.role}
            </span>

            {/* Team Leader Badges */}
            {(profile.leaderOfTeams || []).length > 0 && teams.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {profile.leaderOfTeams!.map((teamId) => {
                  const team = teams.find((t) => t.id === teamId);
                  if (!team) return null;
                  return (
                    <span key={teamId} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      {team.name} Leader
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-100 px-6">
            <ProfileRow label="Full name" value={profile.name} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow
              label="Role"
              value={
                <span className="capitalize font-medium text-gray-700">
                  {profile.role}
                </span>
              }
            />
          </div>

          {/* Ministry Teams Selection for ministers+ */}
          {hasMinRole(profile.role, "minister") && (
            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">My Ministry Teams</h3>
                <button
                  onClick={openEditTeams}
                  className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm hover:border-blue-300 hover:text-blue-700 transition"
                >
                  Edit
                </button>
              </div>
              
              {teams.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Loading teams...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(profile.memberOfTeams || []).length === 0 ? (
                    <span className="text-sm text-gray-500 italic">None selected</span>
                  ) : (
                    (profile.memberOfTeams || []).map((teamId) => {
                      const team = teams.find((t) => t.id === teamId);
                      if (!team) return null;

                      // Find leaders
                      const teamLeaders = users.filter((u) => u.leaderOfTeams?.includes(team.id));
                      let leaderText = "No leader assigned";
                      if (teamLeaders.length > 0) {
                        leaderText = teamLeaders.map((u) => {
                          const names = u.name.split(" ");
                          return names.length > 1 ? `${names[0]} ${names[names.length - 1][0]}.` : u.name;
                        }).join(", ");
                        leaderText = `${team.name} Leader - ${leaderText}`;
                      }

                      return (
                        <div
                          key={teamId}
                          className="flex flex-col rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3"
                        >
                          <span className="font-semibold text-blue-900">{team.name}</span>
                          <span className="mt-0.5 text-xs text-blue-700 font-medium">
                            {leaderText}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {signingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Teams Modal ─────────────────────────────────────────────────── */}
      {isEditingTeams && (
        <Modal onClose={() => !isSavingTeams && setIsEditingTeams(false)} title="Edit My Ministry Teams">
          <div className="space-y-3 mb-6 mt-2 max-h-60 overflow-y-auto pr-2">
            {teams.map((team) => {
              const isChecked = stagedTeams.includes(team.id);
              return (
                <label key={team.id} className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleToggleStagedTeam(team.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-medium">{team.name}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsEditingTeams(false)}
              disabled={isSavingTeams}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTeams}
              disabled={isSavingTeams}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isSavingTeams ? "Saving…" : "Confirm"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm text-gray-800">{value}</span>
    </div>
  );
}
