"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { subscribeToMinistryTeams } from "@/lib/ministryTeams";
import { subscribeToLocations } from "@/lib/locations";

// ─── Admin module cards ───────────────────────────────────────────────────────

interface AdminModule {
  title: string;
  description: string;
  href: string;
  icon: string;
  /** Tailwind colour tokens for icon bg and text */
  color: { bg: string; text: string; ring: string };
  /** When true, only users with role "admin" (not just leader) see this tile */
  adminOnly?: boolean;
}

const ADMIN_MODULES: AdminModule[] = [
  {
    title: "Ministry Teams",
    description: "Create and manage the church's ministry teams.",
    href: "/admin/ministry-teams",
    icon: "👥",
    color: { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-200" },
  },
  {
    title: "Locations",
    description: "Manage church campus locations and addresses.",
    href: "/admin/locations",
    icon: "📍",
    color: { bg: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-200" },
  },
  {
    title: "Manage User Roles",
    description: "Assign and update roles for all registered members.",
    href: "/admin/roles",
    icon: "🔑",
    color: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
    adminOnly: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { profile, loading } = useUserProfile();
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [locationCount, setLocationCount] = useState<number | null>(null);

  // Fetch a live team count for the stat card
  useEffect(() => {
    const unsubscribe = subscribeToMinistryTeams((teams) => {
      setTeamCount(teams.length);
    });
    return () => unsubscribe();
  }, []);

  // Fetch a live location count for the stat card
  useEffect(() => {
    const unsubscribe = subscribeToLocations((locations) => {
      setLocationCount(locations.length);
    });
    return () => unsubscribe();
  }, []);

  // Stat cards — extend as new data sources are added
  const stats = [
    {
      label: "Ministry Teams",
      value: teamCount === null ? "—" : String(teamCount),
      icon: "👥",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      label: "Locations",
      value: locationCount === null ? "—" : String(locationCount),
      icon: "📍",
      color: "bg-teal-50 border-teal-200 text-teal-700",
    },
  ];
  // Don't render until the user document has loaded — avoids a null-profile
  // crash in the tile filter and the welcome message below.
  if (loading || !profile) {
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
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-10">

        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of what you can manage.
          </p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`flex flex-col gap-1 rounded-xl border px-5 py-4 ${s.color}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-2xl font-extrabold leading-none">{s.value}</span>
              <span className="text-xs font-medium opacity-80">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-700 uppercase tracking-wider text-xs">
            Manage
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADMIN_MODULES.filter(
              (mod) => !mod.adminOnly || profile.role === "admin"
            ).map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-purple-300 hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ring-4 ${mod.color.bg} ${mod.color.ring}`}
                >
                  {mod.icon}
                </span>
                <div>
                  <p className={`font-bold text-gray-900 group-hover:${mod.color.text} transition-colors`}>
                    {mod.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{mod.description}</p>
                </div>
                <span className={`mt-auto self-start text-sm font-semibold ${mod.color.text}`}>
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
