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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,30,50,0.45)] backdrop-blur-[4px]" style={mob ? { alignItems: "flex-end" } : {}} onClick={close}>
      <div className={`${mob ? "w-full rounded-t-[18px]" : "w-[460px] rounded-[18px]"} max-h-[92vh] bg-white overflow-auto shadow-[var(--shadow-modal)]`} onClick={(e) => e.stopPropagation()}>
        <div className="px-5.5 pt-5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Add Candidate</h2>
          <button onClick={close} className="bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex"><XIcon /></button>
        </div>
        <div className="px-5.5 pt-4 pb-5.5 flex flex-col gap-3">
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Full Name *</label>
              <input className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Email *</label>
              <input className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="jane@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Role</label>
              <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Recruiter</label>
              <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.recruiter} onChange={(e) => setForm({ ...form, recruiter: e.target.value })}>
                {RECRUITERS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Source</label>
            <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2.5 mt-1 justify-end">
            <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold bg-transparent cursor-pointer" onClick={close}>Cancel</button>
            <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer" onClick={add}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;
