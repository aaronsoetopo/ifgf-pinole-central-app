"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MinistryTeam,
  addMinistryTeam,
  updateMinistryTeam,
  deleteMinistryTeam,
  seedMinistryTeams,
  subscribeToMinistryTeams,
} from "@/lib/ministryTeams";
import {
  UserDocument,
  subscribeToUsers,
  assignTeamLeader,
  removeTeamLeader,
} from "@/lib/users";

// ─── Page ─────────────────────────────────────────────────────────────────────
// Role guard is handled by app/admin/layout.tsx — no need to repeat it here.

export default function MinistryTeamsAdminPage() {
  // Teams list
  const [teams, setTeams] = useState<MinistryTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState("");

  // Users list (for assignment)
  const [users, setUsers] = useState<UserDocument[]>([]);

  // Add-team form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Seed
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");

  // Edit modal state
  const [editingTeam, setEditingTeam] = useState<MinistryTeam | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation state
  const [deletingTeam, setDeletingTeam] = useState<MinistryTeam | null>(null);
  const [deleteWorking, setDeleteWorking] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Assign leader modal state
  const [assigningTeam, setAssigningTeam] = useState<MinistryTeam | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignWorking, setAssignWorking] = useState(false);
  const [assignError, setAssignError] = useState("");

  // ── Real-time teams subscription ──────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = subscribeToMinistryTeams(
      (data) => {
        setTeams(data);
        setTeamsLoading(false);
      },
      (err) => {
        console.error(err);
        setTeamsError("Failed to load ministry teams.");
        setTeamsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Real-time users subscription ──────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => setUsers(data));
    return () => unsubscribe();
  }, []);

  // ── Add handler ───────────────────────────────────────────────────────────

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    if (!name.trim()) { setFormError("Team name is required."); return; }
    setSubmitting(true);
    try {
      await addMinistryTeam(name, description);
      setName("");
      setDescription("");
      setSuccessMsg(`"${name.trim()}" added successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setFormError("Failed to add team. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Seed handler ──────────────────────────────────────────────────────────

  async function handleSeed() {
    setSeeding(true);
    setSeedResult("");
    try {
      const added = await seedMinistryTeams();
      setSeedResult(
        added === 0
          ? "All default teams already exist — nothing added."
          : `${added} default team${added === 1 ? "" : "s"} added successfully.`
      );
    } catch (err) {
      console.error(err);
      setSeedResult("Seeding failed. Check the console for details.");
    } finally {
      setSeeding(false);
    }
  }

  // ── Edit handlers ─────────────────────────────────────────────────────────

  function openEdit(team: MinistryTeam) {
    setEditingTeam(team);
    setEditName(team.name);
    setEditDescription(team.description ?? "");
    setEditError("");
  }

  function closeEdit() {
    setEditingTeam(null);
    setEditError("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    if (!editName.trim()) { setEditError("Team name is required."); return; }
    if (!editingTeam) return;
    setEditSaving(true);
    try {
      await updateMinistryTeam(editingTeam.id, editName, editDescription);
      closeEdit();
    } catch (err) {
      console.error(err);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────

  function openDelete(team: MinistryTeam) {
    setDeletingTeam(team);
    setDeleteError("");
  }

  function closeDelete() {
    setDeletingTeam(null);
    setDeleteError("");
  }

  async function handleConfirmDelete() {
    if (!deletingTeam) return;
    setDeleteWorking(true);
    setDeleteError("");
    try {
      await deleteMinistryTeam(deletingTeam.id);
      closeDelete();
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete team. Please try again.");
    } finally {
      setDeleteWorking(false);
    }
  }

  // ── Assign handlers ───────────────────────────────────────────────────────

  function openAssign(team: MinistryTeam) {
    setAssigningTeam(team);
    setAssignUserId("");
    setAssignError("");
  }

  function closeAssign() {
    setAssigningTeam(null);
    setAssignError("");
  }

  async function handleAssignLeader(e: React.FormEvent) {
    e.preventDefault();
    setAssignError("");
    if (!assignUserId) {
      setAssignError("Please select a user.");
      return;
    }
    if (!assigningTeam) return;
    setAssignWorking(true);
    try {
      await assignTeamLeader(assignUserId, assigningTeam.id);
      closeAssign();
    } catch (err) {
      console.error(err);
      setAssignError("Failed to assign leader.");
    } finally {
      setAssignWorking(false);
    }
  }

  async function handleRemoveLeader(userId: string, teamId: string) {
    try {
      await removeTeamLeader(userId, teamId);
    } catch (err) {
      console.error(err);
      alert("Failed to remove leader.");
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
              <h1 className="text-2xl font-extrabold text-gray-900">Ministry Teams</h1>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-60 transition-colors"
              >
                {seeding ? "Seeding…" : "⚡ Seed Default Teams"}
              </button>
            </div>
          </div>

          {seedResult && (
            <p className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm text-purple-700">
              {seedResult}
            </p>
          )}

          {/* Teams list */}
          <section>
            {teamsError ? (
              <p className="text-sm text-red-600">{teamsError}</p>
            ) : teamsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
                <p className="text-sm text-gray-400">
                  No ministry teams yet.{" "}
                  <button
                    onClick={handleSeed}
                    className="text-purple-600 underline hover:text-purple-800"
                  >
                    Seed the defaults
                  </button>{" "}
                  or add one below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => {
                  const teamLeaders = users.filter((u) => u.leaderOfTeams?.includes(team.id));
                  return (
                    <TeamRow
                      key={team.id}
                      team={team}
                      leaders={teamLeaders}
                      onEdit={() => openEdit(team)}
                      onDelete={() => openDelete(team)}
                      onAssign={() => openAssign(team)}
                      onRemoveLeader={(userId) => handleRemoveLeader(userId, team.id)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Add Team form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Add a New Team</h2>

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

            <form onSubmit={handleAddTeam} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="team-name" className="text-sm font-medium text-gray-700">
                  Team name <span className="text-red-500">*</span>
                </label>
                <input
                  id="team-name"
                  type="text"
                  required
                  placeholder="e.g. Media Team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="team-description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="team-description"
                  rows={3}
                  placeholder="What does this team do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="self-start rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Adding…" : "Add Team"}
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* ── Edit modal ─────────────────────────────────────────────────────── */}
      {editingTeam && (
        <Modal onClose={closeEdit} title={`Edit "${editingTeam.name}"`}>
          {editError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editError}
            </div>
          )}
          <form onSubmit={handleSaveEdit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                Team name <span className="text-red-500">*</span>
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
              <label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="edit-description"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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

      {/* ── Assign Leader modal ────────────────────────────────────────────── */}
      {assigningTeam && (
        <Modal onClose={closeAssign} title={`Assign Leader to "${assigningTeam.name}"`}>
          {assignError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {assignError}
            </div>
          )}
          <form onSubmit={handleAssignLeader} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="assign-user" className="text-sm font-medium text-gray-700">
                Select a user
              </label>
              <select
                id="assign-user"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">-- Choose user --</option>
                {users.map((u) => {
                  const isAlreadyLeader = u.leaderOfTeams?.includes(assigningTeam.id);
                  if (isAlreadyLeader) return null;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeAssign}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignWorking}
                className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition-colors"
              >
                {assignWorking ? "Assigning…" : "Assign Leader"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete confirmation dialog ──────────────────────────────────────── */}
      {deletingTeam && (
        <Modal onClose={closeDelete} title="Delete team?" danger>
          <p className="mb-2 text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">&ldquo;{deletingTeam.name}&rdquo;</span>?
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

// ─── TeamRow ──────────────────────────────────────────────────────────────────

function TeamRow({
  team,
  leaders,
  onEdit,
  onDelete,
  onAssign,
  onRemoveLeader,
}: {
  team: MinistryTeam;
  leaders: UserDocument[];
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onRemoveLeader: (userId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-purple-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
            {team.name[0]}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{team.name}</p>
            {team.description && (
              <p className="mt-0.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                {team.description}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onEdit}
            aria-label={`Edit ${team.name}`}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${team.name}`}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Leaders section */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 shrink-0">
          Leaders:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {leaders.length === 0 ? (
            <span className="text-xs text-gray-400 italic">None assigned</span>
          ) : (
            leaders.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 pl-2.5 pr-1 py-0.5 text-xs font-medium text-purple-800"
              >
                {l.name}
                <button
                  onClick={() => onRemoveLeader(l.id)}
                  aria-label={`Remove ${l.name}`}
                  className="rounded-full p-1 hover:bg-purple-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </span>
            ))
          )}
          <button
            onClick={onAssign}
            className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-500 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            + Assign
          </button>
        </div>
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
