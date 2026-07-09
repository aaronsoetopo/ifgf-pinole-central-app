"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

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

  // Redirect unauthenticated visitors to login once auth resolves
  useEffect(() => {
    if (loading) return;         // still resolving auth + Firestore
    if (!user) {                 // confirmed: no session
      router.replace("/login");
    }
    // Note: profile=null while user exists means Firestore is still fetching.
    // The loading skeleton below handles that state; no redirect needed.
  }, [loading, user, router]);

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

          {/* Actions */}
          <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
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
    </main>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

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
