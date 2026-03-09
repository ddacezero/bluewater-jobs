/**
 * Reports page — per-job and per-month hiring analytics with charts and CSV export.
 * Route: /reports
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS, REPORT_MONTHS } from "../data/constants";
import type { Job } from "../data/types";
import { DownloadIcon } from "../components/icons";

const Reports: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [repJob, setRepJob] = useState("all");
  const [repMonth, setRepMonth] = useState("all");

  const { candidates, pool, jobs, fillTags } = state;

  const jobsToReport =
    repJob === "all" ? jobs : jobs.filter((j) => j.id === Number(repJob));

  const daysBetween = (d1: string, d2?: string | null) => {
    const a = new Date(d1);
    const b = d2 ? new Date(d2) : new Date("Mar 8, 2026");
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getStats = (job: Job, month: string) => {
    let all = [
      ...candidates.filter((c) => c.jobId === job.id),
      ...pool.filter((p) => p.jobId === job.id),
    ];
    if (month !== "all") {
      all = all.filter((c) => {
        const d = ("applied" in c ? c.applied : "") || ("pooledDate" in c ? (c as { pooledDate?: string }).pooledDate : "") || "";
        return d.includes(month.split(" ")[0]);
      });
    }
    const sc: Record<string, number> = {};
    STAGES.forEach((s) => {
      sc[s] = all.filter((c) => ("stage" in c ? c.stage : (c as { lastStage?: string }).lastStage) === s).length;
    });
    const t = all.length;
    const hr = t > 0 ? ((sc["Hired"] / t) * 100).toFixed(0) : "0";
    const pr = t > 0 ? (((t - sc["Rejected"]) / t) * 100).toFixed(0) : "0";
    const daysOpen = daysBetween(job.posted, job.status === "Closed" ? job.closed : null);
    const daysClosed = job.status === "Closed" && job.closed ? daysBetween(job.closed, "Mar 8, 2026") : null;
    return { sc, total: t, hr, pr, all, daysOpen, daysClosed };
  };

  const overAll = () => {
    let ta = 0, th = 0, tr = 0;
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
    v, label, color, size = mob ? 70 : 85,
  }) => {
    const p = Math.min(Math.max(Number(v), 0), 100);
    const r = (size - 12) / 2;
    const ci = 2 * Math.PI * r;
    const o = ci - (p / 100) * ci;
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF0F4" strokeWidth="7" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={ci} strokeDashoffset={o} strokeLinecap="round" />
        </svg>
        <span className={`${mob ? "text-sm" : "text-lg"} font-extrabold relative`} style={{ marginTop: -size / 2 - 8 }}>{p}%</span>
        <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] relative" style={{ marginTop: size / 2 - 24 }}>{label}</span>
      </div>
    );
  };

  const exportCSV = () => {
    let csv = "Job Title,Department,Location,Status,Posted,Days Open,Fill Difficulty,Total Applicants," + STAGES.join(",") + ",Hire Rate %,Pass Rate %\n";
    jobsToReport.forEach((job) => {
      const s = getStats(job, repMonth);
      csv += `"${job.title}","${job.dept}","${job.location}","${job.status}","${job.posted}",${s.daysOpen},"${fillTags[job.id] || "—"}",${s.total},` + STAGES.map((st) => s.sc[st]).join(",") + `,${s.hr},${s.pr}\n`;
    });
    csv += "\n\nCandidate Details\nName,Email,Role,Stage,Rating,Applied,Recruiter,Source\n";
    jobsToReport.forEach((job) => {
      [...candidates.filter((c) => c.jobId === job.id), ...pool.filter((p) => p.jobId === job.id)].forEach((c) => {
        const stage = "stage" in c ? c.stage : (c as { lastStage?: string }).lastStage || "";
        const applied = "applied" in c ? c.applied : (c as { pooledDate?: string }).pooledDate || "";
        const recruiter = "recruiter" in c ? c.recruiter : "";
        const role = "role" in c ? c.role : (c as { closedJob?: string }).closedJob || "";
        csv += `"${c.name}","${c.email}","${role}","${stage}",${c.rating},"${applied}","${recruiter}","${c.source}"\n`;
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2.5">
        <div>
          <h1 className={`${mob ? "text-xl" : "text-2xl"} font-bold`}>Reports</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-[13px]">Analytics per job & month</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={repMonth}
            onChange={(e) => setRepMonth(e.target.value)}
            className="border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent appearance-none pr-6 cursor-pointer"
          >
            <option value="all">All Months</option>
            {REPORT_MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={repJob}
            onChange={(e) => setRepJob(e.target.value)}
            className="border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent appearance-none pr-6 cursor-pointer"
          >
            <option value="all">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button
            className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 shadow-[var(--shadow-btn)] cursor-pointer"
            onClick={exportCSV}
          >
            <DownloadIcon />
            {mob ? "CSV" : "Export"}
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      {repJob === "all" && (
        <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-4"} gap-4.5 mb-4.5`}>
          {[
            { l: "Applicants", v: ov.ta, a: "#1F75B9" },
            { l: "Hired", v: ov.th, a: "#00897B" },
            { l: "Rejected", v: ov.tr, a: "#EF5350" },
            { l: "Hire Rate", v: ov.hr + "%", a: "#8E24AA" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] p-5.5 shadow-[var(--shadow-card)]"
              style={{ borderTop: `3px solid ${s.a}` }}
            >
              <p className="text-[11px] text-[var(--color-text-secondary)]">{s.l}</p>
              <span className={`${mob ? "text-[22px]" : "text-[28px]"} font-bold mt-1 block`}>{s.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-job Reports */}
      <div className="flex flex-col gap-4.5">
        {jobsToReport.map((job) => {
          const s = getStats(job, repMonth);
          const mx = Math.max(...STAGES.map((st) => s.sc[st]), 1);
          const ft = fillTags[job.id];

          return (
            <div key={job.id} className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
              {/* Job Header */}
              <div className={`${mob ? "px-4 py-3.5" : "px-6 py-4"} border-b border-[#EDF0F4] bg-[#FAFCFE]`}>
                <div className="flex justify-between items-start flex-wrap gap-2.5">
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`${mob ? "text-sm" : "text-base"} font-bold`}>{job.title}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: job.status === "Active" ? "#E8F5E9" : "#FFEBEE",
                          color: job.status === "Active" ? "#2E7D32" : "#C62828",
                        }}
                      >
                        {job.status}
                      </span>
                      {ft && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: ftC[ft].bg, color: ftC[ft].t, border: `1px solid ${ftC[ft].b}` }}
                        >
                          {ft}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{job.dept} · {job.location}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(["Hard to Fill", "Easy to Fill"] as const).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => dispatch({ type: "TOGGLE_FILL_TAG", payload: { jobId: job.id, tag } })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer"
                        style={{
                          border: `1.5px solid ${ft === tag ? ftC[tag].b : "#D9E8F2"}`,
                          background: ft === tag ? ftC[tag].bg : "#fff",
                          color: ft === tag ? ftC[tag].t : "#7c8da5",
                        }}
                      >
                        {ft === tag ? "✓ " : ""}{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta bar */}
              <div className={`${mob ? "px-4 py-2.5" : "px-6 py-2"} bg-[var(--color-surface-hover)] border-b border-[#EDF0F4] flex gap-3 md:gap-6 flex-wrap text-xs text-[var(--color-text-subtle)]`}>
                <span>Posted: <strong className="text-[var(--color-text-heading)]">{job.posted}</strong></span>
                <span>
                  {job.status === "Active" ? "Open" : "Time to Fill"}:{" "}
                  <strong style={{ color: s.daysOpen > 60 ? "#C62828" : s.daysOpen > 30 ? "#E65100" : "#2E7D32" }}>
                    {s.daysOpen}d
                  </strong>
                </span>
                {job.status === "Closed" && <span>Closed: <strong>{job.closed}</strong></span>}
                {s.daysClosed !== null && <span>Since closed: <strong className="text-[var(--color-text-secondary)]">{s.daysClosed}d</strong></span>}
                <span className="ml-auto font-bold text-[var(--color-primary)] text-sm">{s.total} applicants</span>
              </div>

              {/* Charts */}
              <div className={`${mob ? "p-4" : "p-5 px-6"} grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-4 md:gap-6`}>
                <div>
                  <h4 className="mb-3 text-[13px] font-bold">Stage Breakdown</h4>
                  <div className={`flex gap-0.5 items-end ${mob ? "h-[100px]" : "h-[130px]"} overflow-x-auto`}>
                    {STAGES.map((st) => {
                      const val = s.sc[st];
                      const h = Math.max((val / mx) * (mob ? 80 : 110), 3);
                      return (
                        <div key={st} className={`flex-1 ${mob ? "min-w-[22px]" : ""} flex flex-col items-center gap-0.5`}>
                          <span className={`${mob ? "text-[10px]" : "text-xs"} font-bold`} style={{ color: STAGE_COLORS[st].text }}>{val}</span>
                          <div
                            className="w-full rounded-t-[5px] rounded-b-[2px]"
                            style={{ height: `${h}px`, background: `linear-gradient(180deg, ${STAGE_COLORS[st].dot}, ${STAGE_COLORS[st].bg})` }}
                          />
                          <span className={`${mob ? "text-[6px]" : "text-[8px]"} font-semibold text-[var(--color-text-secondary)] text-center leading-tight`}>
                            {st.replace("Interview", "Int.").replace("Departmental", "D.")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-[13px] font-bold">Rates</h4>
                  <div className={`flex justify-center ${mob ? "gap-5" : "gap-7"} mb-3.5`}>
                    <Donut v={s.hr} label="Hire" color="#00897B" />
                    <Donut v={s.pr} label="Pass" color="#1F75B9" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {STAGES.map((st) => (
                      <div key={st} className="flex items-center gap-1.5 py-1 px-2 bg-[var(--color-surface-bg)] rounded-[var(--radius-sm)]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_COLORS[st].dot }} />
                        <span className="text-[10px] text-[var(--color-text-subtle)] flex-1">
                          {st.length > 12 ? st.slice(0, 10) + "…" : st}
                        </span>
                        <span className="text-xs font-bold">{s.sc[st]}</span>
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
