import { type ChangeEvent, type FC, useEffect, useMemo, useRef, useState } from "react";
import { applyToJob, getPublicJob, listPublicJobs, type JobApplicationInput, type PublicJob } from "../api/careers";

interface FormState {
  name: string;
  email: string;
  phoneNumber: string;
  expectedSalary: string;
  coverLetter: string;
  agreement: boolean;
  resume: File | null;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phoneNumber: "",
  expectedSalary: "",
  coverLetter: "",
  agreement: false,
  resume: null,
};

const Careers: FC = () => {
  const jobsRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const totalPages = Math.max(1, Math.ceil(count / 20));
  const pages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setJobsLoading(true);
      setListError("");
      try {
        const data = await listPublicJobs(search, page);
        if (!active) return;
        setJobs(data.results);
        setCount(data.count);
        setSelectedJobId((current) => {
          if (!current) return current;
          return data.results.some((job) => job.id === current) ? current : null;
        });
      } catch (error) {
        if (!active) return;
        setListError(error instanceof Error ? error.message : "Failed to load careers.");
        setJobs([]);
        setCount(0);
        setSelectedJobId(null);
        setSelectedJob(null);
      } finally {
        if (active) setJobsLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [search, page]);

  useEffect(() => {
    if (!selectedJobId) {
      setSelectedJob(null);
      setDetailError("");
      setDetailLoading(false);
      return;
    }

    let active = true;
    setDetailLoading(true);
    setDetailError("");

    getPublicJob(selectedJobId)
      .then((job) => {
        if (!active) return;
        setSelectedJob(job);
      })
      .catch((error) => {
        if (!active) return;
        setDetailError(error instanceof Error ? error.message : "Failed to load job details.");
        setSelectedJob(null);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedJobId]);

  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setSubmitError("");
    setSubmitSuccess("");
    setForm(INITIAL_FORM);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleBackToJobs = () => {
    setSelectedJobId(null);
    setSelectedJob(null);
    setDetailError("");
    setSubmitError("");
    setSubmitSuccess("");
    setForm(INITIAL_FORM);
    window.setTimeout(() => {
      jobsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.currentTarget;
    const { name, value } = target;

    setForm((current) => ({
      ...current,
      [name]:
        target instanceof HTMLInputElement && target.files && target.files.length > 0
          ? target.files[0]
          : target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : value,
    }));
  };

  const handleApply = async () => {
    if (
      !selectedJobId ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.expectedSalary.trim() ||
      !form.resume ||
      !form.agreement
    ) {
      setSubmitError("Please complete all required fields, attach your resume, and confirm the agreement.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload: JobApplicationInput = {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        resume: form.resume,
        expectedSalary: form.expectedSalary,
        coverLetter: form.coverLetter,
        agreement: form.agreement,
      };
      await applyToJob(selectedJobId, payload);
      setForm(INITIAL_FORM);
      setSubmitSuccess("Application submitted successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5fbff_0%,#eef5f9_50%,#f7fafc_100%)]">
      <section
        className="relative overflow-hidden px-5 py-8 md:px-10 md:py-12"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(15,29,46,0.82), rgba(31,117,185,0.45)), url('/login-signup-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl py-14 md:py-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Bluewater Careers</p>
            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Build your hospitality career with us.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85 md:text-lg">
              Explore open roles across our resorts and apply directly from this page.
            </p>
            <button
              onClick={() => jobsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="mt-8 rounded-[var(--radius-full)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-primary)] shadow-[var(--shadow-btn)] transition-transform hover:-translate-y-0.5"
            >
              Apply for open positions
            </button>
          </div>
        </div>
      </section>

      <section ref={jobsRef} className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Open Positions</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-text-heading)]">Current job openings</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Search active roles and select a job card to view the full posting and apply.
            </p>
          </div>
          <div className="w-full md:max-w-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
              Search jobs
            </label>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, department, location..."
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-card)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {listError && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger-dark)]">
            {listError}
          </div>
        )}

        {jobsLoading ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white p-8 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white p-8 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
            No active jobs matched your search.
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job.id)}
                    className={`rounded-[var(--radius-xl)] border p-6 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "border-[var(--color-surface-border)] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-[var(--radius-full)] bg-[rgba(31,117,185,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                        {job.type}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{job.posted}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-[var(--color-text-heading)]">{job.title}</h3>
                    <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">
                      {job.dept} · {job.location}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[var(--color-text-subtle)]">
                      {job.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Showing page {page} of {totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {pages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-10 min-w-10 rounded-[var(--radius-md)] px-3 text-sm font-bold ${
                      pageNumber === page
                        ? "bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)]"
                        : "border border-[var(--color-surface-border)] bg-white text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {(selectedJobId || detailLoading || detailError) && (
        <section ref={detailRef} className="mx-auto max-w-6xl px-5 pb-14 md:px-10 md:pb-20">
          <div className="mb-5 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <button
              type="button"
              onClick={handleBackToJobs}
              className="font-semibold text-[var(--color-primary)]"
            >
              Careers
            </button>
            <span>/</span>
            <span className="truncate font-medium text-[var(--color-text-heading)]">
              {selectedJob?.title || "Job details"}
            </span>
          </div>

          {detailLoading ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] bg-white p-8 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
              Loading job details...
            </div>
          ) : detailError || !selectedJob ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-6 text-sm text-[var(--color-danger-dark)]">
              {detailError || "This job posting could not be found."}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] bg-white p-7 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Job Details</p>
                <h3 className="mt-3 text-3xl font-extrabold text-[var(--color-text-heading)] md:text-4xl">{selectedJob.title}</h3>
                <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
                  {selectedJob.dept} · {selectedJob.location} · {selectedJob.type}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">Posted {selectedJob.posted}</p>
                <div className="mt-8">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                    Overview
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-subtle)]">{selectedJob.description}</p>
                </div>
                <div className="mt-8">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                    Qualifications
                  </h4>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--color-text-subtle)]">
                    {selectedJob.qualifications || "Qualifications will be shared during screening."}
                  </p>
                </div>
              </article>

              <aside className="rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] bg-white p-7 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Apply Now</p>
                <h3 className="mt-3 text-2xl font-extrabold text-[var(--color-text-heading)]">Submit your application</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  You are applying for <span className="font-semibold text-[var(--color-text-heading)]">{selectedJob.title}</span>.
                </p>

                <div className="mt-6 grid gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Full name"
                    className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="Email address"
                    className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="Phone number"
                    className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    name="expectedSalary"
                    value={form.expectedSalary}
                    onChange={handleFormChange}
                    placeholder="Expected salary"
                    className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3">
                    <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                      Resume
                    </label>
                    <input
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFormChange}
                      className="mt-2 block w-full text-sm text-[var(--color-text-secondary)]"
                    />
                    {form.resume && (
                      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{form.resume.name}</p>
                    )}
                  </div>
                  <textarea
                    name="coverLetter"
                    value={form.coverLetter}
                    onChange={handleFormChange}
                    placeholder="Cover letter"
                    rows={6}
                    className="rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <label className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-bg)] px-4 py-3 text-sm text-[var(--color-text-subtle)]">
                    <input
                      name="agreement"
                      type="checkbox"
                      checked={form.agreement}
                      onChange={handleFormChange}
                      className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                    />
                    <span>I confirm that the information I submitted is accurate and I agree to be contacted regarding this application.</span>
                  </label>
                </div>

                {submitError && (
                  <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger-dark)]">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success-dark)]">
                    {submitSuccess}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={submitLoading}
                  className="mt-6 w-full rounded-[var(--radius-full)] bg-[var(--color-btn-primary-bg)] px-5 py-3 text-sm font-bold text-[var(--color-btn-primary-text)] shadow-[var(--shadow-btn)] transition-colors hover:bg-[var(--color-btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? "Submitting..." : "Apply"}
                </button>
              </aside>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Careers;
