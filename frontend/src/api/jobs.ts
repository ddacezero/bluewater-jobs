/**
 * Jobs API service — all HTTP calls for job CRUD.
 * Reads the JWT access token from localStorage and attaches it as Bearer auth.
 */

import type { Job } from "../data/types";

const API_BASE = "http://localhost:8000/api/jobs";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Fetch all persisted jobs from the backend. Returned jobs are tagged source:"api". */
export async function listJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch jobs.");
  const data: Job[] = await res.json();
  return data.map((j) => ({ ...j, source: "api" as const }));
}

/** Create a new job. Returns the saved job tagged source:"api". */
export async function createJob(
  data: Omit<Job, "id" | "source">
): Promise<Job> {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).detail ?? "Failed to create job."
    );
  }
  const job: Job = await res.json();
  return { ...job, source: "api" as const };
}

/** Partially update an existing job. Returns the updated job tagged source:"api". */
export async function updateJob(
  id: number,
  data: Partial<Omit<Job, "id" | "source">>
): Promise<Job> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).detail ?? "Failed to update job."
    );
  }
  const job: Job = await res.json();
  return { ...job, source: "api" as const };
}

/** Delete a job by ID. */
export async function deleteJob(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).detail ?? "Failed to delete job."
    );
  }
}
