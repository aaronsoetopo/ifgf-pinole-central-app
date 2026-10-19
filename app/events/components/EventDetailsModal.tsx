"use client";

import React, { useEffect, useState, useRef } from "react";
import { EventDetailsModalProps } from "../types";
import {
  CalendarIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  XIcon,
  CheckIcon,
  ChevronRightIcon,
} from "./Icons";

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

export function EventDetailsModal({
  isOpen,
  event,
  onClose,
}: EventDetailsModalProps) {
  const [calendarAddedToast, setCalendarAddedToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close on Escape key & lock scroll when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Clear toast timer on unmount/close
  useEffect(() => {
    if (!isOpen) {
      setCalendarAddedToast(false);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const { month, day } = getDateParts(event.date);
  const categoryLabel = event.category?.trim() || "General";

  function handleAddToCalendar() {
    setCalendarAddedToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setCalendarAddedToast(false);
    }, 4000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 h-10 w-10 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* ── Visual Header (Image or Colored Date Block) ── */}
        {event.imageUrl ? (
          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 shrink-0">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white rounded-full">
              {categoryLabel}
            </div>
          </div>
        ) : (
          <div className="relative h-48 sm:h-52 w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 flex items-center justify-between text-white overflow-hidden shrink-0">
            <CalendarDaysIcon className="opacity-15 w-32 h-32 absolute -right-6 -bottom-6 pointer-events-none text-white" />
            <div className="z-10">
              <span className="text-sm font-bold uppercase tracking-widest text-blue-200">
                {month}
              </span>
              <span className="block text-5xl font-extrabold tracking-tight text-white leading-none mt-1">
                {day}
              </span>
              <span className="block text-sm text-blue-100 font-medium mt-2">
                {event.displayDate}
              </span>
            </div>
            <div className="z-10 rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-white border border-white/20">
              {categoryLabel}
            </div>
          </div>
        )}

        {/* ── Scrollable Body Content ── */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Header & Title */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
              {categoryLabel}
            </span>
            <h2
              id="event-modal-title"
              className="text-2xl font-extrabold text-gray-900 tracking-tight"
            >
              {event.title}
            </h2>
          </div>

          {/* Key Details Bar */}
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-2.5 text-sm text-gray-700">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">{event.displayDate}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ClockIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">{event.time}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPinIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{event.locationName}</p>
                {event.locationAddress && (
                  <p className="text-xs text-gray-500 mt-0.5">{event.locationAddress}</p>
                )}
              </div>
            </div>

            {event.rsvpUrl && (
              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-700">RSVP Required</span>
                <a
                  href={event.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Form</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              About This Event
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/70 flex flex-col gap-3 shrink-0">
          {/* Calendar Feedback Toast */}
          {calendarAddedToast && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Calendar Sync:</strong> Direct sync (.ics / Google Calendar) launching in Week 4!
              </span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="min-h-[44px] rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Close
            </button>
            <button
              onClick={handleAddToCalendar}
              className={`min-h-[44px] rounded-full px-6 py-2.5 text-sm font-semibold transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                event.rsvpUrl
                  ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-current" />
              <span>Add to Calendar</span>
            </button>
            {event.rsvpUrl && (
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>RSVP Online</span>
                <ChevronRightIcon className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
