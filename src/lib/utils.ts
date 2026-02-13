import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";

// ─── Class Name Utility ─────────────────────────────────────

/**
 * Merge class names using clsx and tailwind-merge.
 * Handles conditional classes, arrays, and deduplicates Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date Formatting ────────────────────────────────────────

/**
 * Format a date value into a human-readable string.
 * Accepts Date objects, ISO strings, or timestamps.
 * Returns an empty string for invalid dates.
 *
 * @param date - The date to format
 * @param pattern - Optional date-fns format pattern (defaults to "MMM d, yyyy")
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  pattern: string = "MMM d, yyyy"
): string {
  if (date === null || date === undefined) {
    return "";
  }

  let parsedDate: Date;

  if (typeof date === "string") {
    parsedDate = parseISO(date);
  } else if (typeof date === "number") {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }

  if (!isValid(parsedDate)) {
    return "";
  }

  return format(parsedDate, pattern);
}

// ─── Phase Names ────────────────────────────────────────────

/**
 * Mapping of phase numbers (1-5) to their display names.
 * These correspond to the journey stages in the ElevateHer program.
 */
export const PHASE_NAMES: Record<number, string> = {
  1: "Late Pregnancy & Planning",
  2: "Pre-Leave Preparation",
  3: "On Leave",
  4: "First 90 Days Back",
  5: "Thriving & Sustaining",
} as const;

// ─── Onboarding Pick Lists ──────────────────────────────────

/**
 * Stressor options for the onboarding questionnaire.
 * Users select their top stressors from this list.
 */
export const STRESSOR_OPTIONS = [
  "Childcare logistics",
  "Sleep deprivation",
  "Manager relationship",
  "Career stagnation",
  "Work-life boundaries",
  "Pumping at work",
  "Financial pressure",
  "Identity shift",
  "Partner dynamics",
  "Guilt",
] as const satisfies readonly string[];

/**
 * Goal options for the onboarding questionnaire.
 * Users select their primary goals from this list.
 */
export const GOAL_OPTIONS = [
  "Stay in current role",
  "Ramp back faster",
  "Promotion readiness",
  "Reduce anxiety",
  "Set better boundaries",
  "Stabilize childcare",
  "Improve sleep",
  "Build confidence",
] as const satisfies readonly string[];
