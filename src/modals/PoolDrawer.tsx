/**
 * Pool Drawer — talent pool candidate detail + reactivation into active jobs.
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { XIcon, RedoIcon } from "../components/icons";

const PoolDrawer: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();
  const [selectedJob, setSelectedJob] = useState("");

  const { selectedPoolCandidate: selPool, jobs } = state;
  if (!selPool) return null;

  const c = selPool;
  const activeJobs = jobs.filter((j) => j.status === "Active");

  const close = () => {
    dispatch({ type: "SELECT_POOL_CANDIDATE", payload: null });
    setSelectedJob("");
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[520px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-br from-[#6A1B9A] via-[#8E24AA] to-[#CE93D8] ${
            mob ? "px-5 py-5" : "px-7 py-6"
          } text-white relative`}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none rounded-[var(--radius-md)] p-1.5 cursor-pointer text-white flex transition-colors"
          >
            <XIcon />
          </button>
          <div className="flex items-center gap-4">
            <Avatar initials={c.avatar} size="lg" className="!bg-white/25 shrink-0" />
            <div className="min-w-0">
              <h2 className={`${mob ? "text-[17px]" : "text-xl"} font-bold leading-snug`}>
                {c.name}
              </h2>
              <p className="mt-1 text-[13px] opacity-90 font-medium">From: {c.closedJob}</p>
              <div className="text-[12px] opacity-80 mt-0.5">{c.email}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-5 py-5" : "px-7 py-6"} flex flex-col gap-5`}>
          {/* Stage & Rating */}
          <div className="flex justify-between items-center bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Last Stage
              </span>
              <Badge stage={c.lastStage} />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Rating
              </span>
              <Stars value={c.rating} />
            </div>
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-3.5">
              <p className="text-[13px] text-[var(--color-notes-text)] leading-relaxed">{c.notes}</p>
            </div>
          )}

          {/* Skills */}
          <div>
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-2">
              Skills
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[12px] font-semibold"
                >
                  {t}
                </span>
              ))}
              {!c.tags.length && (
                <span className="text-[12.5px] text-[var(--color-text-placeholder)] italic">None</span>
              )}
            </div>
          </div>

          {/* Reactivate */}
          <div className="border-t border-[var(--color-surface-border)] pt-5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
              Reactivate Candidate
            </span>
            <div className={`flex gap-2.5 ${mob ? "flex-col" : ""}`}>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] focus:border-[var(--color-primary)]"
              >
                <option value="">Select job...</option>
                {activeJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
              <button
                className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 hover:bg-[var(--color-primary-hover)] transition-colors"
                disabled={!selectedJob}
                onClick={() => {
                  if (selectedJob) {
                    dispatch({
                      type: "REACTIVATE_POOL",
                      payload: { poolCandidate: c, jobId: Number(selectedJob) },
                    });
                    setSelectedJob("");
                  }
                }}
              >
                <RedoIcon /> Reactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDrawer;
