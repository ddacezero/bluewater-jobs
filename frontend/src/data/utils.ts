/**
 * Shared utility helpers for Bluewater Jobs ATS.
 */

/**
 * Formats an ISO 8601 timestamp string into "Jan 12, 2026 at 10:01 PM PHT".
 * Returns "—" for null/undefined/empty input.
 */
export function formatPHT(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
