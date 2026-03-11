import type { Candidate, Job, Stage } from "./data/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

interface ApiCandidate {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
}

interface ApiJob {
  id: number;
  title: string;
  department?: string | null;
  location: string;
  job_type?: string | null;
  status: string;
  description?: string | null;
  qualifications?: string | null;
  posted_at?: string | null;
  closed_at?: string | null;
}

interface ApiApplication {
  id: number;
  stage: string;
  source?: string | null;
  rating?: number | null;
  recruiter_name?: string | null;
  notes?: string | null;
  resume_file?: string | null;
  exam_result_file?: string | null;
  applied_at?: string | null;
  candidate: ApiCandidate;
  job: ApiJob;
}

interface PaginatedResponse<T> {
  results: T[];
}

export interface JobPayload {
  title: string;
  department: string;
  location: string;
  jobType: string;
  status: Job["status"];
  description: string;
  qualifications: string;
}

export interface CandidateApplicationPayload {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobId: number;
  stage?: Stage;
  source: string;
  rating?: number;
  recruiterName?: string;
  notes?: string;
}

export interface ApplicationUpdatePayload {
  stage?: Stage;
  source?: string;
  rating?: number;
  recruiterName?: string;
  notes?: string;
  resumeFile?: File;
  examResultFile?: File;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return `${url.pathname}${url.search}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), init);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message =
        data.detail ||
        data.message ||
        Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ") ||
        message;
    } catch {
      // Ignore parse errors and use the default message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function unwrapList<T>(payload: T[] | PaginatedResponse<T>) {
  return Array.isArray(payload) ? payload : payload.results;
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function titleize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapStageFromApi(stage: string): Stage {
  const normalized = stage.trim().toLowerCase();
  const map: Record<string, Stage> = {
    applied: "Applied",
    screening: "Screening",
    initial_interview: "Initial Interview",
    exam: "Exam",
    departmental_interview: "Departmental Interview",
    final_interview: "Final Interview",
    job_offer: "Job Offer",
    hired: "Hired",
    rejected: "Rejected",
  };
  return map[normalized] ?? "Applied";
}

function mapStageToApi(stage: Stage) {
  const map: Record<Stage, string> = {
    Applied: "applied",
    Screening: "screening",
    "Initial Interview": "initial_interview",
    Exam: "exam",
    "Departmental Interview": "departmental_interview",
    "Final Interview": "final_interview",
    "Job Offer": "job_offer",
    Hired: "hired",
    Rejected: "rejected",
  };
  return map[stage];
}

function mapSourceFromApi(source?: string | null) {
  if (!source) return "Other";
  const normalized = source.trim().toLowerCase();
  const map: Record<string, string> = {
    website: "Website",
    linkedin: "LinkedIn",
    indeed: "Indeed",
    referral: "Referral",
    endorsed: "Endorsed",
    talent_pool: "Talent Pool",
    other: "Other",
  };
  return map[normalized] ?? titleize(normalized);
}

function mapSourceToApi(source: string) {
  const normalized = source.trim().toLowerCase();
  const map: Record<string, string> = {
    website: "website",
    linkedin: "linkedin",
    indeed: "indeed",
    referral: "referral",
    endorsed: "endorsed",
    "talent pool": "talent_pool",
    other: "other",
  };
  return map[normalized] ?? normalized.replace(/\s+/g, "_");
}

function mapStatusFromApi(status: string): Job["status"] {
  return status.trim().toLowerCase() === "closed" ? "Closed" : "Active";
}

function mapStatusToApi(status: Job["status"]) {
  return status.toLowerCase();
}

function mapJobTypeFromApi(jobType?: string | null) {
  if (!jobType) return "Full-time";
  const normalized = jobType.trim().toLowerCase();
  const map: Record<string, string> = {
    full_time: "Full-time",
    "full-time": "Full-time",
    part_time: "Part-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
  };
  return map[normalized] ?? titleize(normalized);
}

function mapJobTypeToApi(jobType: string) {
  const normalized = jobType.trim().toLowerCase();
  const map: Record<string, string> = {
    "full-time": "full_time",
    "part-time": "part_time",
    contract: "contract",
    internship: "internship",
  };
  return map[normalized] ?? normalized.replace(/\s+/g, "_");
}

function fileNameFromPath(path?: string | null) {
  if (!path) return "";
  return path.split("/").pop() || path;
}

export function mapJob(apiJob: ApiJob): Job {
  return {
    id: apiJob.id,
    title: apiJob.title,
    dept: apiJob.department || "",
    location: apiJob.location,
    type: mapJobTypeFromApi(apiJob.job_type),
    status: mapStatusFromApi(apiJob.status),
    posted: formatDisplayDate(apiJob.posted_at),
    closed: formatDisplayDate(apiJob.closed_at) || undefined,
    description: apiJob.description || "",
    qualifications: apiJob.qualifications || "",
  };
}

export function mapApplication(apiApplication: ApiApplication): Candidate {
  return {
    id: apiApplication.id,
    candidateId: apiApplication.candidate.id,
    name: apiApplication.candidate.full_name,
    email: apiApplication.candidate.email,
    phone: apiApplication.candidate.phone || "",
    role: apiApplication.job.title,
    stage: mapStageFromApi(apiApplication.stage),
    rating: apiApplication.rating ?? 0,
    applied: formatDisplayDate(apiApplication.applied_at),
    avatar:
      apiApplication.candidate.avatar ||
      getInitials(apiApplication.candidate.full_name),
    tags: [],
    source: mapSourceFromApi(apiApplication.source),
    jobId: apiApplication.job.id,
    jobStatus: mapStatusFromApi(apiApplication.job.status),
    recruiter: apiApplication.recruiter_name || "",
    notes: apiApplication.notes || "",
    resumeName: fileNameFromPath(apiApplication.resume_file),
    resumeUrl: apiApplication.resume_file || undefined,
    talents: [],
    examResultName: fileNameFromPath(apiApplication.exam_result_file),
    examResultUrl: apiApplication.exam_result_file || undefined,
  };
}

export async function listJobs() {
  const jobs = await request<ApiJob[] | PaginatedResponse<ApiJob>>("/jobs/");
  return unwrapList(jobs).map(mapJob);
}

export async function createJob(payload: JobPayload) {
  await request<ApiJob>("/jobs/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      department: payload.department,
      location: payload.location,
      job_type: mapJobTypeToApi(payload.jobType),
      status: mapStatusToApi(payload.status),
      description: payload.description,
      qualifications: payload.qualifications,
    }),
  });
}

export async function updateJob(id: number, payload: JobPayload) {
  await request<ApiJob>(`/jobs/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      department: payload.department,
      location: payload.location,
      job_type: mapJobTypeToApi(payload.jobType),
      status: mapStatusToApi(payload.status),
      description: payload.description,
      qualifications: payload.qualifications,
    }),
  });
}

