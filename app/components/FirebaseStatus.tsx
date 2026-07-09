"use client";

/**
 * FirebaseStatus — TEMPORARY diagnostic component.
 * Shows whether Firebase initialized correctly on the client.
 * Delete this component (and its usage in page.tsx) once confirmed.
 */

import { useEffect, useState } from "react";

type Status = "checking" | "connected" | "error";

export default function FirebaseStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Dynamically import firebase so any init error is catchable here
    import("@/lib/firebase")
      .then((module) => {
        // If the default export (the FirebaseApp) exists, init succeeded
        if (module.default) {
          setStatus("connected");
        } else {
          setStatus("error");
          setErrorMessage("Firebase app object is undefined.");
        }
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMessage(err.message);
      });
  }, []);

  const styles: Record<Status, string> = {
    checking: "bg-yellow-100 text-yellow-800 border-yellow-300",
    connected: "bg-green-100  text-green-800  border-green-300",
    error: "bg-red-100    text-red-800    border-red-300",
  };

  const icons: Record<Status, string> = {
    checking: "⏳",
    connected: "✅",
    error: "❌",
  };

  const labels: Record<Status, string> = {
    checking: "Checking Firebase…",
    connected: "Firebase connected",
    error: `Firebase error: ${errorMessage}`,
  };

  return (
    <div
      className={`mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${styles[status]}`}
    >
      <span>{icons[status]}</span>
      <span>{labels[status]}</span>
    </div>
  );
}
