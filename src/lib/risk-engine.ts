// ─── Types ──────────────────────────────────────────────────

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface CheckInData {
  mood: number; // 1-5
  energy: number; // 1-5
  sleepQuality: number; // 1-5
  stress: number; // 1-5
  workloadManageable: boolean;
  managerSupportPresent: boolean;
  childcareStable: boolean;
  performanceAnxiety: boolean;
}

export interface RiskResult {
  score: number;
  tier: RiskTier;
  factors: string[];
}

// ─── Tier Thresholds ────────────────────────────────────────

const TIER_THRESHOLDS: { max: number; tier: RiskTier }[] = [
  { max: 25, tier: "low" },
  { max: 50, tier: "medium" },
  { max: 75, tier: "high" },
  // Everything 76+ is critical (handled as default)
];

// ─── Trigger Actions ────────────────────────────────────────

const TRIGGER_ACTIONS: Record<RiskTier, string> = {
  low: "Continue current plan; no additional intervention needed.",
  medium:
    "Suggest coaching session; surface relevant toolkit resources and coping strategies.",
  high: "Prompt to book a coaching session; escalate to coach dashboard for proactive outreach.",
  critical:
    "Initiate crisis route; immediately notify assigned coach and surface emergency support resources.",
};

// ─── Risk Score Computation ─────────────────────────────────

/**
 * Compute a risk score based on the current week's check-in data,
 * optionally compared against the previous week's check-in.
 *
 * The score is an additive total of weighted risk factors.
 * Each contributing factor is recorded in the returned factors array.
 */
export function computeRiskScore(
  currentCheckIn: CheckInData,
  previousCheckIn: CheckInData | null
): RiskResult {
  let score = 0;
  const factors: string[] = [];

  // ── Mood drop from previous week ──
  if (previousCheckIn) {
    const moodDrop = previousCheckIn.mood - currentCheckIn.mood;
    if (moodDrop >= 2) {
      score += 20;
      factors.push(
        `Mood dropped by ${moodDrop} from previous week (${previousCheckIn.mood} -> ${currentCheckIn.mood})`
      );
    }
  }

  // ── Energy drop from previous week ──
  if (previousCheckIn) {
    const energyDrop = previousCheckIn.energy - currentCheckIn.energy;
    if (energyDrop >= 2) {
      score += 20;
      factors.push(
        `Energy dropped by ${energyDrop} from previous week (${previousCheckIn.energy} -> ${currentCheckIn.energy})`
      );
    }
  }

  // ── Low sleep quality ──
  if (currentCheckIn.sleepQuality <= 2) {
    score += 15;
    factors.push(
      `Sleep quality is critically low (${currentCheckIn.sleepQuality}/5)`
    );
  }

  // ── High stress ──
  if (currentCheckIn.stress >= 4) {
    score += 10;
    factors.push(`Stress level is elevated (${currentCheckIn.stress}/5)`);
  }

  // ── Workload not manageable ──
  if (!currentCheckIn.workloadManageable) {
    score += 10;
    factors.push("Workload reported as not manageable");
  }

  // ── Manager support absent ──
  if (!currentCheckIn.managerSupportPresent) {
    score += 10;
    factors.push("Manager support is not present");
  }

  // ── Childcare instability ──
  if (!currentCheckIn.childcareStable) {
    score += 15;
    factors.push("Childcare situation is unstable");
  }

  // ── Performance anxiety ──
  if (currentCheckIn.performanceAnxiety) {
    score += 10;
    factors.push("Experiencing performance anxiety");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine tier
  const tier = determineTier(score);

  return { score, tier, factors };
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Map a numeric risk score to its corresponding tier.
 */
function determineTier(score: number): RiskTier {
  for (const threshold of TIER_THRESHOLDS) {
    if (score <= threshold.max) {
      return threshold.tier;
    }
  }
  return "critical";
}

/**
 * Get the recommended trigger action for a given risk tier.
 */
export function getTriggerAction(tier: RiskTier): string {
  return TRIGGER_ACTIONS[tier];
}
