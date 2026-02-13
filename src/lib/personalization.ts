import type { UserProfile } from "@/generated/prisma";
import {
  differenceInWeeks,
  isBefore,
  isAfter,
  isValid,
  startOfDay,
} from "date-fns";
import type { RiskTier } from "./risk-engine";

// ─── Phase Definitions ──────────────────────────────────────

/**
 * Phase boundaries define the date-based logic for determining which
 * phase a user is in relative to key life events.
 *
 * Phase 1: Late Pregnancy & Planning   (8+ weeks before due date)
 * Phase 2: Pre-Leave Preparation       (0-8 weeks before leave start)
 * Phase 3: On Leave                    (leave start to return-to-work date)
 * Phase 4: First 90 Days Back          (return date to return date + 12 weeks)
 * Phase 5: Thriving & Sustaining       (12+ weeks after return)
 */
const PHASE_DURATIONS_WEEKS: Record<number, number> = {
  1: 8, // 8 weeks of late pregnancy planning
  2: 8, // 8 weeks of pre-leave preparation
  3: 16, // ~16 weeks of leave (varies, this is a default)
  4: 12, // first 90 days back
  5: 8, // thriving and sustaining
};

// ─── Phase Determination ────────────────────────────────────

/**
 * Determine the current phase (1-5) for a user based on their profile dates.
 *
 * Uses the following date fields from UserProfile:
 * - dueDate: expected delivery date
 * - leaveStartDate: date maternity leave begins
 * - childBirthDate: actual date of birth
 * - returnToWorkDate: date of return to work
 *
 * Falls back to the stored `currentPhase` if dates are insufficient.
 */
export function determinePhase(profile: UserProfile): number {
  const today = startOfDay(new Date());

  const dueDate = profile.dueDate ? startOfDay(new Date(profile.dueDate)) : null;
  const leaveStart = profile.leaveStartDate
    ? startOfDay(new Date(profile.leaveStartDate))
    : null;
  const childBirth = profile.childBirthDate
    ? startOfDay(new Date(profile.childBirthDate))
    : null;
  const returnDate = profile.returnToWorkDate
    ? startOfDay(new Date(profile.returnToWorkDate))
    : null;

  // Phase 5: Thriving & Sustaining
  // More than 12 weeks after return to work
  if (returnDate && isValid(returnDate)) {
    const weeksAfterReturn = differenceInWeeks(today, returnDate);
    if (weeksAfterReturn > 12) {
      return 5;
    }

    // Phase 4: First 90 Days Back
    // Between return date and 12 weeks after
    if (!isBefore(today, returnDate)) {
      return 4;
    }
  }

  // Phase 3: On Leave
  // After leave start (or child birth) but before return date
  const leaveBegin = leaveStart || childBirth;
  if (leaveBegin && isValid(leaveBegin)) {
    if (!isBefore(today, leaveBegin)) {
      // On leave: either no return date set yet, or before return date
      if (!returnDate || isBefore(today, returnDate)) {
        return 3;
      }
    }
  }

  // Phase 2: Pre-Leave Preparation
  // Within 8 weeks before leave start date (or due date as fallback)
  const preLeaveRef = leaveStart || dueDate;
  if (preLeaveRef && isValid(preLeaveRef)) {
    const weeksUntilLeave = differenceInWeeks(preLeaveRef, today);
    if (weeksUntilLeave >= 0 && weeksUntilLeave <= 8) {
      return 2;
    }
  }

  // Phase 1: Late Pregnancy & Planning
  // More than 8 weeks before leave/due date, or due date is set and in the future
  if (dueDate && isValid(dueDate) && isAfter(dueDate, today)) {
    return 1;
  }

  // Fallback: use stored phase from profile
  return profile.currentPhase || 1;
}

// ─── Week Number Computation ────────────────────────────────

/**
 * Compute the current week number within the user's active phase.
 *
 * Returns a 1-based week number. The calculation is based on the
 * elapsed time since the phase's reference start date.
 */
