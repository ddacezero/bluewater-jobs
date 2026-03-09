/**
 * Jobs page — grid of job postings with create/edit/delete functionality.
 * Route: /jobs
 */

import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { PlusIcon, EditIcon, LocIcon, ListCheckIcon } from "../components/icons";

const Jobs: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, jobs } = state;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold`}>Job Openings</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">{jobs.length} positions</p>
        </div>
        <button
          className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-hover)]"
          onClick={() => {
            dispatch({ type: "SET_EDIT_JOB", payload: null });
            dispatch({ type: "SET_SHOW_JOB_MODAL", payload: true });
          }}
        >
          <PlusIcon />
          {mob ? "New" : "Post New Job"}
        </button>
      </div>

      <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-4.5`}>
        {jobs.map((j) => {
          const jc = candidates.filter((c) => c.jobId === j.id);
          return (
            <div
              key={j.id}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-5.5 shadow-[var(--shadow-card)] cursor-pointer relative overflow-hidden transition-all duration-200 hover:shadow-md"
              onClick={() => {
                dispatch({ type: "SET_EDIT_JOB", payload: j });
                dispatch({ type: "SET_SHOW_JOB_MODAL", payload: true });
              }}
            >
              {j.status === "Closed" && (
                <div className="absolute top-0 right-0 bg-[var(--color-danger-bg)] text-[var(--color-danger-dark)] px-3 py-0.5 text-[10px] font-bold rounded-bl-[10px]">
                  Closed
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-bold">{j.title}</h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {j.dept} · {j.type}
                  </p>
                </div>
                {j.status !== "Closed" && (
                  <button
                    className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-3 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "SET_EDIT_JOB", payload: j });
                      dispatch({ type: "SET_SHOW_JOB_MODAL", payload: true });
                    }}
                  >
                    <EditIcon /> Edit
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 my-2 text-xs text-[var(--color-text-subtle)]">
                <LocIcon />
                {j.location}
              </div>
              <p className="text-xs text-[var(--color-text-subtle)] leading-relaxed mb-2.5">
                {j.description}
              </p>
              {j.qualifications && (
                <div className="mb-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <ListCheckIcon />
                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">
                      Qualifications
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[var(--color-text-subtle)] leading-relaxed bg-[var(--color-surface-hover)] rounded-lg p-2">
                    {j.qualifications}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-[var(--color-surface-border-light)] pt-2.5">
                <span className="text-xs">
                  <strong className="text-[var(--color-primary)]">{jc.length}</strong>{" "}
                  <span className="text-[var(--color-text-muted)]">applicants</span>
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{j.posted}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Jobs;
