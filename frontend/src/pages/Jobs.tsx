/**
 * Jobs page — grid of active job postings with create/edit/delete functionality.
 * Closed jobs are hidden from the main grid; a "Closed Jobs" panel lets managers
 * preview, optionally edit, and repost any closed job as a fresh Active opening.
 * Route: /jobs
 */

import { useState, useEffect, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useMobile } from "../hooks/useMediaQuery";
import { LOCATIONS, JOB_TYPES } from "../data/constants";
import { PlusIcon, EditIcon, LocIcon, ListCheckIcon, RedoIcon, ChevIcon, XIcon } from "../components/icons";
import { updateJob } from "../api/jobs";
import type { Job } from "../data/types";

/* ─── Repost Modal ─── */

interface RepostModalProps {
  job: Job;
  mob: boolean;
  onClose: () => void;
  onPosted: (created: Job) => void;
}

const RepostModal: FC<RepostModalProps> = ({ job, mob, onClose, onPosted }) => {
  const [form, setForm] = useState({
    title: job.title,
    dept: job.dept,
    location: job.location,
    type: job.type,
    description: job.description ?? "",
    qualifications: job.qualifications ?? "",
  });
  const [saving, setSaving] = useState(false);

  // Re-sync if the source job changes (e.g. user opens a different closed job)
  useEffect(() => {
    setForm({
      title: job.title,
      dept: job.dept,
      location: job.location,
      type: job.type,
      description: job.description ?? "",
      qualifications: job.qualifications ?? "",
    });
  }, [job]);

  const post = async () => {
    if (!form.title || saving) return;
    setSaving(true);
    try {
      const posted = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const updated = await updateJob(job.id, { ...form, status: "Active", posted, closed: undefined });
      onPosted(updated);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)]";
  const labelClass =
    "text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={onClose}
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
            <h2 className="text-[17px] font-bold text-[var(--color-text-heading)]">Repost Job</h2>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              Review and edit before posting as a new active opening
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-bg)] border-none cursor-pointer text-[var(--color-text-muted)] flex rounded-[var(--radius-md)] p-1.5 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Closed-from badge */}
        <div className="px-6 pt-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-bg)] border border-[var(--color-surface-muted)] rounded-full px-3 py-1">
            Originally closed{job.closed ? ` ${job.closed}` : ""}
          </span>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              Job Title <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className={labelClass}>Department</label>
              <input
                className={inputClass}
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <select
                className={inputClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

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
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} resize-y min-h-[80px]`}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>Qualifications</label>
            <textarea
              className={`${inputClass} resize-y min-h-[80px]`}
              rows={3}
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-2.5 pt-1 border-t border-[var(--color-surface-border)] mt-1">
            <button
              className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={saving || !form.title}
              className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-2 shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={post}
            >
              <RedoIcon />
              {saving ? "Posting…" : "Post as New Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Jobs Page ─── */

const Jobs: FC = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const mob = useMobile();

  const { candidates, jobs } = state;
  const canCreate = !!user;

  const [showClosed, setShowClosed] = useState(false);
  const [repostTarget, setRepostTarget] = useState<Job | null>(null);

  const activeJobs = jobs.filter((j) => j.status === "Active");
  const closedJobs = jobs.filter((j) => j.status === "Closed");

  const openJobModal = (job: (typeof jobs)[number] | null) => {
    dispatch({ type: "SET_EDIT_JOB", payload: job });
    dispatch({ type: "SET_SHOW_JOB_MODAL", payload: true });
  };

  const handleReposted = (updated: Job) => {
    dispatch({ type: "UPDATE_JOB", payload: updated });
    dispatch({
      type: "ADD_TOAST",
      payload: {
        id: `${Date.now()}-${Math.random()}`,
        message: `"${updated.title}" is now active again!`,
        variant: "success",
      },
    });
    setRepostTarget(null);
  };

  return (
    <>
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
            Job Openings
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">{activeJobs.length} active positions</p>
        </div>
        <div className="flex items-center gap-2.5">
          {closedJobs.length > 0 && (
            <button
              className={`border-2 border-[var(--color-primary)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 text-[var(--color-primary)] ${
                showClosed
                  ? "bg-[var(--color-primary-light)]"
                  : "bg-transparent hover:bg-[var(--color-primary-light)]"
              }`}
              onClick={() => setShowClosed((v) => !v)}
            >
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {closedJobs.length}
              </span>
              {mob ? "Closed" : "Closed Jobs"}
              <ChevIcon
                style={{ transform: showClosed ? "rotate(90deg)" : "rotate(270deg)", transition: "transform 0.2s" }}
              />
            </button>
          )}
          {canCreate && (
            <button
              className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-btn-primary-hover)] active:scale-[0.98]"
              onClick={() => openJobModal(null)}
            >
              <PlusIcon />
              {mob ? "New" : "Post New Job"}
            </button>
          )}
        </div>
      </div>

      {/* Closed Jobs Panel */}
      {showClosed && closedJobs.length > 0 && (
        <div className="mb-6 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] flex items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Closed Positions
            </span>
            <span className="text-[10px] font-bold bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full">
              {closedJobs.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--color-surface-border-light)]">
            {closedJobs.map((j) => (
              <div
                key={`${j.source ?? "local"}-${j.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                onClick={() => setRepostTarget(j)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-semibold text-[var(--color-text-heading)] truncate">
                      {j.title}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-bg)] border border-[var(--color-surface-muted)] rounded-full px-2 py-0.5 shrink-0">
                      {j.dept}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11.5px] text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <LocIcon />
                      {j.location}
                    </span>
                    {j.closed && <span>· Closed {j.closed}</span>}
                  </div>
                </div>
                <button
                  title="Preview & repost"
                  className="w-9 h-9 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shrink-0 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRepostTarget(j);
                  }}
                >
                  <RedoIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs Grid */}
      <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-5`}>
        {activeJobs.map((j) => {
          const jc =
            j.source !== "api"
              ? candidates.filter((c) => c.job.id === j.id)
              : [];
          return (
            <div
              key={`${j.source ?? "local"}-${j.id}`}
              className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-6 shadow-[var(--shadow-card)] cursor-pointer relative overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
              onClick={() => openJobModal(j)}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--color-text-heading)]">{j.title}</h3>
                  <p className="mt-1 text-[12.5px] text-[var(--color-text-secondary)]">
                    {j.dept} · {j.type}
                  </p>
                </div>
                <button
                  className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-3 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    openJobModal(j);
                  }}
                >
                  <EditIcon /> Edit
                </button>
              </div>
              <div className="flex items-center gap-1.5 my-2.5 text-[12.5px] text-[var(--color-text-subtle)]">
                <LocIcon />
                {j.location}
              </div>
              <p className="text-[12.5px] text-[var(--color-text-subtle)] leading-relaxed mb-3">
                {j.description}
              </p>
              {j.qualifications && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ListCheckIcon />
                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Qualifications
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-subtle)] leading-relaxed bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] p-2.5">
                    {j.qualifications}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-[var(--color-surface-border-light)] pt-3 mt-1">
                <span className="text-[13px]">
                  <strong className="text-[var(--color-primary)]">{jc.length}</strong>{" "}
                  <span className="text-[var(--color-text-muted)]">applicants</span>
                </span>
                <span className="text-[11.5px] text-[var(--color-text-muted)]">{j.posted}</span>
              </div>
            </div>
          );
        })}
        {activeJobs.length === 0 && (
          <div className="col-span-2 py-16 text-center text-[var(--color-text-placeholder)] text-[13px] border-2 border-dashed border-[var(--color-surface-muted)] rounded-[var(--radius-lg)]">
            No active job openings.
          </div>
        )}
      </div>

    </div>

    {/* Repost Modal — rendered outside animate-fade-in to avoid transform containing block */}
    {repostTarget && (
      <RepostModal
        job={repostTarget}
        mob={mob}
        onClose={() => setRepostTarget(null)}
        onPosted={handleReposted}
      />
    )}
  </>
  );
};

export default Jobs;
