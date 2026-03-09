/**
 * Candidates page — searchable table/card list of all candidates with filters.
 * Route: /candidates
 */

import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES } from "../data/constants";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { SearchIcon, PlusIcon, PersonIcon } from "../components/icons";

const Candidates: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, search, filterStage, filterRole } = state;

  const roles = [...new Set(candidates.map((c) => c.role))];

  const filtered = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "All" || c.stage === filterStage;
    const matchRole = filterRole === "All" || c.role === filterRole;
    return matchSearch && matchStage && matchRole;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold`}>Candidates</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">{filtered.length} found</p>
        </div>
        <button
          className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-hover)]"
          onClick={() => dispatch({ type: "SET_SHOW_ADD_MODAL", payload: true })}
        >
          <PlusIcon />
          {mob ? "Add" : "Add Candidate"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-[#F1F7FB] border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3.5 py-2 flex-1 max-w-[300px]">
          <SearchIcon />
          <input
            className="border-none outline-none bg-transparent text-sm text-[var(--color-text-primary)] w-full font-[inherit]"
            placeholder="Search..."
            value={search}
            onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
          />
        </div>
        <select
          value={filterStage}
          onChange={(e) => dispatch({ type: "SET_FILTER_STAGE", payload: e.target.value })}
          className="border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] bg-transparent appearance-none pr-6 cursor-pointer"
        >
          <option value="All">All Stages</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {!mob && (
          <select
            value={filterRole}
            onChange={(e) => dispatch({ type: "SET_FILTER_ROLE", payload: e.target.value })}
            className="border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] bg-transparent appearance-none pr-6 cursor-pointer"
          >
            <option value="All">All Roles</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table / Card List */}
      {mob ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-4 shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200"
              onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar initials={c.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)] truncate">{c.role}</div>
                </div>
                <Stars value={c.rating} />
              </div>
              <div className="flex gap-1.5 flex-wrap items-center">
                <Badge stage={c.stage} />
                {c.recruiter && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] font-medium">
                    <PersonIcon />
                    {c.recruiter}
                  </span>
                )}
                <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-2.5 py-0.5 text-[11px] font-semibold">
                  {c.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b-[1.5px] border-[var(--color-surface-border)]">
                {["Candidate", "Role", "Stage", "Recruiter", "Rating", "Source", ""].map((h, i) => (
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
                  onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.avatar} size="md" />
                      <div>
                        <div className="font-semibold text-[13.5px]">{c.name}</div>
                        <div className="text-[11.5px] text-[var(--color-text-muted)]">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12.5px]">{c.role}</td>
                  <td className="px-4 py-3"><Badge stage={c.stage} /></td>
                  <td className="px-4 py-3">
                    {c.recruiter ? (
                      <span className="text-[12.5px] text-[var(--color-primary)] inline-flex items-center gap-1">
                        <PersonIcon />
                        {c.recruiter}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><Stars value={c.rating} /></td>
                  <td className="px-4 py-3">
                    <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-2.5 py-0.5 text-[11px] font-semibold">
                      {c.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-[var(--color-primary)] bg-transparent border-none text-xs font-semibold cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "SELECT_CANDIDATE", payload: c });
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="p-10 text-center text-[var(--color-text-muted)]">
          <p>No candidates found</p>
        </div>
      )}
    </div>
  );
};

export default Candidates;
