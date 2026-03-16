/**
 * Pipeline page — Kanban board view across all hiring stages.
 * Supports drag-and-drop to move candidates between stages.
 * Route: /pipeline
 */

import { useState, useRef, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { PIPELINE_STAGES, STAGE_COLORS } from "../data/constants";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { updateCandidate } from "../api/candidates";
import type { Stage } from "../data/types";

const Pipeline: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, jobs } = state;

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const dragCandidateId = useRef<number | null>(null);

  const activeJobs = jobs.filter((j) => j.status === "Active" && j.source === "api");
  const filteredCandidates = (
    selectedJobId !== null
      ? candidates.filter((c) => c.job?.id === selectedJobId)
      : candidates
  ).filter((c) => !c.is_pooled);

  const handleDragStart = (candidateId: number) => {
    dragCandidateId.current = candidateId;
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = dragCandidateId.current;
    if (id === null) return;

    const candidate = candidates.find((c) => c.id === id);
    if (!candidate || candidate.stage === targetStage) return;

    try {
      const updated = await updateCandidate(id, { stage: targetStage });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id, updates: updated } });
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to move candidate.", variant: "error" },
      });
    } finally {
      dragCandidateId.current = null;
    }
  };

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
            value={selectedJobId ?? ""}
            onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Jobs</option>
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold"
            style={{
              background: "rgba(31,117,185,0.10)",
              color: "#1F75B9",
              border: "1.5px solid rgba(31,117,185,0.25)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto overflow-y-auto pb-2" style={{ height: "calc(100vh - 220px)" }}>
        {PIPELINE_STAGES.map((stage) => {
          const items = filteredCandidates.filter((c) => c.stage === stage);
          const sc = STAGE_COLORS[stage];
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className={`${mob ? "min-w-[200px]" : "min-w-[200px] flex-1"} transition-all duration-150`}
              onDragOver={(e) => handleDragOver(e, stage as Stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage as Stage)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                <span className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">
                  {stage.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </span>
                {/* Glassmorphism count badge */}
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ml-auto shadow-sm"
                  style={{
                    background: `${sc.dot}28`,
                    color: sc.dot,
                    border: `1.5px solid ${sc.dot}55`,
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    minWidth: "22px",
                    textAlign: "center",
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Drop Zone */}
              <div
                className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] min-h-[60px] transition-all duration-150 p-1"
                style={isOver ? { outline: `2px solid ${sc.dot}`, outlineOffset: "2px", backgroundColor: `${sc.dot}0d` } : {}}
              >
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
                      draggable
                      onDragStart={() => handleDragStart(c.id)}
                      className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-3.5 shadow-[var(--shadow-card)] cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:opacity-60 active:scale-95"
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
                  <div
                    className={`p-6 text-center text-[var(--color-text-placeholder)] text-xs border-2 border-dashed rounded-[var(--radius-md)] transition-colors duration-150 ${
                      isOver ? "border-opacity-60" : ""
                    }`}
                    style={isOver
                      ? { borderColor: sc.dot, color: sc.dot, background: `${sc.dot}0d` }
                      : { borderColor: "#DDE8F0" }
                    }
                  >
                    {isOver ? "Drop here" : "Empty"}
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
