/**
 * Job Modal — create, edit, or delete job postings.
 */

import { useState, useEffect, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { LOCATIONS, JOB_TYPES } from "../data/constants";
import type { Job } from "../data/types";
import { XIcon } from "../components/icons";

const JobModal: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const { showJobModal, editJob } = state;
  const isEdit = !!editJob;

  const emptyForm: Omit<Job, "id" | "posted" | "closed"> = {
    title: "",
    dept: "",
    location: LOCATIONS[0],
    type: "Full-time",
    status: "Active",
    description: "",
    qualifications: "",
  };

  const [form, setForm] = useState(isEdit && editJob ? { ...editJob } : emptyForm);

  // Sync form when editJob changes
  useEffect(() => {
    if (editJob) {
      setForm({ ...editJob });
    } else {
      setForm(emptyForm);
    }
  }, [editJob]);

  if (!showJobModal) return null;

  const close = () => {
    dispatch({ type: "SET_SHOW_JOB_MODAL", payload: false });
    dispatch({ type: "SET_EDIT_JOB", payload: null });
  };

  const save = () => {
    if (!form.title) return;
    if (isEdit && editJob) {
      dispatch({ type: "UPDATE_JOB", payload: { ...editJob, ...form } as Job });
    } else {
      const newJob: Job = {
        ...form,
        id: Date.now(),
        posted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: form.status as Job["status"],
      };
      dispatch({ type: "ADD_JOB", payload: newJob });
    }
  };

  const del = () => {
    if (editJob) {
      dispatch({ type: "DELETE_JOB", payload: editJob.id });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,30,50,0.45)] backdrop-blur-[4px]" style={mob ? { alignItems: "flex-end" } : {}} onClick={close}>
      <div className={`${mob ? "w-full rounded-t-[18px]" : "w-[500px] rounded-[18px]"} max-h-[92vh] bg-white overflow-auto shadow-[var(--shadow-modal)]`} onClick={(e) => e.stopPropagation()}>
        <div className="px-5.5 pt-5 flex justify-between items-center">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Job" : "Post New Job"}</h2>
          <button onClick={close} className="bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex"><XIcon /></button>
        </div>
        <div className="px-5.5 pt-4 pb-5.5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Job Title *</label>
            <input className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="e.g. Resort Manager" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Department</label>
              <input className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="e.g. Operations" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Location</label>
              <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Type</label>
              <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Status</label>
              <select className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Job["status"] })}>
                {["Active", "Closed"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Description</label>
            <textarea className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit] resize-y min-h-[70px]" rows={3} placeholder="Describe the role..." value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-subtle)] block mb-1">Qualifications</label>
            <textarea className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit] resize-y min-h-[70px]" rows={3} placeholder="List required qualifications..." value={form.qualifications || ""} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
          </div>
          <div className="flex justify-between mt-1">
            <div>{isEdit && <button className="bg-[var(--color-danger)] text-white rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold cursor-pointer" onClick={del}>Delete</button>}</div>
            <div className="flex gap-2.5">
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold bg-transparent cursor-pointer" onClick={close}>Cancel</button>
              <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer" onClick={save}>{isEdit ? "Save" : "Post"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
