import Link from "next/link";

/**
 * Shared layout for authentication pages (login, sign-up).
 * Renders a centered card on a subtle gradient background,
 * without the main site Navbar so the focus stays on the form.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      {/* Brand link back to home */}
      <Link
        href="/"
        className="mb-8 text-xl font-bold tracking-tight text-blue-700 hover:text-blue-900 transition-colors"
      >
        IFGF Pinole Central
      </Link>

      {/* Form card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        {children}
      </div>
    </div>
  );
}