export function computeWeekNumber(profile: UserProfile): number {
  const phase = determinePhase(profile);
  const today = startOfDay(new Date());

  let phaseStartDate: Date | null = null;

  switch (phase) {
    case 1: {
      // Phase 1 starts ~8 weeks before the pre-leave reference date
      const ref = profile.leaveStartDate
        ? startOfDay(new Date(profile.leaveStartDate))
        : profile.dueDate
          ? startOfDay(new Date(profile.dueDate))
          : null;
      if (ref && isValid(ref)) {
        phaseStartDate = new Date(ref.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
      }
      break;
    }
    case 2: {
      // Phase 2 starts 8 weeks before leave/due date
      const ref = profile.leaveStartDate
        ? startOfDay(new Date(profile.leaveStartDate))
        : profile.dueDate
          ? startOfDay(new Date(profile.dueDate))
          : null;
      if (ref && isValid(ref)) {
        phaseStartDate = new Date(ref.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
      }
      break;
    }
    case 3: {
      phaseStartDate = profile.leaveStartDate
        ? startOfDay(new Date(profile.leaveStartDate))
        : profile.childBirthDate
          ? startOfDay(new Date(profile.childBirthDate))
          : null;
      break;
    }
    case 4: {
      phaseStartDate = profile.returnToWorkDate
        ? startOfDay(new Date(profile.returnToWorkDate))
        : null;
      break;
    }
    case 5: {
      // Phase 5 starts 12 weeks after return
      if (profile.returnToWorkDate) {
        const returnDate = startOfDay(new Date(profile.returnToWorkDate));
        if (isValid(returnDate)) {
          phaseStartDate = new Date(
            returnDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000
          );
        }
      }
      break;
    }
  }

  if (!phaseStartDate || !isValid(phaseStartDate)) {
    return profile.currentWeek || 1;
  }

  const elapsed = differenceInWeeks(today, phaseStartDate);
  const maxWeeks = PHASE_DURATIONS_WEEKS[phase] || 8;

  // Clamp to valid range: 1 to maxWeeks
  return Math.max(1, Math.min(elapsed + 1, maxWeeks));
}

// ─── Content Tag Generation ─────────────────────────────────

/**
 * Generate an array of content tags for filtering personalized content.
 *
 * Tags are derived from the user's profile attributes (phase, role level,
 * work mode, stressors, goals) and optionally influenced by the current
 * risk tier to surface more relevant support content.
 */
export function getContentTags(
  profile: UserProfile,
  riskTier?: RiskTier
): string[] {
  const tags: string[] = [];

  // Phase tag
  const phase = determinePhase(profile);
  tags.push(`phase:${phase}`);

  // Week tag
  const week = computeWeekNumber(profile);
  tags.push(`week:${week}`);

  // Role level
  if (profile.roleLevel) {
    tags.push(`role:${profile.roleLevel}`);
  }

  // Role function
  if (profile.roleFunction) {
    tags.push(`function:${profile.roleFunction}`);
  }

  // Work mode
  if (profile.workMode) {
    tags.push(`work_mode:${profile.workMode}`);
  }

  // Company type
  if (profile.companyType) {
    tags.push(`company:${profile.companyType}`);
  }

  // Support system level
  if (profile.supportSystem) {
    tags.push(`support:${profile.supportSystem}`);
  }

  // Childcare situation
  if (profile.childcareSituation) {
    tags.push(`childcare:${profile.childcareSituation}`);
  }

  // Top stressors (stored as JSON array string)
  if (profile.topStressors) {
    try {
      const stressors: string[] = JSON.parse(profile.topStressors);
      for (const stressor of stressors) {
        tags.push(`stressor:${stressor.toLowerCase().replace(/\s+/g, "_")}`);
      }
    } catch {
      // Silently skip malformed JSON
    }
  }

  // Goals (stored as JSON array string)
  if (profile.goals) {
    try {
      const goals: string[] = JSON.parse(profile.goals);
      for (const goal of goals) {
        tags.push(`goal:${goal.toLowerCase().replace(/\s+/g, "_")}`);
      }
    } catch {
      // Silently skip malformed JSON
    }
  }

  // Risk-tier-specific tags for content prioritization
  if (riskTier) {
    tags.push(`risk:${riskTier}`);

    // Surface additional support content for elevated risk
    if (riskTier === "high" || riskTier === "critical") {
      tags.push("priority:urgent_support");
      tags.push("content:coping_strategies");
    }

    if (riskTier === "critical") {
      tags.push("content:crisis_resources");
    }

    if (riskTier === "medium") {
      tags.push("content:coaching_recommended");
    }
  }

  // Manager support level influences content
  if (
    profile.managerSupportLevel !== null &&
    profile.managerSupportLevel !== undefined
  ) {
    if (profile.managerSupportLevel <= 2) {
      tags.push("content:manager_scripts");
      tags.push("support:low_manager");
    } else if (profile.managerSupportLevel >= 4) {
      tags.push("support:strong_manager");
    }
  }

  return tags;
}
