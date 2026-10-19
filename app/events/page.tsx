"use client";

import React, { useState, useEffect, useMemo } from "react";
import { EventItem, CampusOption } from "./types";
import { EventsHeader } from "./components/EventsHeader";
import { CampusFilterBar } from "./components/CampusFilterBar";
import { EventCard } from "./components/EventCard";
import { EventDetailsModal } from "./components/EventDetailsModal";
import { PageDetailsModal } from "./components/PageDetailsModal";
import { EventCardSkeleton } from "./components/EventCardSkeleton";
import { EventsEmptyState } from "./components/EventsEmptyState";
import { EventsErrorState } from "./components/EventsErrorState";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CAMPUSES: CampusOption[] = [
  { id: "all", name: "All Campuses" },
  { id: "pinole", name: "Pinole Campus" },
  { id: "san-ramon", name: "San Ramon Campus" },
  { id: "south-bay", name: "South Bay Campus" },
];

const SEED_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "IFGF Pinole's 33rd Anniversary Celebration",
    description:
      "Join us as we celebrate 33 years of God's faithfulness, grace, and community across the Bay Area! We are gathering for a combined celebration at Los Cerritos Community Center in Fremont, featuring live music, guest speakers, and reflections on our church family's journey. A complimentary celebration luncheon, anniversary cake, and family photo booth will follow immediately after service. Nursery care and special activities for children provided. Please RSVP online so our hospitality team can prepare seating and catering.",
    date: "2026-10-25",
    displayDate: "Sunday, Oct 25, 2026",
    time: "11:00 AM - 2:00 PM",
    locationId: "pinole",
    locationName: "Los Cerritos Community Center",
    locationAddress: "3377 Alder Ave, Fremont, CA 94536",
    imageUrl: "/events/ifgf-pinole-33rd-anniversary.png",
    category: "Anniversary",
    featured: true,
    rsvpUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfOfeWNnte_RjHrsThncLgEZvC5SBhaIkuYLtbknbazCA0rsA/viewform",
  },
  {
    id: "2",
    title: "Midweek Prayer & Communion Gathering",
    description:
      "Join us for a relaxed group session. We gather in the Fellowship Hall off Bollinger Canyon for acoustic worship, earnest prayer for our families and local schools, and sharing the communion table together.",
    date: "2026-10-28",
    displayDate: "Wednesday, Oct 28, 2026",
    time: "7:00 PM - 8:30 PM",
    locationId: "san-ramon",
    locationName: "San Ramon Campus (Fellowship Hall)",
    locationAddress: "San Ramon Campus, San Ramon, CA",
    category: "Prayer",
    featured: false,
  },
  {
    id: "3",
    title: "IFGF Youth & Young Adults: IGNITE Night",
    description:
      "Calling all East Bay high school and college students! Meet us upstairs in the Youth Center for a night of live worship, activities, and post-service food and drink. Bring your friends",
    date: "2026-10-30",
    displayDate: "Friday, Oct 30, 2026",
    time: "6:30 PM - 9:00 PM",
    locationId: "pinole",
    locationName: "Pinole Campus (Youth Center)",
    locationAddress: "2800 Pinole Valley Rd, Pinole, CA 94564",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    category: "Youth",
    featured: false,
  },
  {
    id: "4",
    title: "Community Care Food Distribution",
    description:
      "Partnering with local South Bay neighborhood ministries to serve families across East San Jose and Santa Clara. Meet in the lower lot by 8:30 AM to help bag fresh produce, pantry essentials, and pray with our neighbors. Great hands-on service opportunity for the whole family!",
    date: "2026-10-31",
    displayDate: "Saturday, Oct 31, 2026",
    time: "9:00 AM - 1:00 PM",
    locationId: "south-bay",
    locationName: "South Bay Campus (Main Parking Lot)",
    locationAddress: "South Bay Campus, San Jose, CA",
    category: "Outreach",
    featured: false,
  },
  {
    id: "5",
    title: "Marriage & Family Enrichment Workshop",
    description:
      "Invest in your home and marriage! Enjoy a Friday evening of practical biblical wisdom on communication, intentional parenting, an open Q&A panel with seasoned couples, a dessert bar, and complimentary on-site childcare.",
    date: "2026-11-06",
    displayDate: "Friday, Nov 6, 2026",
    time: "7:00 PM - 9:00 PM",
    locationId: "san-ramon",
    locationName: "San Ramon Campus (Auditorium)",
    locationAddress: "San Ramon Campus, San Ramon, CA",
    imageUrl:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
    category: "Family",
    featured: false,
  },
  {
    id: "6",
    title: "South Bay Praise & Fellowship Night",
    description:
      "Wind down your workweek with an unhurried evening in God's presence. Experience heartfelt acoustic worship, inspiring testimonies of His faithfulness, and a delicious homemade Indonesian potluck dinner afterwards. Bring your family and your favorite dish to share!",
    date: "2026-11-14",
    displayDate: "Saturday, Nov 14, 2026",
    time: "6:00 PM - 8:30 PM",
    locationId: "south-bay",
    locationName: "South Bay Campus (Main Hall)",
    locationAddress: "South Bay Campus, San Jose, CA",
    imageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    category: "Fellowship",
    featured: false,
  },
];

