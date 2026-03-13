/**
 * Talent Pool page — pooled candidates from closed positions with reactivation.
 * Route: /pool
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { RedoIcon } from "../components/icons";

const TalentPool: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [pFilter, setPFilter] = useState("all");

  const { candidates, jobs } = state;
  const pool = candidates.filter((c) => c.is_pooled);
  const closedJobs = jobs.filter((j) => j.status === "Closed");
  const closedJobTitles = [...new Set(pool.map((c) => c.job?.title ?? "—"))];

  const filtered = pool.filter((c) => {
    return pFilter === "all" || (c.job?.title ?? "—") === pFilter;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
            Talent Pool
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">
            {pool.length} pooled candidates
          </p>
        </div>
      </div>

      {/* Closed Jobs Summary */}
      <div
        className={`grid ${mob ? "grid-cols-1" : `grid-cols-${Math.min(closedJobs.length, 4)}`} gap-5 mb-6`}
      >
        {closedJobs.map((j) => {
          const cnt = pool.filter((c) => c.job?.id === j.id).length;
          const isActive = pFilter === j.title;
          return (
            <div
              key={j.id}
              className={`bg-[var(--color-surface)] rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] border-l-4 border-l-[var(--color-purple)] ${
                isActive ? "border-[var(--color-purple)]" : "border-[var(--color-surface-border)]"
              }`}
              onClick={() => setPFilter(isActive ? "all" : j.title)}
            >
              <h4 className="text-[13.5px] font-bold text-[var(--color-text-heading)]">{j.title}</h4>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Closed {j.closed}</p>
              <span className="text-[28px] font-extrabold text-[var(--color-primary)] mt-2 block leading-none">
                {cnt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <select
          value={pFilter}
          onChange={(e) => setPFilter(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-primary)] appearance-none pr-7 cursor-pointer shadow-[var(--shadow-card)] outline-none"
        >
          <option value="all">All</option>
          {closedJobTitles.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table / Card List */}
      {mob ? (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const initials = (c.application?.name ?? "Unknown")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <div
                key={c.id}
                className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-4 shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all duration-200"
                onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar initials={initials} size="md" variant="pool" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.application?.name ?? "Unknown"}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">{c.job?.title ?? "—"}</div>
                  </div>
                  <Stars value={c.rating} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge stage={c.stage} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-[var(--color-surface-border)]">
                {["Candidate", "Position", "Stage", "Rating", "Pooled", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider bg-[var(--color-surface-bg)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const initials = (c.application?.name ?? "Unknown")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--color-surface-border-light)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors duration-150"
                    onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials} size="md" variant="pool" />
                        <div>
                          <div className="font-semibold text-[13.5px] text-[var(--color-text-heading)]">
                            {c.application?.name ?? "Unknown"}
                          </div>
                          <div className="text-[11.5px] text-[var(--color-text-muted)]">{c.application?.email ?? ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[var(--color-text-subtle)]">
                      {c.job?.title ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge stage={c.stage} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Stars value={c.rating} />
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-[var(--color-text-subtle)]">
                      {c.pooled_at ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="border border-[var(--color-purple)] text-[var(--color-purple)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 bg-transparent cursor-pointer hover:bg-[var(--color-purple-light)] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "SELECT_CANDIDATE", payload: c });
                        }}
                      >
                        <RedoIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TalentPool;
