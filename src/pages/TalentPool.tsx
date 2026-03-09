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
import { SearchIcon, RedoIcon } from "../components/icons";

const TalentPool: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [pFilter, setPFilter] = useState("all");
  const [pSearch, setPSearch] = useState("");

  const { pool, jobs } = state;
  const closedJobs = jobs.filter((j) => j.status === "Closed");
  const closedJobTitles = [...new Set(pool.map((p) => p.closedJob))];

  const filtered = pool.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(pSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(pSearch.toLowerCase()));
    const matchJob = pFilter === "all" || p.closedJob === pFilter;
    return matchSearch && matchJob;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold`}>Talent Pool</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">{pool.length} pooled candidates</p>
        </div>
      </div>

      {/* Closed Jobs Summary */}
      <div className={`grid ${mob ? "grid-cols-1" : `grid-cols-${closedJobs.length}`} gap-4.5 mb-4`}>
        {closedJobs.map((j) => {
          const cnt = pool.filter((p) => p.jobId === j.id).length;
          return (
            <div
              key={j.id}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-5.5 shadow-[var(--shadow-card)] cursor-pointer border-l-4 border-l-[var(--color-purple)]"
              onClick={() => setPFilter(pFilter === j.title ? "all" : j.title)}
            >
              <h4 className="text-sm font-bold">{j.title}</h4>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Closed {j.closed}</p>
              <span className="text-xl font-extrabold text-[var(--color-primary)] mt-2 block">{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3.5 flex-wrap">
        <div className="flex items-center gap-2 bg-[#F1F7FB] border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3.5 py-2 flex-1 max-w-[300px]">
          <SearchIcon />
          <input
            className="border-none outline-none bg-transparent text-sm text-[var(--color-text-primary)] w-full font-[inherit]"
            placeholder="Search..."
            value={pSearch}
            onChange={(e) => setPSearch(e.target.value)}
          />
        </div>
        <select
          value={pFilter}
          onChange={(e) => setPFilter(e.target.value)}
          className="border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent appearance-none pr-6 cursor-pointer"
        >
          <option value="all">All</option>
          {closedJobTitles.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table / Card List */}
      {mob ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-4 shadow-[var(--shadow-card)] cursor-pointer"
              onClick={() => dispatch({ type: "SELECT_POOL_CANDIDATE", payload: c })}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar initials={c.avatar} size="md" variant="pool" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{c.closedJob}</div>
                </div>
                <Stars value={c.rating} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Badge stage={c.lastStage} />
                {c.tags.slice(0, 2).map((t) => (
                  <span key={t} className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b-[1.5px] border-[var(--color-surface-border)]">
                {["Candidate", "Position", "Stage", "Rating", "Pooled", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--color-surface-border-light)] cursor-pointer hover:bg-[var(--color-surface-bg)]"
                  onClick={() => dispatch({ type: "SELECT_POOL_CANDIDATE", payload: c })}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.avatar} size="md" variant="pool" />
                      <div>
                        <div className="font-semibold text-[13.5px]">{c.name}</div>
                        <div className="text-[11.5px] text-[var(--color-text-muted)]">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px]">{c.closedJob}</td>
                  <td className="px-4 py-3"><Badge stage={c.lastStage} /></td>
                  <td className="px-4 py-3"><Stars value={c.rating} /></td>
                  <td className="px-4 py-3 text-[12.5px] text-[var(--color-text-subtle)]">{c.pooledDate}</td>
                  <td className="px-4 py-3">
                    <button
                      className="border-[1.5px] border-[var(--color-purple)] text-[var(--color-purple)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "SELECT_POOL_CANDIDATE", payload: c });
                      }}
                    >
                      <RedoIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TalentPool;
