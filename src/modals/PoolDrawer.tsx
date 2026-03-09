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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,30,50,0.45)] backdrop-blur-[4px]" style={mob ? { alignItems: "flex-end" } : {}} onClick={close}>
      <div className={`${mob ? "w-full rounded-t-[18px]" : "w-[520px] rounded-[18px]"} max-h-[92vh] bg-white overflow-auto shadow-[var(--shadow-modal)]`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-br from-[#8E24AA] via-[#AB47BC] to-[#D4B6EB] ${mob ? "px-4.5 py-5" : "px-6.5 py-7"} text-white relative`}>
          <button onClick={close} className="absolute top-3 right-3 bg-white/20 border-none rounded-lg p-1.5 cursor-pointer text-white flex">
            <XIcon />
          </button>
          <div className="flex items-center gap-3.5">
            <Avatar initials={c.avatar} size="lg" className="!bg-white/25" />
            <div>
              <h2 className={`${mob ? "text-[17px]" : "text-xl"} font-bold`}>{c.name}</h2>
              <p className="mt-1 text-[13px] opacity-90">From: {c.closedJob}</p>
              <div className="text-xs opacity-85">{c.email}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-4.5 py-4" : "px-6.5 py-5"}`}>
          {/* Stage & Rating */}
          <div className="flex justify-between mb-3.5">
            <div>
              <span className="text-[11px] text-[var(--color-text-secondary)]">Last Stage</span>
              <div className="mt-1"><Badge stage={c.lastStage} /></div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Rating</span>
              <div className="mt-1"><Stars value={c.rating} /></div>
            </div>
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-2.5 mb-3.5">
              <p className="text-xs text-[var(--color-notes-text)] leading-relaxed">{c.notes}</p>
            </div>
          )}

          {/* Skills */}
          <div className="mb-3.5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold block mb-1.5 uppercase">Skills</span>
            <div className="flex gap-1.5 flex-wrap">
              {c.tags.map((t) => (
                <span key={t} className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg px-2.5 py-1 text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Reactivate */}
          <div className="border-t border-[var(--color-surface-border)] pt-3.5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold block mb-2 uppercase">Reactivate</span>
            <div className={`flex gap-2 ${mob ? "flex-col" : ""}`}>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]">
                <option value="">Select job...</option>
                {activeJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <button
                className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                disabled={!selectedJob}
                onClick={() => {
                  if (selectedJob) {
                    dispatch({ type: "REACTIVATE_POOL", payload: { poolCandidate: c, jobId: Number(selectedJob) } });
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
