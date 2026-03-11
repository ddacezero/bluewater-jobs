/**
 * Custom hook for responsive breakpoint detection.
 * Replaces the inline `mob` useState pattern from the original App.jsx.
 */

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mql.addEventListener("change", handler);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Convenience hook: returns true when viewport is below 768px (mobile). */
export function useMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
