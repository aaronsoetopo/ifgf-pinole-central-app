import React from "react";
import { EventCardProps } from "../types";
import { ClockIcon, MapPinIcon, CalendarIcon, CalendarDaysIcon, ChevronRightIcon } from "./Icons";

/**
 * Extracts uppercase 3-letter month and day number from date string for the Date Block variant.
 */
function getDateParts(dateStr: string) {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`);
    if (!isNaN(d.getTime())) {
      const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const day = d.getDate().toString();
      return { month, day };
    }
  } catch {
    // fallback
  }
  return { month: "EVENT", day: "•" };
}

/**
 * Formats concise date for the card overlay badge, e.g. "Sun, Oct 25"
 */
function getConciseDate(dateStr: string, fallback: string) {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  } catch {
    // fallback
  }
  return fallback;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const { month, day } = getDateParts(event.date);
  const conciseDate = getConciseDate(event.date, event.displayDate);
  const categoryLabel = event.category?.trim() || "General";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onViewDetails(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails(event);
        }
      }}
      aria-label={`View event details for ${event.title}`}
      className="group rounded-2xl border border-gray-200 bg-white shadow-xs hover:shadow-md hover:border-blue-300 active:scale-[0.99] transition-all duration-200 overflow-hidden flex flex-col h-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 text-left"
    >
      {/* ── Visual Header (aspect-video for both variants) ── */}
      {event.imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Unified Collision-Proof Flex Header */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            {/* Top-left date badge */}
            <div className="shrink-0 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm rounded-full flex items-center gap-1.5 leading-none pointer-events-auto">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">{conciseDate}</span>
            </div>

            {/* Top-right category pill (Truncates cleanly if ever too wide) */}
            <div className="min-w-0 max-w-[50%] truncate bg-black/50 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white border border-white/15 shadow-2xs rounded-full leading-none pointer-events-auto">
              {categoryLabel}
            </div>
          </div>
        </div>
      ) : (
        /* Colored Date Block Variant */
        <div className="relative aspect-video w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-6 flex items-center justify-between text-white overflow-hidden">
          <CalendarDaysIcon className="opacity-15 w-28 h-28 absolute -right-4 -bottom-4 pointer-events-none text-white" />

          {/* Date stamp */}
          <div className="flex flex-col z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
              {month}
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {day}
            </span>
            <span className="text-xs text-blue-100/90 font-medium mt-1">
              {conciseDate}
            </span>
          </div>

          {/* Top-right category pill */}
          <div className="absolute top-3 right-3 z-20 max-w-[50%] truncate inline-flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white border border-white/20 shadow-2xs leading-none">
            {categoryLabel}
          </div>
        </div>
      )}

      {/* ── Card Body (Two-Group Fluid Layout: Zero Hardcoding) ── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Top Group: Title & Meta Info */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1 block line-clamp-1">
              {categoryLabel}
            </span>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{event.locationName}</span>
            </div>
          </div>
        </div>

        {/* Bottom Group (mt-auto): Anchors Description & Footer to the bottom */}
        <div className="mt-auto pt-4 space-y-4">
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              {event.locationAddress ? "In-Person" : "All Welcome"}
            </span>

            <div className="min-h-10 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 group-hover:bg-blue-100 group-active:bg-blue-200 transition-colors inline-flex items-center gap-1.5 pointer-events-none">
              <span>View Details</span>
              <ChevronRightIcon className="w-4 h-4 text-blue-600 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
