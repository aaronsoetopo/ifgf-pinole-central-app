import React from "react";

export function EventCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col h-full"
    >
      {/* Header placeholder (matches aspect-video of EventCard) */}
      <div className="aspect-video w-full bg-gray-200" />

      {/* Body placeholder */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        {/* Category badge */}
        <div className="h-3 w-20 bg-gray-200 rounded" />

        {/* Title */}
        <div className="h-6 w-4/5 bg-gray-200 rounded" />

        {/* Meta row items */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-1/2 bg-gray-200 rounded" />
          <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
        </div>

        {/* Description lines */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3.5 w-full bg-gray-200 rounded" />
          <div className="h-3.5 w-4/5 bg-gray-200 rounded" />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