export async function deleteJob(id: number) {
  await request<void>(`/jobs/${id}/`, { method: "DELETE" });
}

export async function listApplications() {
  const applications = await request<ApiApplication[] | PaginatedResponse<ApiApplication>>(
    "/applications/"
  );
  return unwrapList(applications).map(mapApplication);
}

export async function createCandidateWithApplication(payload: CandidateApplicationPayload) {
  const candidate = await request<ApiCandidate>("/candidates/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || "",
      avatar: payload.avatar || getInitials(payload.fullName),
    }),
  });

  const application = await request<ApiApplication>("/applications/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidate.id,
      job_id: payload.jobId,
      stage: mapStageToApi(payload.stage || "Applied"),
      source: mapSourceToApi(payload.source),
      rating: payload.rating ?? 3,
      recruiter_name: payload.recruiterName || "",
      notes: payload.notes || "",
    }),
  });

  return mapApplication(application);
}

export async function updateApplication(id: number, payload: ApplicationUpdatePayload) {
  const hasFiles = payload.resumeFile instanceof File || payload.examResultFile instanceof File;

  if (hasFiles) {
    const formData = new FormData();
    if (payload.stage) formData.append("stage", mapStageToApi(payload.stage));
    if (payload.source) formData.append("source", mapSourceToApi(payload.source));
    if (payload.rating !== undefined) formData.append("rating", String(payload.rating));
    if (payload.recruiterName !== undefined) formData.append("recruiter_name", payload.recruiterName);
    if (payload.notes !== undefined) formData.append("notes", payload.notes);
    if (payload.resumeFile) formData.append("resume_file", payload.resumeFile);
    if (payload.examResultFile) formData.append("exam_result_file", payload.examResultFile);

    await request<ApiApplication>(`/applications/${id}/`, {
      method: "PATCH",
      body: formData,
    });
    return;
  }

  await request<ApiApplication>(`/applications/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(payload.stage ? { stage: mapStageToApi(payload.stage) } : {}),
      ...(payload.source ? { source: mapSourceToApi(payload.source) } : {}),
      ...(payload.rating !== undefined ? { rating: payload.rating } : {}),
      ...(payload.recruiterName !== undefined
        ? { recruiter_name: payload.recruiterName }
        : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    }),
  });
}
