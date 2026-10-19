import React from "react";
import { SparklesIcon, InfoIcon } from "./Icons";

export interface EventsHeaderProps {
  onOpenPageDetails: () => void;
}

export function EventsHeader({ onOpenPageDetails }: EventsHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto mb-8 sm:mb-10">
      {/* Pills Container */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Simplified Status Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
          <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Placeholder</span>
        </div>

        {/* Page Details Button */}
        <button
          type="button"
          onClick={onOpenPageDetails}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="View page specifications, design choices, and admin roadmap"
        >
          <InfoIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Page Details</span>
        </button>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
        Upcoming Events
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
        Find your place to connect, grow, and serve together, within the IFGF network.
      </p>
    </div>
  );
}
