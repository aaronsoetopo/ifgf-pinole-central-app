"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Location,
  addLocation,
  updateLocation,
  deleteLocation,
  seedLocations,
  subscribeToLocations,
} from "@/lib/locations";

// ─── Page ─────────────────────────────────────────────────────────────────────
// Role guard is handled by app/admin/layout.tsx — no need to repeat it here.

export default function LocationsAdminPage() {
  // Locations list
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  // Add-location form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Seed
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");

  // Edit modal state
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation state
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [deleteWorking, setDeleteWorking] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Real-time locations subscription ──────────────────────────────────────

  useEffect(() => {
    const unsubscribe = subscribeToLocations(
      (data) => {
        setLocations(data);
        setLocationsLoading(false);
      },
      (err) => {
        console.error(err);
        setLocationsError("Failed to load locations.");
        setLocationsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Add handler ───────────────────────────────────────────────────────────

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    if (!name.trim()) { setFormError("Location name is required."); return; }
    setSubmitting(true);
    try {
      await addLocation(name, address);
      setName("");
      setAddress("");
      setSuccessMsg(`"${name.trim()}" added successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setFormError("Failed to add location. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Seed handler ──────────────────────────────────────────────────────────

  async function handleSeed() {
    setSeeding(true);
    setSeedResult("");
    try {
      const added = await seedLocations();
      setSeedResult(
        added === 0
          ? "All default locations already exist — nothing added."
          : `${added} default location${added === 1 ? "" : "s"} added successfully.`
      );
    } catch (err) {
      console.error(err);
      setSeedResult("Seeding failed. Check the console for details.");
    } finally {
      setSeeding(false);
    }
  }

  // ── Edit handlers ─────────────────────────────────────────────────────────

  function openEdit(loc: Location) {
    setEditingLocation(loc);
    setEditName(loc.name);
    setEditAddress(loc.address ?? "");
    setEditError("");
  }

  function closeEdit() {
    setEditingLocation(null);
    setEditError("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    if (!editName.trim()) { setEditError("Location name is required."); return; }
    if (!editingLocation) return;
    setEditSaving(true);
    try {
      await updateLocation(editingLocation.id, editName, editAddress);
      closeEdit();
    } catch (err) {
      console.error(err);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────

  function openDelete(loc: Location) {
    setDeletingLocation(loc);
    setDeleteError("");
  }

  function closeDelete() {
    setDeletingLocation(null);
    setDeleteError("");
  }

  async function handleConfirmDelete() {
    if (!deletingLocation) return;
    setDeleteWorking(true);
    setDeleteError("");
    try {
      await deleteLocation(deletingLocation.id);
      closeDelete();
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete location. Please try again.");
    } finally {
      setDeleteWorking(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <>
      <main className="flex flex-1 flex-col px-6 py-10">
        <div className="mx-auto w-full max-w-4xl space-y-10">

          {/* Breadcrumb + header */}
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Admin Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-gray-900">Locations</h1>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-lg border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-60 transition-colors"
              >
                {seeding ? "Seeding…" : "⚡ Seed Default Locations"}
              </button>
            </div>
          </div>

          {seedResult && (
            <p className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-700">
              {seedResult}
            </p>
          )}

          {/* Locations list */}
          <section>
            {locationsError ? (
              <p className="text-sm text-red-600">{locationsError}</p>
            ) : locationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
                <p className="text-sm text-gray-400">
                  No locations yet.{" "}
                  <button
                    onClick={handleSeed}
                    className="text-teal-600 underline hover:text-teal-800"
                  >
                    Seed the defaults
                  </button>{" "}
                  or add one below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <LocationRow
                    key={loc.id}
                    location={loc}
                    onEdit={() => openEdit(loc)}
                    onDelete={() => openDelete(loc)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Add Location form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Add a New Location</h2>

            {formError && (
              <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✓ {successMsg}
              </div>
            )}

            <form onSubmit={handleAddLocation} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="location-name" className="text-sm font-medium text-gray-700">
                  Location name <span className="text-red-500">*</span>
                </label>
                <input
                  id="location-name"
                  type="text"
                  required
                  placeholder="e.g. Main Campus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="location-address" className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="location-address"
                  rows={2}
                  placeholder="Street address, City, Zip"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="self-start rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Adding…" : "Add Location"}
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* ── Edit modal ─────────────────────────────────────────────────────── */}
      {editingLocation && (
        <Modal onClose={closeEdit} title={`Edit "${editingLocation.name}"`}>
          {editError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editError}
            </div>
          )}
          <form onSubmit={handleSaveEdit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                Location name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-address" className="text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="edit-address"
                rows={2}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete confirmation dialog ──────────────────────────────────────── */}
      {deletingLocation && (
        <Modal onClose={closeDelete} title="Delete location?" danger>
          <p className="mb-2 text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">&ldquo;{deletingLocation.name}&rdquo;</span>?
          </p>
          <p className="mb-6 text-sm text-gray-500">
            This action cannot be undone.
          </p>

          {deleteError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={closeDelete}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteWorking}
              className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {deleteWorking ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── LocationRow ──────────────────────────────────────────────────────────────

function LocationRow({
  location,
  onEdit,
  onDelete,
}: {
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700">
          {location.name[0]}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{location.name}</p>
          {location.address && (
            <p className="mt-0.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
              {location.address}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onEdit}
          aria-label={`Edit ${location.name}`}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${location.name}`}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  title,
  danger = false,
  onClose,
  children,
}: {
  title: string;
  danger?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Close on Escape key
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="modal-title"
            className={`text-lg font-bold ${danger ? "text-red-600" : "text-gray-900"}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
