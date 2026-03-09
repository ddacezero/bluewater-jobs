/**
 * Not Qualified Modal — decision flow for candidates flagged as Not Qualified.
 * Options: endorse to another job, or add to talent pool.
 */

import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import Avatar from "../components/Avatar";
import { XIcon, EndorseIcon, PoolIcon } from "../components/icons";

const NotQualifiedModal: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { nqCandidate, nqAction, nqJob, jobs } = state;
  if (!nqCandidate) return null;

  const activeJobs = jobs.filter((j) => j.status === "Active");

  const close = () => {
    dispatch({ type: "SET_NQ_CANDIDATE", payload: null });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,30,50,0.45)] backdrop-blur-[4px]" style={mob ? { alignItems: "flex-end" } : {}} onClick={close}>
      <div className={`${mob ? "w-full rounded-t-[18px]" : "w-[440px] rounded-[18px]"} max-h-[92vh] bg-white overflow-auto shadow-[var(--shadow-modal)]`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-br from-[var(--color-nq-gradient-start)] via-[var(--color-nq-gradient-mid)] to-[var(--color-nq-gradient-end)] ${mob ? "px-4.5 py-4" : "px-6 py-5.5"} text-white relative`}>
          <button onClick={close} className="absolute top-2.5 right-2.5 bg-white/20 border-none rounded-lg p-1.5 cursor-pointer text-white flex">
            <XIcon />
          </button>
          <div className="flex items-center gap-3">
            <Avatar initials={nqCandidate.avatar} size="md" className="!bg-white/25 !text-[15px]" />
            <div>
              <h3 className="text-base font-bold">Not Qualified</h3>
              <p className="mt-0.5 text-[13px] opacity-90">{nqCandidate.name} — {nqCandidate.role}</p>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-4.5 py-4" : "px-6 py-5"}`}>
          {/* Decision Screen */}
          {!nqAction && (
            <>
              <p className="mb-3.5 text-[13px] text-[var(--color-text-subtle)]">
                This candidate will be tagged as Not Qualified. What would you like to do?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  className="bg-white rounded-[var(--radius-lg)] border-2 border-[var(--color-surface-border)] p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 text-left hover:border-[var(--color-primary)]"
                  onClick={() => dispatch({ type: "SET_NQ_ACTION", payload: "endorse" })}
                >
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                    <EndorseIcon />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-0.5">Endorse to Another Job</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Move candidate to a different job opening</div>
                  </div>
                </button>
                <button
                  className="bg-white rounded-[var(--radius-lg)] border-2 border-[var(--color-surface-border)] p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 text-left hover:border-[var(--color-purple)]"
                  onClick={() => {
                    dispatch({ type: "ADD_TO_POOL", payload: nqCandidate });
                    dispatch({ type: "SET_NQ_CANDIDATE", payload: null });
                  }}
                >
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-purple-light)] flex items-center justify-center text-[var(--color-purple)] shrink-0">
                    <PoolIcon />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-0.5">Add to Talent Pool</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Save for future opportunities</div>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Endorse Screen */}
          {nqAction === "endorse" && (
            <>
              <p className="mb-2.5 text-[13px] text-[var(--color-text-subtle)]">
                Select a job to endorse <strong>{nqCandidate.name}</strong> to:
              </p>
              <select
                value={nqJob}
                onChange={(e) => dispatch({ type: "SET_NQ_JOB", payload: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit] mb-3"
              >
                <option value="">Select job opening...</option>
                {activeJobs
                  .filter((j) => j.id !== nqCandidate.jobId)
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.location}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold bg-transparent cursor-pointer"
                  onClick={() => dispatch({ type: "SET_NQ_ACTION", payload: null })}
                >
                  Back
                </button>
                <button
                  className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold shadow-[var(--shadow-btn)] cursor-pointer disabled:opacity-50"
                  disabled={!nqJob}
                  onClick={() => {
                    if (nqJob) {
                      dispatch({ type: "NQ_ENDORSE", payload: { candidate: nqCandidate, jobId: Number(nqJob) } });
                    }
                  }}
                >
                  Confirm Endorse
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotQualifiedModal;
