"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useUserProfile, hasMinRole, UserRole } from "@/lib/hooks/useUserProfile";

// ─── Link definitions ─────────────────────────────────────────────────────────

/**
 * Each link carries a `minRole` — the lowest role that can see it.
 * Role hierarchy (ascending access): member → minister → leader → admin
 *
 * Visibility rules:
 *   member   → Events, Devotions, Sermons, Reading Plan, Give
 *   minister → + Training
 *   leader   → + Admin
 *   admin    → same as leader (full access)
 */
interface NavLink {
  label: string;
  href: string;
  minRole: UserRole;
  /** When true the link renders as a filled pill button */
  cta?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Events",       href: "/events",       minRole: "member"   },
  { label: "Devotions",    href: "/devotions",    minRole: "member"   },
  { label: "Sermons",      href: "/sermons",      minRole: "member"   },
  { label: "Training",     href: "/training",     minRole: "minister" },
  { label: "Reading Plan", href: "/reading-plan", minRole: "member"   },
  { label: "Give",         href: "/give",         minRole: "member",  cta: true },
  { label: "Admin",        href: "/admin",        minRole: "leader"   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile } = useUserProfile();

  // Determine which links to show.
  // • Logged-out visitors see NO role-gated links (profile is null).
  // • Logged-in users see links whose minRole ≤ their role.
  const visibleLinks = profile
    ? NAV_LINKS.filter((link) => hasMinRole(profile.role, link.minRole))
    : [];

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    router.push("/");
  }

  /** Desktop link pill */
  function DesktopLink({ link }: { link: NavLink }) {
    if (link.cta) {
      return (
        <Link
          href={link.href}
          className="ml-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {link.label}
        </Link>
      );
    }
    if (link.label === "Admin") {
      return (
        <Link
          href={link.href}
          className="rounded-md px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
        >
          {link.label}
        </Link>
      );
    }
    return (
      <Link
        href={link.href}
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        {link.label}
      </Link>
    );
  }

  /** Mobile link row */
  function MobileLink({ link }: { link: NavLink }) {
    const base = "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors";
    const classes =
      link.cta
        ? `${base} bg-blue-600 text-white text-center hover:bg-blue-700`
        : link.label === "Admin"
        ? `${base} text-purple-700 font-semibold hover:bg-purple-50`
        : `${base} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;

    return (
      <Link href={link.href} onClick={() => setMenuOpen(false)} className={classes}>
        {link.label}
      </Link>
    );
  }

  // Initials for the avatar chip
  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 hover:text-blue-700 transition-colors"
        >
          IFGF Pinole Central
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <DesktopLink link={link} />
            </li>
          ))}

          {/* Auth controls */}
          <li className="ml-3 flex items-center gap-2 border-l border-gray-200 pl-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {initials}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {user.displayName ?? user.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-4">
          <ul className="flex flex-col gap-1 pt-2">
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <MobileLink link={link} />
              </li>
            ))}

            {/* Mobile auth controls */}
            <li className="mt-2 border-t border-gray-100 pt-2">
              {user ? (
                <div className="flex flex-col gap-1">
                  <span className="px-3 py-1 text-xs text-gray-400">
                    Signed in as {user.displayName ?? user.email}
                  </span>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
