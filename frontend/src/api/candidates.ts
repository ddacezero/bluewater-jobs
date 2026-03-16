/**
 * Candidate API — wraps all /api/candidates/ calls.
 * Uses the same Bearer-token pattern as api/jobs.ts.
 */

import type { Candidate, CandidateNote } from "../data/types";

const API_BASE = "http://localhost:8000/api/candidates";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ListCandidatesParams {
  job?: number;
  is_pooled?: boolean;
}

export async function listCandidates(params?: ListCandidatesParams): Promise<Candidate[]> {
  const query = new URLSearchParams();
  if (params?.job !== undefined) query.set("job", String(params.job));
  if (params?.is_pooled !== undefined) query.set("is_pooled", String(params.is_pooled));
  const url = query.toString() ? `${API_BASE}/?${query}` : `${API_BASE}/`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch candidates.");
  return res.json();
}

export async function getCandidate(id: number): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch candidate.");
  return res.json();
}

export async function createCandidate(formData: FormData): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: authHeaders(),   // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function updateCandidate(
  id: number,
  data: Partial<Pick<Candidate, "stage" | "rating" | "notes" | "is_pooled">> & {
    recruiter_id?: number | null;
  }
): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update candidate.");
  return res.json();
}

export async function uploadExamResult(id: number, file: File): Promise<Candidate> {
  const fd = new FormData();
  fd.append("exam_result", file);
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: fd,
  });
  if (!res.ok) throw new Error("Failed to upload exam result.");
  return res.json();
}

export async function listNotes(candidateId: number): Promise<CandidateNote[]> {
  const res = await fetch(`${API_BASE}/${candidateId}/notes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notes.");
  return res.json();
}

export async function createNote(candidateId: number, content: string): Promise<CandidateNote> {
  const res = await fetch(`${API_BASE}/${candidateId}/notes/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to create note.");
  return res.json();
}

export async function deleteCandidate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete candidate.");
}
