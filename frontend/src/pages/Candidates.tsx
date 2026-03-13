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
import { PlusIcon, PersonIcon } from "../components/icons";

const Candidates: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { candidates, filterStage, filterRole } = state;

  const roles = [...new Set(candidates.map((c) => c.job?.title ?? "—"))];

  const filtered = candidates.filter((c) => {
    const matchStage = filterStage === "All" || c.stage === filterStage;
    const matchRole = filterRole === "All" || (c.job?.title ?? "—") === filterRole;
    return matchStage && matchRole;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
            Candidates
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">
            {filtered.length} found
          </p>
        </div>
        <button
          className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
          onClick={() => dispatch({ type: "SET_SHOW_ADD_MODAL", payload: true })}
        >
          <PlusIcon />
          {mob ? "Add" : "Add Candidate"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <select
          value={filterStage}
          onChange={(e) => dispatch({ type: "SET_FILTER_STAGE", payload: e.target.value })}
          className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-primary)] appearance-none pr-7 cursor-pointer shadow-[var(--shadow-card)] outline-none"
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
            className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-primary)] appearance-none pr-7 cursor-pointer shadow-[var(--shadow-card)] outline-none"
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
                className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-4 shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
                onClick={() => dispatch({ type: "SELECT_CANDIDATE", payload: c })}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <Avatar initials={initials} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.application?.name ?? "Unknown"}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">{c.job?.title ?? "—"}</div>
                  </div>
                  <Stars value={c.rating} />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge stage={c.stage} />
                  {c.recruiter && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] font-medium">
                      <PersonIcon />
                      {c.recruiter.name}
                    </span>
                  )}
                  <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-2.5 py-0.5 text-[11px] font-semibold">
                    {c.application?.source ?? "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-[var(--color-surface-border)]">
                {["Candidate", "Role", "Stage", "Recruiter", "Rating", "Source", ""].map((h, i) => (
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
                        <Avatar initials={initials} size="md" />
                        <div>
                          <div className="font-semibold text-[13.5px] text-[var(--color-text-heading)]">
                            {c.application?.name ?? "Unknown"}
                          </div>
                          <div className="text-[11.5px] text-[var(--color-text-muted)]">{c.application?.email ?? ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[var(--color-text-subtle)]">{c.job?.title ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge stage={c.stage} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.recruiter ? (
                        <span className="text-[13px] text-[var(--color-primary)] inline-flex items-center gap-1.5">
                          <PersonIcon />
                          {c.recruiter.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Stars value={c.rating} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-semibold">
                        {c.application?.source ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="text-[var(--color-primary)] bg-transparent border-none text-[13px] font-semibold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "SELECT_CANDIDATE", payload: c });
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="p-12 text-center text-[var(--color-text-muted)]">
          <p>No candidates found</p>
        </div>
      )}
    </div>
  );
};

export default Candidates;
