"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Events", href: "/events" },
  { label: "Devotions", href: "/devotions" },
  { label: "Sermons", href: "/sermons" },
  { label: "Training", href: "/training" },
  { label: "Reading Plan", href: "/reading-plan" },
  { label: "Give", href: "/give" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          {navLinks.map((link) =>
            link.label === "Give" ? (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="ml-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Give
                </Link>
              </li>
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
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
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    link.label === "Give"
                      ? "bg-blue-600 text-white text-center hover:bg-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
