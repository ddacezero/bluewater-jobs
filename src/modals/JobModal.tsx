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

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)]";
  const labelClass =
    "text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[520px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5 flex justify-between items-center border-b border-[var(--color-surface-border)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--color-text-heading)]">
              {isEdit ? "Edit Job Posting" : "Post New Job"}
            </h2>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {isEdit ? "Update the job details below" : "Fill in the job details below"}
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
          <div>
            <label className={labelClass}>Job Title <span className="text-[var(--color-danger)]">*</span></label>
            <input className={inputClass} placeholder="e.g. Resort Manager" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className={labelClass}>Department</label>
              <input className={inputClass} placeholder="e.g. Operations" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <select className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Job["status"] })}>
                {["Active", "Closed"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} resize-y min-h-[80px]`} rows={3} placeholder="Describe the role..." value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Qualifications</label>
            <textarea className={`${inputClass} resize-y min-h-[80px]`} rows={3} placeholder="List required qualifications..." value={form.qualifications || ""} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[var(--color-surface-border)] mt-1">
            <div>
              {isEdit && (
                <button
                  className="bg-[var(--color-danger-bg)] text-[var(--color-danger-dark)] border border-[var(--color-danger-border)] rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-semibold cursor-pointer hover:bg-[var(--color-danger)] hover:text-white transition-colors"
                  onClick={del}
                >
                  Delete Job
                </button>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                onClick={close}
              >
                Cancel
              </button>
              <button
                className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
                onClick={save}
              >
                {isEdit ? "Save Changes" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
