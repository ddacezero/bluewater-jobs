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

export interface ApplicationNested {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  resume: string;
  expected_salary: string;
  source: string;
  created_at: string;
}

export interface JobNested {
  id: number;
  title: string;
  location: string;
}

export interface RecruiterNested {
  id: number;
  name: string;
}

export interface Candidate {
  id: number;
  stage: Stage;
  rating: number;           // 0 = unrated, 1–5 stars
  recruiter: RecruiterNested | null;
  notes: string;
  exam_result: string | null;
  endorsed_from: string | null;
  is_pooled: boolean;
  pooled_at: string | null;
  created_at: string;
  application: ApplicationNested;
  job: JobNested;
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
  /** undefined = seeded/local (frontend-only), "api" = persisted in the backend DB */
  source?: "api";
}

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}
