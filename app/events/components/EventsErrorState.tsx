import React from "react";
import { EventsErrorStateProps } from "../types";
import { AlertCircleIcon } from "./Icons";

export function EventsErrorState({
  errorMessage = "Unable to load church calendar. Please check your connection.",
  onRetry,
}: EventsErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50/60 p-8 sm:p-10 text-center max-w-md mx-auto my-8"
    >
      <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
        <AlertCircleIcon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-red-950 mb-1">
        Calendar Unavailable
      </h3>

      <p className="text-sm text-red-700 mb-6 leading-relaxed">
        {errorMessage}
      </p>

      <button
        onClick={onRetry}
        className="min-h-[44px] rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  );
}
