/**
 * Add Candidate Modal — HR creates a candidate directly, bypassing the public
 * application portal. Mirrors application portal fields plus HR-specific inputs.
 * Submits multipart/form-data to POST /api/candidates/.
 */

import { useState, useEffect, useRef, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { createCandidate } from "../api/candidates";
import { XIcon } from "../components/icons";

interface UserOption {
  id: number;
  name: string;
}

const SOURCES = ["Website", "LinkedIn", "Indeed", "Referral", "Endorsed", "Other"] as const;

const AddCandidateModal: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();
  const { showAddModal, jobs } = state;
  const activeJobs = jobs.filter((j) => j.status === "Active" && j.source === "api");

  const [users, setUsers] = useState<UserOption[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    name: "",
    email: "",
    phone_number: "",
    expected_salary: "",
    cover_letter: "",
    source: "Website" as string,
    job_id: "",
    recruiter_id: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [resume, setResume] = useState<File | null>(null);

  // Auto-select the first active job once jobs are available
  useEffect(() => {
    if (!form.job_id && activeJobs.length > 0) {
      setForm((prev) => ({ ...prev, job_id: activeJobs[0].id.toString() }));
    }
    setJobsLoading(activeJobs.length === 0);
  }, [activeJobs.length]);

  useEffect(() => {
    if (!showAddModal) return;
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("http://localhost:8000/api/auth/users/", { headers })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, [showAddModal]);

  if (!showAddModal) return null;

  const resetForm = () => {
    setForm(emptyForm);
    setResume(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => {
    dispatch({ type: "SET_SHOW_ADD_MODAL", payload: false });
    resetForm();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone_number || !form.expected_salary || !resume || !form.job_id) {
      setError("Please fill in all required fields and attach a resume.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone_number", form.phone_number);
    fd.append("expected_salary", form.expected_salary);
    fd.append("cover_letter", form.cover_letter);
    fd.append("source", form.source);
    fd.append("job_id", form.job_id);
    fd.append("resume", resume);
    if (form.recruiter_id) fd.append("recruiter_id", form.recruiter_id);

    setLoading(true);
    setError(null);
    try {
      const candidate = await createCandidate(fd);
      dispatch({ type: "ADD_CANDIDATE", payload: candidate });
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Candidate added successfully.", variant: "success" },
      });
      resetForm();
    } catch {
      setError("Failed to add candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[560px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
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
          {/* Row 1: Name + Email */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Full Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} placeholder="Jane Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Email <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} type="email" placeholder="jane@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Row 2: Phone + Expected Salary */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Phone Number <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} placeholder="09171234567" value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Expected Salary <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} type="number" placeholder="25000" value={form.expected_salary}
                onChange={(e) => setForm({ ...form, expected_salary: e.target.value })} />
            </div>
          </div>

          {/* Row 3: Role + Recruiter */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Role (Job) <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select className={inp} value={form.job_id}
                disabled={jobsLoading}
                onChange={(e) => setForm({ ...form, job_id: e.target.value })}>
                {jobsLoading
                  ? <option value="">Loading jobs…</option>
                  : <>
                      <option value="">Select a job…</option>
                      {activeJobs.map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </>
                }
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Recruiter
              </label>
              <select className={inp} value={form.recruiter_id}
                onChange={(e) => setForm({ ...form, recruiter_id: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Source */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Source <span className="text-[var(--color-danger)]">*</span>
            </label>
            <select className={inp} value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Row 5: Resume */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Resume <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
              className="hidden" onChange={(e) => setResume(e.target.files?.[0] || null)} />
            <button
              type="button"
              className={`${inp} text-left cursor-pointer ${resume ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
              onClick={() => fileRef.current?.click()}
            >
              {resume ? resume.name : "Click to upload resume (PDF, DOC)"}
            </button>
          </div>

          {/* Row 6: Cover Letter */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Cover Letter
            </label>
            <textarea className={`${inp} resize-none h-20`} placeholder="Optional cover letter…"
              value={form.cover_letter}
              onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} />
          </div>

          {error && (
            <p className="text-[12px] text-[var(--color-danger)]">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1 justify-end border-t border-[var(--color-surface-border)] mt-1">
            <button
              className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98] disabled:opacity-60"
              onClick={handleSubmit}
            >
              {loading ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;
