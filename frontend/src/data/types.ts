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

export type Source =
  | "Website"
  | "LinkedIn"
  | "Indeed"
  | "Referral"
  | "Endorsed"
  | "Talent Pool"
  | "Other";

export type Recruiter = "Joela" | "Ranie";

export type Location =
  | "Bluewater Maribago"
  | "Bluewater Sumilon"
  | "Bluewater Panglao"
  | "Almont Inland"
  | "Almont Beach Resort"
  | "Almont City Hotel"
  | "Amuma Spa"
  | "Blue Bubble";

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
  name: string;
  email: string;
  role: string;
  stage: Stage;
  rating: number;
  applied: string;
  avatar: string;
  tags: string[];
  source: string;
  jobId: number;
  recruiter: string;
  notes: string;
  resumeName: string;
  talents: string[];
  examResultName: string;
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
