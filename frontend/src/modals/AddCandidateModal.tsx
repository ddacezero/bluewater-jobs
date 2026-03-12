/**
 * Add Candidate Modal — form for creating new candidate entries.
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { RECRUITERS, SOURCES } from "../data/constants";
import type { Candidate } from "../data/types";
import { XIcon } from "../components/icons";

const AddCandidateModal: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { showAddModal, candidates, jobs } = state;
  const roles = [...new Set(candidates.map((c) => c.role))];

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: roles[0] || "",
    source: "Website",
    recruiter: "Joela",
  });

  if (!showAddModal) return null;

  const close = () => dispatch({ type: "SET_SHOW_ADD_MODAL", payload: false });

  const add = () => {
    if (!form.name || !form.email) return;
    const initials = form.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const job = jobs.find((x) => x.title === form.role);

    const candidate: Candidate = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      role: form.role,
      stage: "Applied",
      rating: 3,
      applied: "Mar 8, 2026",
      avatar: initials,
      tags: [],
      source: form.source,
      jobId: job?.id || 1,
      recruiter: form.recruiter,
      notes: "",
      resumeName: "",
      talents: [],
      examResultName: "",
    };

    dispatch({ type: "ADD_CANDIDATE", payload: candidate });
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[480px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex justify-between items-center border-b border-[var(--color-surface-border)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--color-text-heading)]">Add Candidate</h2>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              Fill in the candidate details below
            </p>
          </div>
          <button
            onClick={close}
            className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-bg)] border-none cursor-pointer text-[var(--color-text-muted)] flex rounded-[var(--radius-md)] p-1.5 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Full Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Email <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="jane@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Role
              </label>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Recruiter
              </label>
              <select
                className={inputClass}
                value={form.recruiter}
                onChange={(e) => setForm({ ...form, recruiter: e.target.value })}
              >
                {RECRUITERS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Source
            </label>
            <select
              className={inputClass}
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2.5 pt-1 justify-end border-t border-[var(--color-surface-border)] mt-1">
            <button
              className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors active:scale-[0.98]"
              onClick={add}
            >
              Add Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;
