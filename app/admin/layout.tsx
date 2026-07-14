"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile, hasMinRole } from "@/lib/hooks/useUserProfile";

/**
 * Shared layout for all /admin/* routes.
 *
 * Handles the role guard in one place so individual admin pages
 * don't need to repeat the check. Any user who is not a "leader"
 * or higher is redirected before the page content mounts.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useUserProfile();

  useEffect(() => {
    // 1. Still resolving auth or Firestore — never redirect yet.
    if (loading) return;

    // 2. Auth resolved: no session — send to login.
    if (!user) {
      router.replace("/login");
      return;
    }

    // 3. Auth resolved with a user but profile not yet fetched.
    //    This can happen in the brief window between auth resolving and
    //    the first Firestore onSnapshot firing. Do NOT redirect here —
    //    the loading spinner is already showing via the render guard below.
    if (!profile) return;

    // 4. Profile loaded — check role and redirect if insufficient.
    if (!hasMinRole(profile.role, "leader")) {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  // Show nothing while auth resolves or while redirect is in flight
  if (loading || !user || !profile || !hasMinRole(profile.role, "leader")) {
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

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Admin sub-header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            Admin Panel
          </p>
          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold capitalize text-purple-700">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
