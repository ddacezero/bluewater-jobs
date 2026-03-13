/**
 * Pipeline page — Kanban board view across all hiring stages.
 * Route: /pipeline
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { PIPELINE_STAGES, STAGE_COLORS } from "../data/constants";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";

const Pipeline: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, jobs } = state;

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const activeJobs = jobs.filter((j) => j.status === "Active" && j.source === "api");
  const effectiveJobId = selectedJobId ?? activeJobs[0]?.id ?? null;
  const filteredCandidates = effectiveJobId
    ? candidates.filter((c) => c.job?.id === effectiveJobId)
    : candidates;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
          Pipeline
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">
          Kanban view of your hiring pipeline
        </p>
      </div>

      {/* Job Selector */}
      {activeJobs.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-[12px] font-semibold text-[var(--color-text-secondary)] shrink-0">
            Job:
          </label>
          <select
            className="text-[13px] px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none cursor-pointer focus:border-[var(--color-primary)]"
            value={effectiveJobId ?? ""}
            onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
          >
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <span className="text-[12px] text-[var(--color-text-muted)]">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_STAGES.map((stage) => {
          const items = filteredCandidates.filter((c) => c.stage === stage);
          const sc = STAGE_COLORS[stage];

          return (
            <div key={stage} className={`${mob ? "min-w-[200px]" : "min-w-[200px] flex-1"}`}>
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                <span className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">
                  {stage.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0 ml-auto"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {items.map((c) => {
                  const initials = (c.application?.name ?? "Unknown")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={c.id}
                      className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-3.5 shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
                      style={{ borderLeft: `3px solid ${sc.dot}` }}
                      onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar initials={initials} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-[12.5px] text-[var(--color-text-heading)] truncate">
                            {c.application?.name ?? "Unknown"}
                          </div>
                          <div className="text-[10.5px] text-[var(--color-text-muted)] truncate">
                            {c.recruiter?.name ?? "Unassigned"} — {c.job?.title ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Stars value={c.rating} />
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="p-6 text-center text-[var(--color-text-placeholder)] text-xs border-2 border-dashed border-[#DDE8F0] rounded-[var(--radius-md)]">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
