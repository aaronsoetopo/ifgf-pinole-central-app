import React from "react";
import { CampusFilterBarProps } from "../types";

export function CampusFilterBar({
  campuses,
  selectedCampusId,
  onSelectCampus,
  eventCountByCampus,
}: CampusFilterBarProps) {
  return (
    <div className="w-full mb-2">
      {/* Scrollable pill container on mobile, centered flex on desktop */}
      <div
        role="tablist"
        aria-label="Filter events by church campus"
        className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 sm:justify-center no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {campuses.map((campus) => {
          const isSelected = selectedCampusId === campus.id;
          const count = eventCountByCampus ? eventCountByCampus[campus.id] : undefined;

          return (
            <button
              key={campus.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCampus(campus.id)}
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              <span>{campus.name}</span>
              {typeof count === "number" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isSelected
                      ? "bg-blue-700 text-blue-100"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
