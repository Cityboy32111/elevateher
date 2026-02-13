/**
 * Personalization Engine
 *
 * Computes the user's current phase (1-5) and week number based on their
 * onboarding profile data. The 5 phases map to the maternity journey:
 *
 *   Phase 1: Late Pregnancy & Planning      (weeks 1-8)
 *   Phase 2: Leave & Early Postpartum       (weeks 9-20)
 *   Phase 3: Preparing to Return            (weeks 21-28)
 *   Phase 4: First 90 Days Back             (weeks 29-40)
 *   Phase 5: Sustained Reintegration        (weeks 41-52)
 */

interface PersonalizationInput {
  dueDate?: Date | string | null;
  childBirthDate?: Date | string | null;
  leaveStartDate?: Date | string | null;
  returnToWorkDate?: Date | string | null;
}

interface PersonalizationResult {
  phase: number;
  week: number;
}

const PHASE_RANGES = [
  { phase: 1, startWeek: 1, endWeek: 8 },
  { phase: 2, startWeek: 9, endWeek: 20 },
  { phase: 3, startWeek: 21, endWeek: 28 },
  { phase: 4, startWeek: 29, endWeek: 40 },
  { phase: 5, startWeek: 41, endWeek: 52 },
];

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function weeksBetween(a: Date, b: Date): number {
  const diffMs = b.getTime() - a.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function clampWeek(week: number): number {
  return Math.max(1, Math.min(52, week));
}

function phaseForWeek(week: number): number {
  const clamped = clampWeek(week);
  for (const range of PHASE_RANGES) {
    if (clamped >= range.startWeek && clamped <= range.endWeek) {
      return range.phase;
    }
  }
  return 5; // fallback to last phase
}

/**
 * Compute the user's current phase and week in the program based on
 * their key dates. The logic follows this priority:
 *
 * 1. If returnToWorkDate is in the past, compute weeks since return (Phase 4-5).
 * 2. If childBirthDate exists, compute weeks since birth (Phase 2-5).
 * 3. If dueDate exists, compute weeks until due date to place in Phase 1-2.
 * 4. If leaveStartDate exists, use it as anchor for Phase 1-2.
 * 5. Fallback to Phase 1, Week 1.
 */
export function computePhaseAndWeek(
  input: PersonalizationInput
): PersonalizationResult {
  const now = new Date();
  const dueDate = toDate(input.dueDate);
  const birthDate = toDate(input.childBirthDate);
  const leaveStart = toDate(input.leaveStartDate);
  const returnDate = toDate(input.returnToWorkDate);

  // Priority 1: Already returned to work
  if (returnDate && returnDate <= now) {
    const weeksSinceReturn = weeksBetween(returnDate, now);
    const programWeek = clampWeek(29 + weeksSinceReturn); // Phase 4 starts at week 29
    return { phase: phaseForWeek(programWeek), week: programWeek };
  }

  // Priority 2: Child already born
  if (birthDate && birthDate <= now) {
    const weeksSinceBirth = weeksBetween(birthDate, now);
    const programWeek = clampWeek(9 + weeksSinceBirth); // Phase 2 starts at week 9
    return { phase: phaseForWeek(programWeek), week: programWeek };
  }

  // Priority 3: Has a due date (still pregnant)
  if (dueDate && dueDate > now) {
    const weeksUntilDue = weeksBetween(now, dueDate);
    // Phase 1 covers ~8 weeks before due. Map so week 8 = due date.
    const programWeek = clampWeek(8 - weeksUntilDue);
    return { phase: phaseForWeek(programWeek), week: programWeek };
  }

  // Priority 3b: Due date is in the past but no birth date recorded
  if (dueDate && dueDate <= now) {
    const weeksSinceDue = weeksBetween(dueDate, now);
    const programWeek = clampWeek(9 + weeksSinceDue);
    return { phase: phaseForWeek(programWeek), week: programWeek };
  }

  // Priority 4: Leave start date as anchor
  if (leaveStart) {
    if (leaveStart > now) {
      const weeksUntilLeave = weeksBetween(now, leaveStart);
      const programWeek = clampWeek(8 - weeksUntilLeave);
      return { phase: phaseForWeek(programWeek), week: programWeek };
    } else {
      const weeksSinceLeave = weeksBetween(leaveStart, now);
      const programWeek = clampWeek(9 + weeksSinceLeave);
      return { phase: phaseForWeek(programWeek), week: programWeek };
    }
  }

  // Fallback
  return { phase: 1, week: 1 };
}
