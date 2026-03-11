/**
 * Public careers page.
 * Route: /careers
 * Static presentation built from the current in-memory active jobs list.
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FC, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import type { Job } from "../data/types";
import { BagIcon, ChevIcon, CheckIcon, ClockIcon, LocIcon, MailIcon, XIcon } from "../components/icons";

const JOBS_PER_PAGE = 4;

interface ApplyFormState {
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeName: string;
  expectedSalary: string;
  agreed: boolean;
}

const emptyForm: ApplyFormState = {
  name: "",
  email: "",
  phone: "",
  coverLetter: "",
  resumeName: "",
  expectedSalary: "",
  agreed: false,
};

const Careers: FC = () => {
  const { state, addCandidateToPipeline, saveApplication } = useApp();
  const mob = useMobile();
  const activeJobs = useMemo(() => state.jobs.filter((job) => job.status === "Active"), [state.jobs]);

  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(activeJobs[0] ?? null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittedJobTitle, setSubmittedJobTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ApplyFormState>(emptyForm);
  const detailRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(activeJobs.length / JOBS_PER_PAGE));
  const paginatedJobs = activeJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  useEffect(() => {
    if (!activeJobs.length) {
      setSelectedJob(null);
      return;
    }

    const hasSelectedJob = selectedJob && activeJobs.some((job) => job.id === selectedJob.id);
    if (!hasSelectedJob) {
      setSelectedJob(activeJobs[0]);
    }
  }, [activeJobs, selectedJob]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const viewJob = (job: Job) => {
    setSelectedJob(job);
    if (mob) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openApplyModal = () => {
    if (!selectedJob) return;
    setShowApplyModal(true);
    setSubmittedJobTitle("");
    setIsSubmitting(false);
    setForm(emptyForm);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSubmittedJobTitle("");
    setForm(emptyForm);
  };

  const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, resumeName: file ? file.name : "" }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void (async () => {
      if (!selectedJob) return;
      if (!form.name || !form.email || !form.phone || !form.coverLetter || !form.resumeName || !form.expectedSalary || !form.agreed) {
        return;
      }
      setIsSubmitting(true);
      try {
        const application = await addCandidateToPipeline({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          jobId: selectedJob.id,
          stage: "Applied",
          source: "Website",
          notes: `Cover letter:\n${form.coverLetter}\n\nExpected salary: ${form.expectedSalary}`,
        });
        const resumeInput = document.getElementById("careers-resume-input") as HTMLInputElement | null;
        const resumeFile = resumeInput?.files?.[0];
        if (resumeFile) {
          await saveApplication(application.id, { resumeFile });
        }
        setSubmittedJobTitle(selectedJob.title);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const inputClass =
    "w-full px-3.5 py-3 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-primary)]";
  const labelClass =
    "text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5";

  return (
    <div className="min-h-screen bg-[var(--color-surface-bg)] animate-fade-in">
      <header className="border-b border-[var(--color-surface-border)] bg-[rgba(255,255,255,0.82)] backdrop-blur-md">
        <div className={`mx-auto max-w-[1240px] ${mob ? "px-4 py-4" : "px-8 py-5"} flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-[15px] shadow-[var(--shadow-btn)]">
              BW
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-[var(--color-text-heading)]">Bluewater Resorts</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Careers</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-secondary)]">Now hiring</div>
            <div className="text-[18px] font-bold text-[var(--color-primary)]">{activeJobs.length} open roles</div>
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-[1240px] ${mob ? "px-4 py-5" : "px-8 py-8"}`}>
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] mb-6 bg-[var(--color-surface)]">
          <img
            src="/careers-hero.svg"
            alt="Bluewater Careers"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,52,0.88)_0%,rgba(10,42,70,0.74)_44%,rgba(8,31,52,0.28)_100%)]" />
          <div className={`relative z-10 ${mob ? "px-5 py-8" : "px-8 py-10"} max-w-[760px]`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm mb-4">
              <BagIcon />
              Explore opportunities
            </div>
            <h1 className={`${mob ? "text-[30px] leading-[1.08]" : "text-[46px] leading-[1.02]"} font-extrabold text-white tracking-[-0.03em]`}>
              Build your hospitality career with Bluewater Resorts
            </h1>
            <p className={`${mob ? "text-[14px]" : "text-[16px]"} mt-4 max-w-[620px] text-[#E2EEF7] leading-relaxed`}>
              Discover open roles across our resorts, operations, and guest experience teams. Review the current openings below and apply directly for the role that matches your strengths.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-[var(--radius-md)] bg-white/12 px-4 py-3 backdrop-blur-sm border border-white/12">
                <div className="text-[11px] uppercase tracking-wide text-white/70">Open roles</div>
                <div className="text-[22px] font-bold text-white mt-1">{activeJobs.length}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-white/12 px-4 py-3 backdrop-blur-sm border border-white/12">
                <div className="text-[11px] uppercase tracking-wide text-white/70">Locations</div>
                <div className="text-[22px] font-bold text-white mt-1">
                  {new Set(activeJobs.map((job) => job.location)).size}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]"} gap-6`}>
          <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[19px] font-bold text-[var(--color-text-heading)]">Available careers</h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                  Browse the current openings and pick one to view the full description.
                </p>
              </div>
              <div className="text-[12px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full">
                Page {page} of {totalPages}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {paginatedJobs.map((job) => (
                <article
                  key={job.id}
                  className={`rounded-[18px] border p-4 transition-all duration-200 ${
                    selectedJob?.id === job.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-[var(--shadow-card-hover)]"
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-surface-muted)] hover:shadow-[var(--shadow-card-hover)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-[var(--color-text-heading)]">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-subtle)]">
                        <span className="inline-flex items-center gap-1.5">
                          <LocIcon />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => viewJob(job)}
                      className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-transparent px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                    >
                      View
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {activeJobs.length === 0 && (
              <div className="rounded-[18px] border border-dashed border-[var(--color-surface-muted)] px-5 py-8 text-center mt-3">
                <p className="text-[14px] font-semibold text-[var(--color-text-heading)]">No open careers right now</p>
                <p className="text-[12.5px] text-[var(--color-text-secondary)] mt-2">
                  Check back later for new opportunities across Bluewater Resorts.
                </p>
              </div>
            )}

            {activeJobs.length > JOBS_PER_PAGE && (
              <div className="mt-5 flex items-center justify-between border-t border-[var(--color-surface-border)] pt-4">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-text-subtle)] bg-transparent cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <ChevIcon style={{ transform: "rotate(180deg)" }} />
                  Previous
                </button>
                <div className="text-[12px] text-[var(--color-text-secondary)]">
                  Showing {(page - 1) * JOBS_PER_PAGE + 1}-{Math.min(page * JOBS_PER_PAGE, activeJobs.length)} of {activeJobs.length}
                </div>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-text-subtle)] bg-transparent cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  Next
                  <ChevIcon />
                </button>
              </div>
            )}
          </section>

          <aside
            ref={detailRef}
            className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5 lg:sticky lg:top-6 self-start"
          >
            {selectedJob ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-3">
                      {selectedJob.dept}
                    </div>
                    <h2 className="text-[24px] leading-tight font-bold text-[var(--color-text-heading)]">
                      {selectedJob.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[var(--color-success-bg)] px-3 py-1 text-[11px] font-bold text-[var(--color-success-dark)]">
                    Open
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-[var(--color-text-subtle)]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-hover)] px-3 py-1.5">
                    <LocIcon />
                    {selectedJob.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-hover)] px-3 py-1.5">
                    <ClockIcon />
                    {selectedJob.type}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
                    Job description
                  </h3>
                  <p className="text-[14px] leading-7 text-[var(--color-text-subtle)]">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.qualifications && (
                  <div className="mt-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
                      Qualifications
                    </h3>
                    <p className="text-[14px] leading-7 text-[var(--color-text-subtle)]">
                      {selectedJob.qualifications}
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-[18px] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] p-4">
                  <div className="text-[13px] font-semibold text-[var(--color-text-heading)]">Ready to apply?</div>
                  <p className="text-[12.5px] leading-6 text-[var(--color-text-secondary)] mt-1">
                    Submit your details and resume for {selectedJob.title}. This creates a candidate and application in the backend with source set to Website and stage set to Applied.
                  </p>
                  <button
                    onClick={openApplyModal}
                    className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Apply now
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[var(--color-surface-muted)] px-5 py-10 text-center">
                <p className="text-[15px] font-semibold text-[var(--color-text-heading)]">No role selected</p>
                <p className="text-[12.5px] text-[var(--color-text-secondary)] mt-2">
                  Pick a career from the list to review the job details.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]">
        <div className={`mx-auto max-w-[1240px] ${mob ? "px-4 py-4" : "px-8 py-5"} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Bluewater Resorts Careers
          </p>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            Public careers view for prospective candidates
          </p>
        </div>
      </footer>

      {showApplyModal && selectedJob && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.55)] backdrop-blur-[3px]"
          style={mob ? { alignItems: "flex-end" } : {}}
          onClick={closeApplyModal}
        >
          <div
            className={`${mob ? "w-full rounded-t-[22px]" : "w-[680px] rounded-[22px]"} max-h-[92vh] overflow-y-auto bg-[var(--color-surface)] shadow-[var(--shadow-modal)]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5 border-b border-[var(--color-surface-border)] flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)]">Apply for</div>
                <h2 className="text-[22px] font-bold text-[var(--color-text-heading)] mt-1">{selectedJob.title}</h2>
                <p className="text-[12.5px] text-[var(--color-text-secondary)] mt-1">
                  Fill out the details below and attach your resume.
                </p>
              </div>
              <button
                onClick={closeApplyModal}
                className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-bg)] border-none cursor-pointer text-[var(--color-text-muted)] flex rounded-[var(--radius-md)] p-1.5 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {submittedJobTitle ? (
              <div className="px-6 py-8">
                <div className="rounded-[20px] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-success-dark)]">
                    <CheckIcon />
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--color-text-heading)] mt-4">Application submitted</h3>
                  <p className="text-[14px] leading-7 text-[var(--color-text-subtle)] mt-2">
                    Your application for <strong>{submittedJobTitle}</strong> has been submitted and added to the ATS as an applied website candidate.
                  </p>
                  <button
                    onClick={closeApplyModal}
                    className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="px-6 py-5 flex flex-col gap-4">
                <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        <MailIcon />
                      </span>
                      <input
                        type="email"
                        className={`${inputClass} pl-10`}
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="juan@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+63 912 345 6789"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expected salary</label>
                    <input
                      className={inputClass}
                      value={form.expectedSalary}
                      onChange={(e) => setForm((prev) => ({ ...prev, expectedSalary: e.target.value }))}
                      placeholder="PHP 35,000 / month"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Cover letter</label>
                  <textarea
                    className={`${inputClass} min-h-[140px] resize-y`}
                    value={form.coverLetter}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Tell us why you're a strong fit for this role."
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Resume</label>
                  <input
                    type="file"
                    id="careers-resume-input"
                    accept=".pdf,.doc,.docx"
                    className={`${inputClass} file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-primary-light)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-[var(--color-primary)]`}
                    onChange={onResumeChange}
                    required
                  />
                  {form.resumeName && (
                    <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
                      Selected file: <strong>{form.resumeName}</strong>
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={form.agreed}
                    onChange={(e) => setForm((prev) => ({ ...prev, agreed: e.target.checked }))}
                    required
                  />
                  <span className="text-[12.5px] leading-6 text-[var(--color-text-subtle)]">
                    I confirm that the information provided is accurate and I agree to be contacted regarding this application.
                  </span>
                </label>

                <div className="pt-2 border-t border-[var(--color-surface-border)] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeApplyModal}
                    className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Apply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
