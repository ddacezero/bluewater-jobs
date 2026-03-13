/**
 * Job Modal — create, edit, or delete job postings.
 *
 * - API-backed jobs (source:"api") are persisted to the backend on save/delete.
 * - Seeded/local jobs are mutated in frontend state only.
 * - Role-based: talent_acquisition_specialist cannot create or delete jobs.
 * - Delete is blocked if the job has any linked candidates.
 * - A confirmation modal is shown before any delete is executed.
 */

import { useState, useEffect, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useMobile } from "../hooks/useMediaQuery";
import { LOCATIONS, JOB_TYPES } from "../data/constants";
import type { Job } from "../data/types";
import { XIcon } from "../components/icons";
import { createJob, updateJob, deleteJob } from "../api/jobs";

/* ─── Module-level constant so the useEffect dep array is stable ─── */
const EMPTY_FORM: Omit<Job, "id" | "source"> = {
  title: "",
  dept: "",
  location: LOCATIONS[0],
  type: "Full-time",
  status: "Active",
  posted: "", // overwritten at save time for new jobs
  description: "",
  qualifications: "",
};

const JobModal: FC = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const mob = useMobile();

  const { showJobModal, editJob } = state;
  const isEdit = !!editJob;

  // Only hr_manager and talent_acquisition_manager can create or delete
  const canManage =
    user?.role === "hr_manager" || user?.role === "talent_acquisition_manager";

  const [form, setForm] = useState<Omit<Job, "id" | "source">>(
    isEdit && editJob ? { ...editJob } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync form whenever the job being edited changes
  useEffect(() => {
    setForm(editJob ? { ...editJob } : EMPTY_FORM);
  }, [editJob]);

  if (!showJobModal) return null;

  const close = () => {
    dispatch({ type: "SET_SHOW_JOB_MODAL", payload: false });
    dispatch({ type: "SET_EDIT_JOB", payload: null });
    setShowConfirm(false);
  };

  const addToast = (
    message: string,
    variant: "success" | "error" | "info"
  ) => {
    dispatch({
      type: "ADD_TOAST",
      payload: { id: `${Date.now()}-${Math.random()}`, message, variant },
    });
  };

  /* ── Save (create or update) ── */
  const save = async () => {
    if (!form.title || saving) return;
    setSaving(true);
    try {
      if (isEdit && editJob) {
        // Strip meta fields before sending to API
        const { source, ...payload } = { ...editJob, ...form } as Job;
        if (source === "api") {
          const updated = await updateJob(editJob.id, payload);
          dispatch({ type: "UPDATE_JOB", payload: updated });
        } else {
          dispatch({
            type: "UPDATE_JOB",
            payload: { ...editJob, ...form } as Job,
          });
        }
        addToast(`"${form.title}" updated successfully.`, "info");
      } else {
        const posted = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const created = await createJob({
          ...form,
          posted,
          status: form.status as Job["status"],
        });
        dispatch({ type: "ADD_JOB", payload: created });
        addToast(`"${created.title}" posted successfully!`, "success");
      }
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "An error occurred.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete — gate check, then show confirmation ── */
  const del = () => {
    if (!editJob) return;
    // API jobs have no seeded candidates — skip the count check entirely
    const count =
      editJob.source !== "api"
        ? state.candidates.filter((c) => c.jobId === editJob.id).length
        : 0;
    if (count > 0) {
      addToast(
        `Cannot delete: "${editJob.title}" has ${count} candidate${count !== 1 ? "s" : ""} currently in the pipeline for this role.`,
        "error"
      );
      return;
    }
    setShowConfirm(true);
  };

  /* ── Confirm and execute delete ── */
  const confirmDelete = async () => {
    if (!editJob) return;
    setShowConfirm(false);
    try {
      if (editJob.source === "api") {
        await deleteJob(editJob.id);
      }
      dispatch({ type: "DELETE_JOB", payload: { id: editJob.id, source: editJob.source } });
      addToast(`"${editJob.title}" has been deleted.`, "error");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to delete job.",
        "error"
      );
    }
  };

  /* ── Status change — auto-populate closed date ── */
  const handleStatusChange = (newStatus: string) => {
    const updates: Partial<typeof form> = {
      status: newStatus as Job["status"],
    };
    if (newStatus === "Closed" && !form.closed) {
      updates.closed = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else if (newStatus === "Active") {
      updates.closed = undefined;
    }
    setForm({ ...form, ...updates });
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)]";
  const labelClass =
    "text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5";

  return (
    <>
      {/* ── Main Modal ── */}
      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
        style={mob ? { alignItems: "flex-end" } : {}}
        onClick={close}
      >
        <div
          className={`${
            mob ? "w-full rounded-t-[20px]" : "w-[520px] rounded-[20px]"
          } max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5 flex justify-between items-center border-b border-[var(--color-surface-border)]">
            <div>
              <h2 className="text-[17px] font-bold text-[var(--color-text-heading)]">
                {isEdit ? "Edit Job Posting" : "Post New Job"}
              </h2>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                {isEdit
                  ? "Update the job details below"
                  : "Fill in the job details below"}
              </p>
            </div>
            <button
              onClick={close}
              className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-bg)] border-none cursor-pointer text-[var(--color-text-muted)] flex rounded-[var(--radius-md)] p-1.5 transition-colors"
            >
              <XIcon />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Job Title{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Resort Manager"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div
              className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}
            >
              <div>
                <label className={labelClass}>Department</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Operations"
                  value={form.dept}
                  onChange={(e) => setForm({ ...form, dept: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <select
                  className={inputClass}
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                >
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {["Active", "Closed"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} resize-y min-h-[80px]`}
                rows={3}
                placeholder="Describe the role..."
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className={labelClass}>Qualifications</label>
              <textarea
                className={`${inputClass} resize-y min-h-[80px]`}
                rows={3}
                placeholder="List required qualifications..."
                value={form.qualifications || ""}
                onChange={(e) =>
                  setForm({ ...form, qualifications: e.target.value })
                }
              />
            </div>

            {/* Footer actions */}
            <div className="flex justify-between items-center pt-1 border-t border-[var(--color-surface-border)] mt-1">
              <div>
                {isEdit && canManage && (
                  <button
                    className="bg-[var(--color-danger-bg)] text-[var(--color-danger-dark)] border border-[var(--color-danger-border)] rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-semibold cursor-pointer hover:bg-[var(--color-danger)] hover:text-white transition-colors"
                    onClick={del}
                  >
                    Delete Job
                  </button>
                )}
              </div>
              <div className="flex gap-2.5">
                <button
                  className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={save}
                >
                  {saving ? "Saving…" : isEdit ? "Save Changes" : "Post Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm Delete Modal ── */}
      {showConfirm && editJob && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-[var(--color-surface)] rounded-[16px] p-6 w-[340px] shadow-[var(--shadow-modal)] border border-[var(--color-surface-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-bold text-[var(--color-text-heading)] mb-2">
              Delete Job Posting?
            </h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">
              Are you sure you want to delete{" "}
              <strong>"{editJob.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[var(--color-danger)] text-white rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobModal;
