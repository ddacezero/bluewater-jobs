/**
 * Application-wide constants for the Bluewater Jobs ATS.
 * Single source of truth for stages, recruiters, locations, and stage colors.
 */

import type { Stage, StageColor, Location } from "./types";

export const LOCATIONS: Location[] = [
  "Bluewater Maribago",
  "Bluewater Sumilon",
  "Bluewater Panglao",
  "Almont Inland",
  "Almont Beach Resort",
  "Almont City Hotel",
  "Amuma Spa",
  "Blue Bubble",
];

export const STAGES: Stage[] = [
  "Applied",
  "Screening",
  "Initial Interview",
  "Exam",
  "Departmental Interview",
  "Final Interview",
  "Job Offer",
  "Hired",
  "Rejected",
];

export const PIPELINE_STAGES: Stage[] = STAGES.filter(
  (s) => s !== "Rejected"
);

export const STAGE_COLORS: Record<string, StageColor> = {
  Applied: { bg: "#E8F4FD", text: "#1F75B9", dot: "#1F75B9" },
  Screening: { bg: "#FFF3E0", text: "#E65100", dot: "#FB8C00" },
  "Initial Interview": { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  Exam: { bg: "#FFF8E1", text: "#F57F17", dot: "#FDD835" },
  "Departmental Interview": { bg: "#E3F2FD", text: "#1565C0", dot: "#42A5F5" },
  "Final Interview": { bg: "#EDE7F6", text: "#4527A0", dot: "#7E57C2" },
  "Job Offer": { bg: "#F3E5F5", text: "#6A1B9A", dot: "#8E24AA" },
  Hired: { bg: "#E0F2F1", text: "#00695C", dot: "#00897B" },
  Rejected: { bg: "#FFEBEE", text: "#C62828", dot: "#EF5350" },
  "Not Qualified": { bg: "#FFF3E0", text: "#BF360C", dot: "#FF6D00" },
};

export const SOURCES = [
  "Website",
  "LinkedIn",
  "Indeed",
  "Referral",
  "Other",
] as const;

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
] as const;

export const REPORT_MONTHS = ["Jan 2026", "Feb 2026", "Mar 2026"] as const;
