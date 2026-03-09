/**
 * Pipeline page — Kanban board view across all hiring stages.
 * Route: /pipeline
 */

import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { PIPELINE_STAGES, STAGE_COLORS } from "../data/constants";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { BanIcon } from "../components/icons";

const Pipeline: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates } = state;

  return (
    <div>
      <div className="mb-4">
        <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold`}>Pipeline</h1>
        <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">
          Kanban view of your hiring pipeline
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const items = candidates.filter((c) => c.stage === stage);
          const sc = STAGE_COLORS[stage];

          return (
            <div key={stage} className={`${mob ? "min-w-[200px]" : "min-w-[210px] flex-1"}`}>
              {/* Column Header */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: sc.dot }} />
                <span className="text-[13px] font-bold">
                  {stage.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-3.5 shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{ borderLeft: `3px solid ${sc.dot}` }}
                    onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar initials={c.avatar} size="sm" />
                      <div>
                        <div className="font-semibold text-[12.5px]">{c.name}</div>
                        <div className="text-[10.5px] text-[var(--color-text-muted)]">
                          {c.recruiter || c.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-1">
                      {c.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[9px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <Stars value={c.rating} />
                      {stage === "Applied" && (
                        <button
                          className="bg-[var(--color-warning-bg)] border border-[#FFCC80] rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold text-[#BF360C] cursor-pointer flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: "SET_NQ_CANDIDATE", payload: c });
                          }}
                        >
                          <BanIcon /> Not Qualified
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="p-5 text-center text-[var(--color-text-placeholder)] text-xs border-2 border-dashed border-[#DDE8F0] rounded-[var(--radius-md)]">
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
