/**
 * Shared TypeScript types for the Bluewater Jobs ATS.
 * Central type definitions consumed by all pages, modals, context, and components.
 */

export type Stage =
  | "Applied"
  | "Screening"
  | "Initial Interview"
  | "Exam"
  | "Departmental Interview"
  | "Final Interview"
  | "Job Offer"
  | "Hired"
  | "Rejected";

export type NonRejectedStage = Exclude<Stage, "Rejected">;

export type Source = string;

export type Recruiter = string;

export type Location = string;

export type JobStatus = "Active" | "Closed";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export type FillTag = "Hard to Fill" | "Easy to Fill";

export interface StageColor {
  bg: string;
  text: string;
  dot: string;
}

export interface Candidate {
  id: number;
  candidateId?: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  stage: Stage;
  rating: number;
  applied: string;
  avatar: string;
  tags: string[];
  source: string;
  jobId: number;
  jobStatus?: JobStatus;
  recruiter: string;
  notes: string;
  resumeName: string;
  resumeUrl?: string;
  talents: string[];
  examResultName: string;
  examResultUrl?: string;
  endorsedFrom?: string;
}

export interface PoolCandidate {
  id: number;
  name: string;
  role: string;
  lastStage: Stage;
  rating: number;
  applied: string;
  email: string;
  avatar: string;
  tags: string[];
  source: string;
  jobId: number;
  closedJob: string;
  pooledDate: string;
  notes: string;
  talents?: string[];
}

export interface Job {
  id: number;
  title: string;
  dept: string;
  location: string;
  type: string;
  status: JobStatus;
  posted: string;
  closed?: string;
  description: string;
  qualifications?: string;
}
