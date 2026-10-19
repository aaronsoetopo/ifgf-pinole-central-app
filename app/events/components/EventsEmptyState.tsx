import React from "react";
import { EventsEmptyStateProps } from "../types";
import { CalendarX2Icon } from "./Icons";

export function EventsEmptyState({
  selectedCampusName,
  onResetFilter,
}: EventsEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
      {/* Soft icon circle */}
      <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
        <CalendarX2Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        No Events Found
      </h3>

      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        There are currently no upcoming events scheduled for{" "}
        <strong className="text-gray-900 font-semibold">{selectedCampusName}</strong>.
        Check back soon or explore gatherings across our other campuses.
      </p>

      <button
        onClick={onResetFilter}
        className="min-h-[44px] rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Show All Campuses
      </button>
    </div>
  );
}
