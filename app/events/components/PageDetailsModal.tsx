"use client";

import React, { useEffect, useRef } from "react";
import { XIcon, InfoIcon, AlertCircleIcon } from "./Icons";

export interface PageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PageDetailsModal({ isOpen, onClose }: PageDetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <InfoIcon className="w-4 h-4" />
            </div>
            <h2
              id="page-details-title"
              className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight"
            >
              Events Page Architecture & Preview
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details modal"
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-gray-600 text-sm leading-relaxed">
          {/* Section 1: Rough Beta Disclaimer Callout */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3.5">
            <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-md inline-block">
                ⚠️ Rough Beta Preview • Staging Phase (Week 4)
              </span>
              <h3 className="font-bold text-gray-900 text-base">
                Rough Beta Preview • Visual & Layout Staging
              </h3>
              <p className="text-amber-950/90 text-sm leading-relaxed">
                Please note: This <code className="font-semibold bg-amber-100/80 px-1 py-0.5 rounded">/events</code> screen is currently an interactive design prototype and visual staging baseline. All events currently displayed are representative seed mocks. Dynamic Firestore database subscriptions, admin CRUD publishing forms, and live Google/Apple Calendar export tools are actively being engineered for the production release.
              </p>
            </div>
          </div>

          {/* Section 2: What's on This Screen */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              What&apos;s on This Screen
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 mt-0.5">•</span>
                <div>
                  <strong className="text-gray-900">Multi-Campus Filter Bar:</strong> Allows visitors to filter events across all 3 official IFGF church locations (<em>Pinole Campus</em>, <em>San Ramon Campus</em>, <em>South Bay Campus</em>), or view all gatherings simultaneously with live counts.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 mt-0.5">•</span>
                <div>
                  <strong className="text-gray-900">Dual-Variant Event Cards:</strong>
                  <ul className="mt-1 space-y-1 pl-4 text-xs text-gray-500">
                    <li>— <em>Photography Banner Cards:</em> High-impact visual headers for gatherings with official artwork or promotional flyers.</li>
                    <li>— <em>Colored Date Block Cards:</em> An elegant typographic calendar hero for announcements without a flyer image.</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 mt-0.5">•</span>
                <div>
                  <strong className="text-gray-900">Interactive Card Surface & Details Modal:</strong> Pressing anywhere on an event card opens an accessible detail dialog with exact schedule, venue address, complete description, and dummy calendar synchronization.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3: Design Decisions & Technical Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Design Decisions & Technical Architecture
            </h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-1">
                  Homepage Visual Parity
                </p>
                <p className="text-xs text-gray-600">
                  Built with solid <code className="bg-gray-200/60 px-1 py-0.5 rounded">bg-white</code> card surfaces and a gentle <code className="bg-gray-200/60 px-1 py-0.5 rounded">bg-gradient-to-b from-blue-50/80 to-white</code> hero section matching the church homepage branding.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-1">
                  Zero-Hardcoding Fluid Alignment
                </p>
                <p className="text-xs text-gray-600">
                  Employs pure CSS Flexbox auto-margins (<code className="bg-gray-200/60 px-1 py-0.5 rounded">mt-auto</code>) to naturally push descriptions and footers to the bottom across all cards, guaranteeing identical alignment regardless of title line count.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-1">
                  Collision-Proof Flex Badges
                </p>
                <p className="text-xs text-gray-600">
                  Date chips and category pills live inside an auto-flex container with truncation safeguards, preventing horizontal pill overlap on any viewport width.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-100">
                <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-1">
                  Resilient 5-State Architecture
                </p>
                <p className="text-xs text-gray-600">
                  Comprehensive states for Loading (Pulse Skeletons), Populated, Empty (filtered zero results), Error, and Preview staging.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Admin Workflow & Full Development Roadmap */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Admin Workflow & Full Development Roadmap
            </h3>
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-gray-900">Admin Portal (<code className="text-xs bg-blue-100 px-1 py-0.5 rounded">/admin/events</code>):</strong> Pastors, church staff, and ministry leaders will access a dedicated management interface protected by role-based access control.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-gray-900">Event Publishing Form:</strong> Admins can publish new events by specifying title, date & time, campus location (linked to the official Locations collection), category tag, and optional flyer graphic URL.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-gray-900">Real-Time Live Updates:</strong> As soon as an admin saves an event, Firestore listeners will instantly push the update to congregants&apos; phones and browsers in real time without requiring a page refresh.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Got It, Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
