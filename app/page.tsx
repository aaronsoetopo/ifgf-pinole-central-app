import Link from "next/link";
import FirebaseStatus from "@/app/components/FirebaseStatus"; // TEMPORARY — remove after confirming Firebase works

const quickLinks = [
  { label: "📅 Events", href: "/events", desc: "Upcoming gatherings & services" },
  { label: "📖 Devotions", href: "/devotions", desc: "Daily scripture & reflections" },
  { label: "🎙 Sermons", href: "/sermons", desc: "Messages from our pastors" },
  { label: "🎓 Training", href: "/training", desc: "Discipleship & leadership courses" },
  { label: "📚 Reading Plan", href: "/reading-plan", desc: "Walk through the Bible together" },
  { label: "🙏 Give", href: "/give", desc: "Support the mission generously" },
];

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-blue-50 to-white px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Welcome to
        </p>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          IFGF Pinole Central
        </h1>
        <p className="max-w-xl text-lg text-gray-500">
          A community of faith rooted in love, growing in purpose, and reaching the world
          together.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/events"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
          >
            See Upcoming Events
          </Link>
          <Link
            href="/sermons"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Watch Sermons
          </Link>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
              <span className="text-sm text-gray-500">{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TEMPORARY: Firebase connection check — delete once confirmed */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <FirebaseStatus />
      </section>
    </main>
  );
}
