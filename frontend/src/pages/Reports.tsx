/**
 * Reports page — per-job and per-month hiring analytics with charts and CSV export.
 * Route: /reports
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS, REPORT_MONTHS } from "../data/constants";
import type { Job, Candidate } from "../data/types";
import { DownloadIcon } from "../components/icons";

const Reports: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [repJob, setRepJob] = useState("all");
  const [repMonth, setRepMonth] = useState("all");

  const { candidates, jobs, fillTags } = state;
  const pool = candidates.filter((c) => c.is_pooled);

  const jobsToReport =
    repJob === "all" ? jobs : jobs.filter((j) => j.id === Number(repJob));

  const daysBetween = (d1: string, d2?: string | null) => {
    const a = new Date(d1);
    const b = d2 ? new Date(d2) : new Date("Mar 8, 2026");
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getStats = (job: Job, month: string) => {
    let all = [
      ...candidates.filter((c) => c.job.id === job.id),
      ...pool.filter((p: Candidate) => p.job.id === job.id),
    ];
    if (month !== "all") {
      all = all.filter((c) => {
        const d = (c.is_pooled ? c.pooled_at : c.created_at) ?? "";
        return d.includes(month.split(" ")[0]);
      });
    }
    const sc: Record<string, number> = {};
    STAGES.forEach((s) => {
      sc[s] = all.filter((c) => c.stage === s).length;
    });
    const t = all.length;
    const hr = t > 0 ? ((sc["Hired"] / t) * 100).toFixed(0) : "0";
    const pr = t > 0 ? (((t - sc["Rejected"]) / t) * 100).toFixed(0) : "0";
    const daysOpen = daysBetween(job.posted, job.status === "Closed" ? job.closed : null);
    const daysClosed =
      job.status === "Closed" && job.closed ? daysBetween(job.closed, "Mar 8, 2026") : null;
    return { sc, total: t, hr, pr, all, daysOpen, daysClosed };
  };

  const overAll = () => {
    let ta = 0,
      th = 0,
      tr = 0;
    jobs.forEach((j) => {
      const s = getStats(j, repMonth);
      ta += s.total;
      th += s.sc["Hired"];
      tr += s.sc["Rejected"];
    });
    return { ta, th, tr, hr: ta > 0 ? ((th / ta) * 100).toFixed(0) : "0" };
  };
  const ov = overAll();

  const Donut: FC<{ v: string; label: string; color: string; size?: number }> = ({
    v,
    label,
    color,
    size = mob ? 74 : 90,
  }) => {
    const p = Math.min(Math.max(Number(v), 0), 100);
    const r = (size - 14) / 2;
    const ci = 2 * Math.PI * r;
    const o = ci - (p / 100) * ci;
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF0F4" strokeWidth="8" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={ci}
            strokeDashoffset={o}
            strokeLinecap="round"
          />
        </svg>
        <span
          className={`${mob ? "text-sm" : "text-[17px]"} font-extrabold relative`}
          style={{ marginTop: -size / 2 - 10 }}
        >
          {p}%
        </span>
        <span
          className="text-[10px] font-semibold text-[var(--color-text-secondary)] relative"
          style={{ marginTop: size / 2 - 26 }}
        >
          {label}
        </span>
      </div>
    );
  };

  const exportCSV = () => {
    let csv =
      "Job Title,Department,Location,Status,Posted,Days Open,Fill Difficulty,Total Applicants," +
      STAGES.join(",") +
      ",Hire Rate %,Pass Rate %\n";
    jobsToReport.forEach((job) => {
      const s = getStats(job, repMonth);
      csv +=
        `"${job.title}","${job.dept}","${job.location}","${job.status}","${job.posted}",${s.daysOpen},"${
          fillTags[job.id] || "—"
        }",${s.total},` +
        STAGES.map((st) => s.sc[st]).join(",") +
        `,${s.hr},${s.pr}\n`;
    });
    csv += "\n\nCandidate Details\nName,Email,Role,Stage,Rating,Applied,Recruiter,Source\n";
    jobsToReport.forEach((job) => {
      [
        ...candidates.filter((c) => c.job.id === job.id),
        ...pool.filter((p: Candidate) => p.job.id === job.id),
      ].forEach((c) => {
        const stage = c.stage;
        const applied = c.is_pooled ? (c.pooled_at ?? "") : (c.created_at ?? "");
        const recruiter = c.recruiter ? c.recruiter.name : "";
        const role = c.job.title;
        csv += `"${c.application.name}","${c.application.email}","${role}","${stage}",${c.rating},"${applied}","${recruiter}","${c.application.source}"\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Bluewater_Report_${repMonth === "all" ? "All" : repMonth.replace(" ", "_")}.csv`;
    a.click();
  };

  const ftC: Record<string, { bg: string; t: string; b: string }> = {
    "Hard to Fill": { bg: "#FFEBEE", t: "#C62828", b: "#EF9A9A" },
    "Easy to Fill": { bg: "#E8F5E9", t: "#2E7D32", b: "#A5D6A7" },
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold text-[var(--color-text-heading)]`}>
            Reports
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">
            Analytics per job &amp; month
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <select
            value={repMonth}
            onChange={(e) => setRepMonth(e.target.value)}
            className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-primary)] appearance-none pr-7 cursor-pointer shadow-[var(--shadow-card)] outline-none"
          >
            <option value="all">All Months</option>
            {REPORT_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={repJob}
            onChange={(e) => setRepJob(e.target.value)}
            className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-primary)] appearance-none pr-7 cursor-pointer shadow-[var(--shadow-card)] outline-none"
          >
            <option value="all">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button
            className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4 py-2.5 text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
            onClick={exportCSV}
          >
            <DownloadIcon />
            {mob ? "CSV" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      {repJob === "all" && (
        <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-4"} gap-5 mb-6`}>
          {[
            { l: "Total Applicants", v: ov.ta, a: "#1F75B9" },
            { l: "Hired", v: ov.th, a: "#00897B" },
            { l: "Rejected", v: ov.tr, a: "#EF5350" },
            { l: "Hire Rate", v: ov.hr + "%", a: "#8E24AA" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] px-5 py-5 shadow-[var(--shadow-card)]"
              style={{ borderTop: `3px solid ${s.a}` }}
            >
              <p className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-2.5">{s.l}</p>
              <span className={`${mob ? "text-[26px]" : "text-[34px]"} font-bold text-[var(--color-text-heading)] block leading-none`}>
                {s.v}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Per-job Reports */}
      <div className="flex flex-col gap-6">
        {jobsToReport.map((job) => {
          const s = getStats(job, repMonth);
          const mx = Math.max(...STAGES.map((st) => s.sc[st]), 1);
          const ft = fillTags[job.id];

          return (
            <div
              key={job.id}
              className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden"
            >
              {/* Job Header */}
              <div
                className={`${mob ? "px-5 py-4" : "px-6 py-4"} border-b border-[var(--color-surface-border)] bg-[var(--color-surface-bg)]`}
              >
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`${mob ? "text-sm" : "text-[15px]"} font-bold text-[var(--color-text-heading)]`}>
                        {job.title}
                      </h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: job.status === "Active" ? "#E8F5E9" : "#FFEBEE",
                          color: job.status === "Active" ? "#2E7D32" : "#C62828",
                        }}
                      >
                        {job.status}
                      </span>
                      {ft && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: ftC[ft].bg,
                            color: ftC[ft].t,
                            border: `1px solid ${ftC[ft].b}`,
                          }}
                        >
                          {ft}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                      {job.dept} · {job.location}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["Hard to Fill", "Easy to Fill"] as const).map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          dispatch({ type: "TOGGLE_FILL_TAG", payload: { jobId: job.id, tag } })
                        }
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-colors"
                        style={{
                          border: `1.5px solid ${ft === tag ? ftC[tag].b : "var(--color-surface-muted)"}`,
                          background: ft === tag ? ftC[tag].bg : "var(--color-surface)",
                          color: ft === tag ? ftC[tag].t : "var(--color-text-secondary)",
                        }}
                      >
                        {ft === tag ? "✓ " : ""}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta bar */}
              <div
                className={`${mob ? "px-5 py-2.5" : "px-6 py-2.5"} bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)] flex gap-4 md:gap-6 flex-wrap text-[12.5px] text-[var(--color-text-subtle)]`}
              >
                <span>
                  Posted:{" "}
                  <strong className="text-[var(--color-text-heading)]">{job.posted}</strong>
                </span>
                <span>
                  {job.status === "Active" ? "Open" : "Time to Fill"}:{" "}
                  <strong
                    style={{
                      color:
                        s.daysOpen > 60
                          ? "#C62828"
                          : s.daysOpen > 30
                          ? "#E65100"
                          : "#2E7D32",
                    }}
                  >
                    {s.daysOpen}d
                  </strong>
                </span>
                {job.status === "Closed" && (
                  <span>
                    Closed: <strong>{job.closed}</strong>
                  </span>
                )}
                {s.daysClosed !== null && (
                  <span>
                    Since closed:{" "}
                    <strong className="text-[var(--color-text-secondary)]">{s.daysClosed}d</strong>
                  </span>
                )}
                <span className="ml-auto font-bold text-[var(--color-primary)] text-[13px]">
                  {s.total} applicants
                </span>
              </div>

              {/* Charts */}
              <div
                className={`${mob ? "p-5" : "p-6"} grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-6`}
              >
                <div>
                  <h4 className="mb-4 text-[13.5px] font-bold text-[var(--color-text-heading)]">
                    Stage Breakdown
                  </h4>
                  <div
                    className={`flex gap-1 items-end ${mob ? "h-[110px]" : "h-[140px]"} overflow-x-auto`}
                  >
                    {STAGES.map((st) => {
                      const val = s.sc[st];
                      const h = Math.max((val / mx) * (mob ? 85 : 115), 3);
                      return (
                        <div
                          key={st}
                          className={`flex-1 ${mob ? "min-w-[22px]" : ""} flex flex-col items-center gap-0.5`}
                        >
                          <span
                            className={`${mob ? "text-[10px]" : "text-xs"} font-bold`}
                            style={{ color: STAGE_COLORS[st].text }}
                          >
                            {val}
                          </span>
                          <div
                            className="w-full rounded-t-[5px] rounded-b-[2px]"
                            style={{
                              height: `${h}px`,
                              background: `linear-gradient(180deg, ${STAGE_COLORS[st].dot}, ${STAGE_COLORS[st].bg})`,
                            }}
                          />
                          <span
                            className={`${mob ? "text-[6px]" : "text-[8px]"} font-semibold text-[var(--color-text-secondary)] text-center leading-tight`}
                          >
                            {st.replace("Interview", "Int.").replace("Departmental", "D.")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="mb-4 text-[13.5px] font-bold text-[var(--color-text-heading)]">
                    Rates
                  </h4>
                  <div className={`flex justify-center ${mob ? "gap-6" : "gap-8"} mb-4`}>
                    <Donut v={s.hr} label="Hire Rate" color="#00897B" />
                    <Donut v={s.pr} label="Pass Rate" color="#1F75B9" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STAGES.map((st) => (
                      <div
                        key={st}
                        className="flex items-center gap-1.5 py-1.5 px-2.5 bg-[var(--color-surface-bg)] rounded-[var(--radius-sm)]"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: STAGE_COLORS[st].dot }}
                        />
                        <span className="text-[10px] text-[var(--color-text-subtle)] flex-1 truncate">
                          {st.length > 12 ? st.slice(0, 10) + "…" : st}
                        </span>
                        <span className="text-[12px] font-bold">{s.sc[st]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
