/**
 * Dashboard page — hiring overview with stats, pipeline chart, and recent activity.
 * Route: /
 */

import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { PIPELINE_STAGES, STAGE_COLORS } from "../data/constants";
import { PlusIcon, UpIcon } from "../components/icons";
import type { Candidate } from "../data/types";

const Dashboard: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, jobs } = state;
  const pool = candidates.filter((c) => c.is_pooled);
  const activeJobs = jobs.filter((j) => j.status === "Active");
  const stageCount = (s: string) => candidates.filter((c) => c.stage === s).length;

  const stats = [
    { label: "Total Candidates", value: candidates.length, accent: "#1F75B9", change: "+12%" },
    { label: "Active Jobs", value: activeJobs.length, accent: "#43A047", change: "+2" },
    {
      label: "In Interviews",
      value: candidates.filter((c) =>
        ["Initial Interview", "Departmental Interview", "Final Interview"].includes(c.stage)
      ).length,
      accent: "#FB8C00",
      change: "+5",
    },
    {
      label: "Talent Pool",
      value: pool.length,
      accent: "#8E24AA",
      change: `${pool.filter((p: Candidate) => p.rating >= 4).length} top`,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-7 flex-wrap gap-3">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
            Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">Your hiring overview</p>
        </div>
        <button
          className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
          onClick={() => dispatch({ type: "SET_SHOW_ADD_MODAL", payload: true })}
        >
          <PlusIcon />
          {mob ? "Add" : "Add Candidate"}
        </button>
      </div>

      {/* Stat Cards — always 4 columns on desktop, 2 on mobile */}
      <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-4"} gap-5 mb-6`}>
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] px-5 py-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <p className="text-[12.5px] font-medium text-[var(--color-text-secondary)] mb-3">{s.label}</p>
            <div className="flex items-end justify-between">
              <span className={`${mob ? "text-[26px]" : "text-[36px]"} font-bold leading-none text-[var(--color-text-heading)]`}>
                {s.value}
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-success)] flex items-center gap-0.5 mb-1">
                <UpIcon />
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-5`}>
        {/* Pipeline Chart */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-5 text-[15px] font-bold text-[var(--color-text-heading)]">Hiring Pipeline</h3>
          <div className={`flex gap-2 items-end ${mob ? "h-[140px]" : "h-[200px]"}`}>
            {PIPELINE_STAGES.map((s) => {
              const count = stageCount(s);
              const maxCount = Math.max(...PIPELINE_STAGES.map((x) => stageCount(x)), 1);
              const h = Math.max((count / maxCount) * (mob ? 110 : 165), 6);
              const sc = STAGE_COLORS[s];
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                  <span
                    className={`${mob ? "text-xs" : "text-[14px]"} font-bold`}
                    style={{ color: sc.text }}
                  >
                    {count}
                  </span>
                  <div
                    className="w-full rounded-t-[6px] rounded-b-[3px] transition-[height] duration-600"
                    style={{
                      height: `${h}px`,
                      background: `linear-gradient(180deg, ${sc.dot}, ${sc.bg})`,
                    }}
                  />
                  <span
                    className={`${mob ? "text-[7px]" : "text-[10px]"} font-semibold text-[var(--color-text-secondary)] text-center leading-tight`}
                  >
                    {s.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-5 text-[15px] font-bold text-[var(--color-text-heading)]">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[
              { t: "Anna Villanueva moved to Final Interview for Chef de Partie", tm: "2h ago", c: "#7E57C2" },
              { t: "New application from Jason Lee for Housekeeping TL", tm: "5h ago", c: "#1F75B9" },
              { t: "Jun Reyes received a Job Offer — Plumbing Supervisor", tm: "1d ago", c: "#8E24AA" },
              { t: "Miguel Garcia was hired as Carpenter", tm: "2d ago", c: "#00897B" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: a.c }}
                />
                <div>
                  <p className="text-[13px] font-medium leading-relaxed text-[var(--color-text-primary)]">
                    {a.t}
                  </p>
                  <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{a.tm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