// ─── Main Events Page ─────────────────────────────────────────────────────────

export default function EventsPage() {
  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isPageDetailsOpen, setIsPageDetailsOpen] = useState<boolean>(false);

  // Simulated initial loading to demonstrate smooth skeleton UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter events based on selected campus
  const filteredEvents = useMemo(() => {
    if (selectedCampusId === "all") return SEED_EVENTS;
    return SEED_EVENTS.filter((e) => e.locationId === selectedCampusId);
  }, [selectedCampusId]);

  // Compute event counts per campus
  const eventCountByCampus = useMemo(() => {
    const counts: Record<string, number> = {
      all: SEED_EVENTS.length,
    };
    CAMPUSES.forEach((c) => {
      if (c.id !== "all") {
        counts[c.id] = SEED_EVENTS.filter((e) => e.locationId === c.id).length;
      }
    });
    return counts;
  }, []);

  const currentCampusName =
    CAMPUSES.find((c) => c.id === selectedCampusId)?.name || "Selected Campus";

  function handleRetry() {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-white text-gray-900">
      {/* ── Top Hero Section (Header + Filter Bar) ── */}
      <section className="bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white pt-10 pb-6 px-4 sm:px-6 lg:px-8 border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto">
          {/* Header section with Placeholder badge and Page Details action */}
          <EventsHeader onOpenPageDetails={() => setIsPageDetailsOpen(true)} />

          {/* Campus Filter Bar */}
          <CampusFilterBar
            campuses={CAMPUSES}
            selectedCampusId={selectedCampusId}
            onSelectCampus={setSelectedCampusId}
            eventCountByCampus={eventCountByCampus}
          />
        </div>
      </section>

      {/* ── Main Content Section ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {isLoading ? (
          /* State 2: Loading State (Skeletons) */
          <div
            aria-busy="true"
            aria-label="Loading events"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : error ? (
          /* State 4: Error State */
          <EventsErrorState errorMessage={error} onRetry={handleRetry} />
        ) : filteredEvents.length === 0 ? (
          /* State 3: Empty State */
          <EventsEmptyState
            selectedCampusName={currentCampusName}
            onResetFilter={() => setSelectedCampusId("all")}
          />
        ) : (
          /* State 1: Populated Grid of Events */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer Banner: Stay Connected & Get Involved ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-10 text-white shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Looking for more ways to get involved?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Whether you want to serve on a ministry team, join a life group, or connect with our pastoral staff, we would love to help you take your next step.
            </p>
          </div>
          <a
            href="/ministry-teams"
            className="min-h-[44px] shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-sm inline-flex items-center justify-center cursor-pointer"
          >
            Explore Ministry Teams
          </a>
        </div>
      </section>

      {/* ── Event Details Modal Window ── */}
      <EventDetailsModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* ── Page Details & Beta Architecture Modal ── */}
      <PageDetailsModal
        isOpen={isPageDetailsOpen}
        onClose={() => setIsPageDetailsOpen(false)}
      />
    </main>
  );
}
