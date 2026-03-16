export interface PublicJob {
  id: number;
  title: string;
  dept: string;
  location: string;
  type: string;
  posted: string;
  description: string;
  qualifications: string;
}

export interface PublicJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PublicJob[];
}

export interface JobApplicationInput {
  name: string;
  email: string;
  phoneNumber: string;
  resume: File;
  expectedSalary: string;
  coverLetter: string;
  agreement: boolean;
}

const API_BASE = "http://localhost:8000/api/jobs/public";

export async function listPublicJobs(search: string, page: number): Promise<PublicJobsResponse> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  params.set("page", String(page));

  const res = await fetch(`${API_BASE}/?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load careers.");
  return res.json();
}

export async function getPublicJob(id: number): Promise<PublicJob> {
  const res = await fetch(`${API_BASE}/${id}/`);
  if (!res.ok) throw new Error("Failed to load job details.");
  return res.json();
}

export async function applyToJob(id: number, payload: JobApplicationInput): Promise<void> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone_number", payload.phoneNumber);
  formData.append("resume", payload.resume);
  formData.append("expected_salary", payload.expectedSalary);
  formData.append("cover_letter", payload.coverLetter);
  formData.append("agreement", String(payload.agreement));

  const res = await fetch(`${API_BASE}/${id}/apply/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const firstMessage = Object.values(err)[0];
    const message = Array.isArray(firstMessage) ? firstMessage[0] : "Failed to submit application.";
    throw new Error(typeof message === "string" ? message : "Failed to submit application.");
  }
}
